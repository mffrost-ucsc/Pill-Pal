/**
 * This componenet will display a list of the user's current medications
 * It will pull from local storage to do this
 *
 * References:
 *  - https://reactnativeelements.com/docs/components/listItem_accordion#props
 *  - https://stackoverflow.com/questions/75057902/how-to-expand-only-one-item-from-a-list-item-accordion-in-react-native
 *
 * If there is trouble seeing icons, follow the installation instructions on https://github.com/oblador/react-native-vector-icons?tab=readme-ov-file#installation
 */

import React from 'react';
import {useQuery} from '@realm/react';
import {ScrollView, View, Alert} from 'react-native';
import {ListItem, Text, Icon} from '@rneui/themed';
import {Medication, Reminder} from '../realm/models';
import {ServerAddr, ServerPort} from '../communication';
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { EditMedContext } from './EditMedContext';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import realm from '../realm/models';
import notifee from '@notifee/react-native';


function MedList() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const editMedContext = React.useContext(EditMedContext);
  const [expanded, setExpanded] = React.useState([0]); // array of currently expanded items
  const medList = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0', storage.getInt('currentUser'));
  });
  const reminders = useQuery(Reminder, (r) => {
    return r.filtered('userId = $0', storage.getInt('currentUser'));
  });
  const { signOut } = React.useContext(AuthenticationContext);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const deleteReminder = (reminder:any) => {
    // delete reminder from database
    let url = 'http://' + ServerAddr + ':' + ServerPort + '/reminder';
    const authToken = storage.getString('userToken');
    let header:any = {'Content-Type': 'application/json'};

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
    } else {
      Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
      signOut();
    }

    console.log(JSON.stringify({ReminderID: reminder._id}));
    fetch(url, 
      {
        method: 'DELETE',
        headers: header,
        body: JSON.stringify({ReminderID: reminder._id}),
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      console.log('reminder deleted from server');
      return;
    })
    .catch((error) => {
      if (error.message == 'Network request failed' || error.status == 404) {
        Alert.alert('Connection Failed', 'Connection to the server failed. On next login, you may need to redelete this medication.', [{text: 'OK'}]);
      } else if (error.status == 401) {
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });

    // delete reminder from realm
    realm.write(() => {
      realm.delete(reminder);
    });
    console.log('reminder deleted from realm');

    return;
  }

  const deleteMed = (med:any) => {
    // delete any reminders associated to med
    const reminderIds = med.reminderId;
    for (const remId of reminderIds) {
      const reminder = realm.objects(Reminder).filtered('_id = $0', remId);
      deleteReminder(reminder);
      notifee.cancelNotification(remId);
    }

    // delete med from database
    let url = 'http://' + ServerAddr + ':' + ServerPort + '/medication';
    const authToken = storage.getString('userToken');
    let header:any = {'Content-Type': 'application/json'};

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
    } else {
      Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
      signOut();
    }

    fetch(url, 
      {
        method: 'DELETE',
        headers: header,
        body: JSON.stringify({MedicationID: med._id}),
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      console.log('med deleted from server');
      return;
    })
    .catch((error) => {
      if (error.message == 'Network request failed' || error.status == 404) {
        Alert.alert('Connection Failed', 'Connection to the server failed. On next login, you may need to redelete this medication.', [{text: 'OK'}]);
      } else if (error.status == 401) {
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });

    // delete med from realm
    realm.write(() => {
      realm.delete(med);
    });
    console.log('med deleted from realm');

    setExpanded([]); // closes all opened accordions
    return;
  }

  const editMed = (med:any) => {
    editMedContext!.setMedId(med._id);
    navigation.navigate('Edit Medication');
  }

  const formatTime = (reminder:any) => {
    let date = new Date();
    date.setHours(reminder.hour);
    date.setMinutes(reminder.minute);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  React.useEffect(() => {
    setExpanded([]);
  }, [setExpanded]);

  return(
    <ScrollView>
      <Text h4 style={{paddingTop: '5%', paddingBottom: '2%'}}>Current Medications:</Text>
      { (medList.length == 0) ?
      <Text>You currently have no medications. Use the side menu to navigate to 'Add Medication'</Text> :
      medList.map((med, i) => (
        <ListItem.Accordion
          key={i}
          icon={{name:'chevron-down', type:'material-community'}}
          content={
            <>
              <ListItem.Content>
                <ListItem.Title>{med.name}</ListItem.Title>
                { 
                  (med.dosage.interval == 'asNeeded') ?
                    <ListItem.Subtitle>
                      {`Take ${(med.dosage.amountPerDose == 1) ? '1 pill' : med.dosage.amountPerDose + ' pills'} ${(med.dosage.timeBetweenDose) ? ((med.dosage.timeBetweenDose == 1) ? 'every hour ' : 'every ' + med.dosage.timeBetweenDose + ' hours ') : ''}as needed`}
                    </ListItem.Subtitle>
                  :
                  <ListItem.Subtitle>
                    {`Take ${(med.dosage.amountPerDose == 1) ? '1 pill' : med.dosage.amountPerDose + ' pills'} ${(med.dosage.timesPerInterval == 1) ? 'once' : med.dosage.timesPerInterval + ' times'} per ${(med.dosage.interval == 'daily') ? 'day' : 'week'}`}
                  </ListItem.Subtitle>
                }
              </ListItem.Content>
            </>
          }
          isExpanded={expanded.includes(i)}
          onPress={() => {
            if (expanded.includes(i)) {
              setExpanded(expanded.filter((index) => i !== index));
            } else {
              setExpanded([...expanded, i]);
            }
          }}
        >
          <Text style={{padding: '4%'}}>
            Additional Info: {(med.extraInfo) ? med.extraInfo : "None"}
          </Text>
          <View style={{paddingHorizontal: '4%', paddingBottom: '4%'}}>
            <Text>
              Reminders:
            </Text>
            { (med.takeReminder) ?
              reminders.filtered('medId = $0', med._id).map((reminder, j) => (
                <Text key={`med ${med._id} reminder${j}`} style={{paddingHorizontal: '6%', paddingTop: '2%'}}>
                  {`Reminder ${j + 1}: Every ${(med.dosage.interval == 'weekly' && reminder.day != undefined) ? days[reminder.day] : 'day'} at ${formatTime(reminder)}`}
                </Text>
              )) :
              <Text style={{paddingHorizontal: '6%'}}>No reminders are set for this medication.</Text>
            }
          </View>
          <View style={{paddingHorizontal: '4%', paddingBottom: '4%'}}>
            <Text>
              Refill Reminder:
            </Text>
            { (med.refillReminder) ?
              <>
                <Text style={{paddingHorizontal: '6%', paddingTop: '2%'}}>{`Refill Amount: ${med.refillAmount}`}</Text>
                <Text style={{paddingHorizontal: '6%', paddingTop: '2%'}}>{`Pills Left Before Reminder: ${med.refillReminderCount}`}</Text>
                <Text style={{paddingHorizontal: '6%', paddingTop: '2%'}}>{`Current Pill Count: ${med.pillCount}`}</Text>
              </>
              :
              <Text style={{paddingHorizontal: '6%'}}>Refill reminders are not set up for this medication.</Text>
            }
          </View>
          <View style={{flexDirection: 'row', gap: 50, paddingHorizontal: '4%', paddingVertical: '2%'}}>
            <Icon
              name='trash-can-outline'
              type='material-community'
              onPress={() => {
                Alert.alert('Confirm Deletion', `Are you sure you want to delete ${med.name}?`,
                  [
                    {
                      text: 'Yes',
                      onPress: () => deleteMed(med),
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    }
                  ],
                );
              }}
            />
            <Icon
              name='pencil'
              type='material-community'
              onPress={() => editMed(med)}
            />
          </View>
        </ListItem.Accordion>
      ))
      }
    </ScrollView>
  );
}

export default MedList;
