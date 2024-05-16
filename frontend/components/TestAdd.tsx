/**
 * This is just a test component to see if the realm is working correctly
 * References: 
 *  - https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 *  - https://hossein-zare.github.io/react-native-dropdown-picker-website/docs/usage
 *  - https://reactnativeelements.com/docs/components/checkbox
 */

import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View, Alert} from 'react-native';
import {Button} from '@rneui/themed';
import DropDownPicker from 'react-native-dropdown-picker';
import {useRealm} from '@realm/react';
import {Medication} from '../realm/models';
import { v4 as uuidv4 } from 'uuid';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {IsMedReminderContext} from './IsMedReminderContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import {MedReminder, setReminder} from './MedReminder';
import {logAsked, logTaken} from '../log';

export const TestAdd = () => {
  const realm = useRealm();
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
  const medReminderTimesContext = React.useContext(MedReminderTimesContext);
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const medFrequencyContext = React.useContext(MedFrequencyContext);

  const addMed = async () => {
    let med: Medication;
    realm.write(() => {
      med = realm.create(Medication, {
        name: medName,
        dosage: {amountPerDose: dosageAmount, interval: medFrequencyContext!.medFrequency[1], timesPerInterval: medFrequencyContext!.medFrequency[0]},
        extraInfo: exInfo,
        takeReminder: isMedReminderContext!.isMedReminder,
        reminderId: [],
      });
    });

    let reminderIds : string[] = [];
    // set up reminders
    if (isMedReminderContext!.isMedReminder) {
      for (let i = 0; i < medReminderTimesContext!.medReminderTimes.length; i++) {
        if (medFrequencyContext!.medFrequency[1] && medReminderTimesContext!.medReminderTimes[i] /*&& medReminderTimesContext!.medReminderTimes[i].hour <= 12 && medReminderTimesContext!.medReminderTimes[i].hour > 0 && medReminderTimesContext!.medReminderTimes[i].min <= 60 && medReminderTimesContext!.medReminderTimes[i].min >= 0 && ((medFrequencyContext!.medFrequency[1] == 'weekly') ? (medReminderTimesContext!.medReminderTimes[i].day.length > 0) : true)*/) {
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

    realm.write(() => {
      med.reminderId = reminderIds;
    });

    // check for any empty required fields
    if (medName == '' || dosageAmount == '' || !medFrequencyContext!.medFrequency[1] || (Number.isNaN(medFrequencyContext!.medFrequency[0]) && medFrequencyContext!.medFrequency[1] != 'asNeeded')) {
      Alert.alert('Unfinished Data Entry', 'Please fill in the required fields.', [{text: 'OK'}]);
      return;
    }

    // reset fields
    setMedName('');
    setDosageAmount('');
    //setValue(null);
    // setDosageFrequency(NaN);
    medFrequencyContext!.setMedFrequency([NaN, '']);
    setExInfo('');
    isMedReminderContext!.setIsMedReminder(false);
    if (medReminderTimesContext) {
      medReminderTimesContext.setMedReminderTimes([]);
    }

    console.log('med added');
  };

  const deleteAll = () => {
    const toDelete = realm
      .objects(Medication)
    realm.write(() => {
      realm.delete(toDelete);
    });
  }

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
    <ScrollView contentContainerStyle={{rowGap: 10}}>
      <Text>{'Add Prescription (Realm Test)'}</Text>
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
      <View style={{flexDirection: 'row', gap: 10}}>
        <Text>{'Additional Info'}</Text>
        <TextInput
          onChangeText={setExInfo}
          value={exInfo}
          placeholder="Additional Info"
        />
      </View>
      <MedReminder/>
      <Button
        title="Add Med"
        onPress={addMed}
      />
      <Button
        title="Delete All Meds"
        onPress={deleteAll}
      />
    </ScrollView>
  );
};
