/**
 * This component handles adding a new medication. 
 * References: 
 *  - https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 *  - https://hossein-zare.github.io/react-native-dropdown-picker-website/docs/usage
 *  - https://reactnativeelements.com/docs/components/checkbox
 */

import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View, Alert} from 'react-native';
import {Button} from '@rneui/themed';
import DropDownPicker from 'react-native-dropdown-picker';
import realm from '../realm/models';
import {Medication} from '../realm/models';
import { v4 as uuidv4 } from 'uuid';
import { BSON } from 'realm';
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {IsMedReminderContext} from './IsMedReminderContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import {MedReminder, setReminder} from './MedReminder';
import { IsRefillReminderContext } from './IsRefillReminderContext';
import { RefillInfoContext } from './RefillInfoContext';
import { RefillReminder } from './RefillReminder';
import {logAsked, logTaken} from '../log';
import {ServerAddr, ServerPort} from '../communication';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import moment from 'moment'; // for formatting date

function AddMedication() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [medName, setMedName] = useState('');
  const [dosageAmount, setDosageAmount] = useState('');
  const [exInfo, setExInfo] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: 'Daily', value: 'daily'},
    {label: 'Weekly', value: 'weekly'},
    {label: 'As Needed', value: 'asNeeded'}
  ]);
  const [timeBetweenDose, setTimeBetweenDose] = React.useState(NaN); // for as needed meds
  const medReminderTimesContext = React.useContext(MedReminderTimesContext);
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const medFrequencyContext = React.useContext(MedFrequencyContext);
  const isRefillReminderContext = React.useContext(IsRefillReminderContext);
  const refillInfoContext = React.useContext(RefillInfoContext); // index 0 = refillAmount, 1 = refillReminderCount, 2 = pillCount
  const authToken = storage.getString('userToken');
  const { signOut } = React.useContext(AuthenticationContext);

  const addMedToDb = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data = {
      MedicationID: newData._id,
      Name: newData.name,
      Dosage: newData.dosage.amountPerDose,
      Frequency: newData.dosage.interval.charAt(0),
      TimesPerInterval: newData.dosage.timesPerInterval,
      AdditionalInfo: newData.extraInfo,
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
        method: 'PUT',
        headers: header,
        body: JSON.stringify(data),
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      console.log('prescription added sucessfully');
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

  const addMed = async () => {
    const id = new BSON.UUID();
    let med:any;
    const isRefillReminderVal = isRefillReminderContext!.isRefillReminder;
    let reminderIds : string[] = [];

    // check for any empty required fields
    if (medName == '' || dosageAmount == '' || !medFrequencyContext!.medFrequency[1] || (Number.isNaN(medFrequencyContext!.medFrequency[0]) && medFrequencyContext!.medFrequency[1] != 'asNeeded')) {
      Alert.alert('Unfinished Data Entry', 'Please fill in the required fields.', [{text: 'OK'}]);
      return;
    }

    if (isRefillReminderVal) {
      if (Number.isNaN(refillInfoContext!.refillInfo[0]) || Number.isNaN(refillInfoContext!.refillInfo[1]) || Number.isNaN(refillInfoContext!.refillInfo[2])) {
        Alert.alert('Unfinished Data Entry', 'Please fill in the Refill Reminder fields properly.', [{text: 'OK'}]);
        return;
      }
    }

    // add med to realm without reminders
    realm.write(() => {
      med = realm.create(Medication, {
        _id: id,
        userId: storage.getInt('currentUser'),
        name: medName,
        dosage: {amountPerDose: dosageAmount, interval: medFrequencyContext!.medFrequency[1], timesPerInterval: medFrequencyContext!.medFrequency[0]},
        extraInfo: exInfo,
        takeReminder: isMedReminderContext!.isMedReminder,
        reminderId: [],
        refillReminder: isRefillReminderVal,
        refillAmount: (isRefillReminderVal) ? refillInfoContext!.refillInfo[0] : undefined,
        refillReminderCount: (isRefillReminderVal) ? refillInfoContext!.refillInfo[1] : undefined,
        pillCount: (isRefillReminderVal) ? refillInfoContext!.refillInfo[2] : undefined,
      });
    });

    // if med is as needed add timeBetweenDose
    if (medFrequencyContext!.medFrequency[1] == 'asNeeded') {
      realm.write(() => {
        med.dosage.timeBetweenDose = timeBetweenDose;
      })
    }

    // set up reminders
    if (isMedReminderContext!.isMedReminder) {
      for (let i = 0; i < medReminderTimesContext!.medReminderTimes.length; i++) {
        if (medFrequencyContext!.medFrequency[1] &&
          medReminderTimesContext!.medReminderTimes[i] &&
          medReminderTimesContext!.medReminderTimes[i].period &&
          medReminderTimesContext!.medReminderTimes[i].hours <= 12 &&
          medReminderTimesContext!.medReminderTimes[i].hours > 0 &&
          medReminderTimesContext!.medReminderTimes[i].mins <= 60 &&
          medReminderTimesContext!.medReminderTimes[i].mins >= 0 &&
          ((medFrequencyContext!.medFrequency[1] == 'weekly') ? (medReminderTimesContext!.medReminderTimes[i].day >= 0) : true)) {
            const newId = uuidv4();
            reminderIds.push(newId);
            setReminder(
              i,
              newId,
              medName,
              dosageAmount,
              medFrequencyContext!.medFrequency[1],
              medReminderTimesContext!.medReminderTimes,
              taken => {
                logAsked(realm, med);
                if (taken) {
                  logTaken(realm, med);
                }
              },
            );
        } else {
          Alert.alert('Unfinished or Invalid Data Entry', 'Please fill in the Reminder fields properly.', [{text: 'OK'}]);
          const times = JSON.stringify(medReminderTimesContext!.medReminderTimes);
          console.log('Med reminder times: ' + times);
          return;
        }
      }
    }

    // update realm entry to include reminder ids
    realm.write(() => {
      med.reminderId = reminderIds;
    });

    // add med to database
    const realmEntry = realm.objects(Medication).filtered('_id = $0', id);
    addMedToDb(JSON.parse(JSON.stringify(realmEntry[0])));

    // reset fields
    setMedName('');
    setDosageAmount('');
    medFrequencyContext!.setMedFrequency([NaN, '']);
    setValue(null);
    setExInfo('');
    setTimeBetweenDose(NaN);
    isMedReminderContext!.setIsMedReminder(false);
    medReminderTimesContext!.setMedReminderTimes([]);
    isRefillReminderContext!.setIsRefillReminder(false);
    refillInfoContext?.setRefillInfo([NaN, NaN, NaN]);
    console.log('med added');

    Alert.alert('Medication Added Successfully', 'Would you like to add another medication?',
      [
        {
          text: 'Yes',
        },
        {
          text: 'No',
          onPress: () => navigation.navigate('Home')
        }
      ],
      {
        cancelable: true,
        onDismiss: () => navigation.navigate('Home')  
      },
    );
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

  return (
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
        <Text>{'Number of Hours Between Doses:'}</Text>
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
      <MedReminder/>
      <RefillReminder/>
      <Button
        title="Add Med"
        onPress={addMed}
      />
    </ScrollView>
  );
};

export default AddMedication;
