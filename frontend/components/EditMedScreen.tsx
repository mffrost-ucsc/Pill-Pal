/**
 * This component is essentially the same as AddMedication except it handles editing the medication
 */

import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View, Alert} from 'react-native';
import {Button} from '@rneui/themed';
import DropDownPicker from 'react-native-dropdown-picker';
import realm, { Reminder } from '../realm/models';
import {Medication} from '../realm/models';
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {IsMedReminderContext} from './IsMedReminderContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import { EditMedReminder, setReminder } from './EditMedReminder';
import { setReminderNoStore } from './MedReminder';
import { IsRefillReminderContext } from './IsRefillReminderContext';
import { RefillInfoContext } from './RefillInfoContext';
import { RefillReminder } from './RefillReminder';
import {ServerAddr, ServerPort} from '../communication';
import { EditMedContext } from './EditMedContext';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import moment from 'moment'; // for formatting date
import { SafeAreaView } from 'react-native-safe-area-context';
import { useObject } from '@realm/react';
import {logAsked, logTaken} from '../log';
import { v4 as uuidv4 } from 'uuid';

function EditMedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const editMedContext = React.useContext(EditMedContext);
  const thisMed = useObject(Medication, editMedContext!.medId);
  const [medName, setMedName] = useState('');
  const [dosageAmount, setDosageAmount] = useState('');
  const [exInfo, setExInfo] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [value, setValue] = useState('');
  const [timeBetweenDose, setTimeBetweenDose] = React.useState(NaN); // for as needed meds
  const [items, setItems] = useState([
    {label: 'Daily', value: 'daily'},
    {label: 'Weekly', value: 'weekly'},
    {label: 'As Needed', value: 'asNeeded'}
  ]);
  const medReminderTimesContext = React.useContext(MedReminderTimesContext);
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const medFrequencyContext = React.useContext(MedFrequencyContext); // index 1 is interval (daily, weekly, asNeeded), index 0 is number of times per interval
  const isRefillReminderContext = React.useContext(IsRefillReminderContext);
  const refillInfoContext = React.useContext(RefillInfoContext); // index 0 = refillAmount, 1 = refillReminderCount, 2 = pillCount
  const authToken = storage.getString('userToken');
  const { signOut } = React.useContext(AuthenticationContext);

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

  const updateDbReminder = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data = {
      ReminderID: newData._id,
      MedicationID: newData.medId,
      Hour: newData.hour,
      Minute: newData.minute,
      Day: newData.day,
      Modified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss')
    };

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`};
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/reminder';

    fetch(url, 
      {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      console.log('reminder updated sucessfully');
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });
  }

  const editMedInDb = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data = {
      MedicationID: newData._id,
      Name: newData.name,
      Dosage: newData.dosage.amountPerDose,
      Frequency: newData.dosage.interval.charAt(0),
      TimesPerInterval: newData.dosage.timesPerInterval,
      AdditionalInfo: newData.extraInfo,
      TimeBetweenDose: newData.dosage.timeBetweenDose,
      Modified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss')
    };

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/medication';

    fetch(url, 
      {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      console.log('prescription edited sucessfully');
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });
  }

  const editMed = async () => {
    const isRefillReminderVal = isRefillReminderContext!.isRefillReminder;
    const dayMap:Record<any, number> = {'Su': 0, 'Mo': 1, 'Tu': 2, 'We': 3, 'Th': 4, 'Fr': 5, 'Sa': 6};

    // check for any empty required fields
    if (medName == '' || dosageAmount == '' || !medFrequencyContext!.medFrequency[1] || (Number.isNaN(medFrequencyContext!.medFrequency[0]) && medFrequencyContext!.medFrequency[1] != 'asNeeded') || (medFrequencyContext!.medFrequency[1] == 'asNeeded' && Number.isNaN(timeBetweenDose))) {
      Alert.alert('Unfinished Data Entry', 'Please fill in the required fields.', [{text: 'OK'}]);
      return;
    }

    if (isRefillReminderVal) {
      if (Number.isNaN(refillInfoContext!.refillInfo[0]) || Number.isNaN(refillInfoContext!.refillInfo[1]) || Number.isNaN(refillInfoContext!.refillInfo[2])) {
        Alert.alert('Unfinished Data Entry', 'Please fill in the Refill Reminder fields properly.', [{text: 'OK'}]);
        return;
      }
    }

    // check reminder fields are correct
    const reminderTimes = medReminderTimesContext!.medReminderTimes;
    if (isMedReminderContext!.isMedReminder) {
      for (const rem of reminderTimes) {
        if (!(medFrequencyContext!.medFrequency[1] &&
          rem.period && (rem.hours <= 12) &&
          (rem.hours > 0) && (rem.mins <= 60) &&
          (rem.mins >= 0) &&
          ((medFrequencyContext!.medFrequency[1] == 'weekly') ? (rem.day >= 0) : true)))
        {
          Alert.alert('Unfinished or Invalid Data Entry', 'Please fill in the Reminder fields properly.', [{text: 'OK'}]);
          return;
        }
      }
    }


    // edit realm entry
    if (thisMed) {
      realm.write(() => {
          thisMed.name = medName;
          thisMed.dosage.amountPerDose = Number(dosageAmount);
          thisMed.dosage.interval = medFrequencyContext!.medFrequency[1];
          thisMed.dosage.timesPerInterval = medFrequencyContext!.medFrequency[0];
          thisMed.dosage.timeBetweenDose = timeBetweenDose;
          thisMed.takeReminder = isMedReminderContext!.isMedReminder;
          thisMed.extraInfo = exInfo;
          thisMed.lastModified = new Date();
      });

      // edit med in database
      editMedInDb(JSON.parse(JSON.stringify(thisMed)));

      // edit reminders
      let reminders = realm.objects(Reminder).filtered('userId = $0 && medId = $1', storage.getInt('currentUser'), thisMed._id);

      // delete reminders until list lengths are the same
      while (reminders.length > reminderTimes.length) {
        deleteReminder(reminders[0]);
        reminders = realm.objects(Reminder).filtered('userId = $0 && medId = $1', storage.getInt('currentUser'), thisMed._id);
      }

      // update current reminders
      for (let i = 0; i < reminders.length; i++) {
        const rem = reminders[i];
        let hours = Number(reminderTimes[i].hours);
        const mins = Number(reminderTimes[i].mins);

        // format times
        if (reminderTimes[i].period == 'PM' && hours != 12) {
          hours += 12;
        } else if (reminderTimes[i].period == 'AM' && hours == 12) {
          hours = 0;
        }
  
        // write to realm
        realm.write(() => {
          rem.hour = hours;
          rem.minute = mins;
          rem.day = dayMap[reminderTimes[i].day];
          rem.lastModified = new Date();
        })

        // update database
        const updatedReminder = realm.objects(Reminder).filtered('_id = $0', rem._id);

        if (updatedReminder[0]) {
          updateDbReminder(updatedReminder[0]);

          // update reminders
          setReminderNoStore(updatedReminder[0], taken => {
            logAsked(realm, thisMed);
            if (taken) {
              logTaken(realm, thisMed);
            }
          })
        }
      }
      
      // if more reminders than before, add them
      let reminderIds = (thisMed.reminderId) ? [... thisMed.reminderId] : [];
      for (let i = reminders.length; i < medReminderTimesContext!.medReminderTimes.length; i++) {
        const newId = uuidv4();
        reminderIds.push(newId);
        setReminder(
          i,
          newId,
          thisMed,
          dosageAmount,
          medFrequencyContext!.medFrequency[1],
          medReminderTimesContext!.medReminderTimes,
          authToken,
          taken => {
            logAsked(realm, thisMed);
            if (taken) {
              logTaken(realm, thisMed);
            }
          },
        );
      }

      // update reminderId entry
      realm.write(() => {
        thisMed.reminderId = reminderIds;
      });
    }

    // reset fields
    setMedName('');
    setDosageAmount('');
    medFrequencyContext!.setMedFrequency([NaN, '']);
    setValue('');
    setExInfo('');
    isMedReminderContext!.setIsMedReminder(false);
    if (medReminderTimesContext) {
      medReminderTimesContext.setMedReminderTimes([]);
    }
    isRefillReminderContext!.setIsRefillReminder(false);
    refillInfoContext?.setRefillInfo([NaN, NaN, NaN]);
    console.log('med edited');

    Alert.alert('Medication Edited', `${(thisMed) ? thisMed.name : 'Medication'} upated successfully.`, [{text: 'OK'}]);
    navigation.navigate('Home');
  };

  const setFrequency = (newVal:number) => {
    //setDosageFrequency(newVal);
    const newTuple:[number, string] = [... medFrequencyContext!.medFrequency];

    if (newVal != 0) {
      newTuple[0] = newVal;
    } else {
      newTuple[0] = NaN;
    }

    medFrequencyContext!.setMedFrequency(newTuple);
  }

  // set fields to match the med being edited
  React.useEffect(() => {
    if (thisMed) {
      setMedName(thisMed.name);
      setDosageAmount(String(thisMed.dosage.amountPerDose));
      setExInfo(thisMed.extraInfo!);
      setValue(thisMed.dosage.interval!);
      isMedReminderContext!.setIsMedReminder(thisMed.takeReminder);
      isRefillReminderContext!.setIsRefillReminder(thisMed.refillReminder);
      medFrequencyContext!.setMedFrequency([thisMed.dosage.timesPerInterval!, thisMed.dosage.interval!]);

      if (thisMed.dosage.timeBetweenDose != undefined) {
        setTimeBetweenDose(thisMed.dosage.timeBetweenDose);
      }
    }
  }, [editMedContext?.medId]);

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{rowGap: 10}} style={{paddingTop: '5%'}}>
        <View style={{flexDirection: 'row', gap: 10}}>
          <Text>{'Medication Name:'}</Text>
          <TextInput
            onChangeText={setMedName}
            value={medName}
            placeholder="Med Name"
          />
        </View>
        <View style={{flexDirection: 'row', gap: 10}}>
          <Text>{'Amount Taken Per Dose:'}</Text>
          <TextInput
            onChangeText={setDosageAmount}
            value={dosageAmount}
            inputMode='numeric'
            placeholder="Amount Per Dose"
          />
        </View>
        <Text>{'How Often Medication is Taken:'}</Text>
        <DropDownPicker
          open={dropdownOpen}
          value={value}
          items={items}
          setOpen={setDropdownOpen}
          setValue={setValue}
          onChangeValue={(val) => {medFrequencyContext!.setMedFrequency([medFrequencyContext!.medFrequency[0], (val ? val : '')])}}
          setItems={setItems}
          listMode="SCROLLVIEW"
          containerStyle={{
            zIndex: dropdownOpen ? 1000 : 0
          }}
        />
        <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap', display: (medFrequencyContext!.medFrequency[1] == 'asNeeded') ? 'none' : 'flex'}}>
          <Text>{'How Many Times Per Day/Week:'}</Text>
          <TextInput
            onChangeText={newVal => setFrequency(Number(newVal))}
            value={(Number.isNaN(medFrequencyContext!.medFrequency[0])) ? '' : String(medFrequencyContext!.medFrequency[0])}
            inputMode='numeric'
            placeholder="Times Per Interval"
          />
        </View>
        <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap', display: (medFrequencyContext!.medFrequency[1] == 'asNeeded') ? 'flex' : 'none'}}>
          <Text>{'Time Between Doses (Hours):'}</Text>
          <TextInput
            onChangeText={(newVal) => setTimeBetweenDose(Number(newVal))}
            value={(Number.isNaN(timeBetweenDose)) ? '' : String(timeBetweenDose)}
            inputMode='numeric'
            placeholder="Time Between Doses"
          />
        </View>
        <View style={{flexDirection: 'row', gap: 10}}>
          <Text>{'Additional Info'}</Text>
          <TextInput
            onChangeText={setExInfo}
            value={exInfo}
            placeholder="Additional Info"
          />
        </View>
        <EditMedReminder/>
        <RefillReminder/>
        <Button
          title="Edit Med"
          onPress={editMed}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditMedScreen;


