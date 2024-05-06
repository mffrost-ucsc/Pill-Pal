/**
 * This is just a test component to see if the realm is working correctly
 * References: 
 *  - https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 *  - https://hossein-zare.github.io/react-native-dropdown-picker-website/docs/usage
 *  - https://reactnativeelements.com/docs/components/checkbox
 */

import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {useRealm} from '@realm/react';
import {Medication} from '../realm/models';
import {Button, CheckBox} from '@rneui/themed';


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
    {label: 'Monthly', value: 'monthly'},
    {label: 'As Needed', value: 'asNeeded'}
  ]);
  const [dosageFrequency, setDosageFrequency] = useState(NaN);
  const [checked, setChecked] = React.useState(false);
  const toggleCheckbox = () => setChecked(!checked);

  const addMed = () => {
    realm.write(() => {
      realm.create(Medication, {
        name: medName,
        dosage: {amountPerDose: dosageAmount, interval: value, timesPerInterval: dosageFrequency},
        extraInfo: exInfo
      });
    });

    setMedName('');
    setDosageAmount('');
    setValue(null);
    setDosageFrequency(NaN);
    setExInfo('');
    setChecked(false);
  };

  const deleteAll = () => {
    const toDelete = realm
      .objects(Medication)
    realm.write(() => {
      realm.delete(toDelete);
    });
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
        setItems={setItems}
        listMode="SCROLLVIEW"
        containerStyle={{
          zIndex: dropdownOpen ? 1000 : 0
        }}
      />
      <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap'}}>
        <Text>{'How Many Times Per Day/Week/Month:'}</Text>
        <TextInput
          onChangeText={newVal => setDosageFrequency(Number(newVal))}
          value={(Number.isNaN(dosageFrequency)) ? '' : String(dosageFrequency)}
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
      <CheckBox
           checked={checked}
           onPress={toggleCheckbox}
           iconType="material-community"
           checkedIcon="checkbox-outline"
           uncheckedIcon={'checkbox-blank-outline'}
           title="Send Me Reminders to Take This Medication"
      />
      <View style={{display: (checked) ? 'flex' : 'none'}}>
        {(dosageFrequency) ? Array.from({length: dosageFrequency},(_,index) => <Text key={index}>{'Reminder ' + (index + 1) + ':'}</Text>) : (<Text>{'Please Fill in Other Info'}</Text>)}
      </View>
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