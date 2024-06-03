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
import {Medication} from '../realm/models';
import {ServerAddr, ServerPort} from '../communication';
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { EditMedContext } from './EditMedContext';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import realm from '../realm/models';

function MedList() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const editMedContext = React.useContext(EditMedContext);
  const [expanded, setExpanded] = React.useState([0]); // array of currently expanded items
  const medList = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0', storage.getInt('currentUser'));
  });
  const { signOut } = React.useContext(AuthenticationContext);

  React.useEffect(() => {
    setExpanded([]);
  }, [setExpanded]);

  const deleteMed = (med:any) => {
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

    return;
  }

  const editMed = (med:any) => {
    editMedContext!.setMedId(med._id);
    navigation.navigate('Edit Medication');
  }

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
                      {`Take ${(med.dosage.amountPerDose == 1) ? '1 pill' : med.dosage.amountPerDose + ' pills'} as needed`}
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
              setExpanded(expanded.filter(i => i !== i));
            } else {
              setExpanded([...expanded, i]);
            }
          }}
        >
          <Text style={{padding: '4%'}}>
            Additional Info: {(med.extraInfo) ? med.extraInfo : "None"}
          </Text>
          <View style={{flexDirection: 'row', gap: 50, paddingHorizontal: '4%', paddingBottom: '2%'}}>
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
