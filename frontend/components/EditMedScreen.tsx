/**
 * This component is essentially the same as AddMedication except it handles editing the medication
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
import { EditMedContext } from './EditMedContext';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import moment from 'moment'; // for formatting date
import { SafeAreaView } from 'react-native-safe-area-context';
import { useObject } from '@realm/react';

function EditMedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const editMedContext = React.useContext(EditMedContext);
  const thisMed = useObject(Medication, editMedContext!.medId);
  const [medName, setMedName] = useState('');
  const [dosageAmount, setDosageAmount] = useState('');
  const [exInfo, setExInfo] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [value, setValue] = useState('');
  const [items, setItems] = useState([
    {label: 'Daily', value: 'daily'},
    {label: 'Weekly', value: 'weekly'},
    {label: 'As Needed', value: 'asNeeded'}
  ]);
  const medReminderTimesContext = React.useContext(MedReminderTimesContext);
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const medFrequencyContext = React.useContext(MedFrequencyContext);
  const isRefillReminderContext = React.useContext(IsRefillReminderContext);
  const refillInfoContext = React.useContext(RefillInfoContext); // index 0 = refillAmount, 1 = refillReminderCount, 2 = pillCount
  const authToken = storage.getString('userToken');
  const { signOut } = React.useContext(AuthenticationContext);

  const editMedInDb = (newData:Record<string, any>) => {
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
    // check for any empty required fields
    if (medName == '' || dosageAmount == '' || !medFrequencyContext!.medFrequency[1] || (Number.isNaN(medFrequencyContext!.medFrequency[0]) && medFrequencyContext!.medFrequency[1] != 'asNeeded')) {
      Alert.alert('Unfinished Data Entry', 'Please fill in the required fields.', [{text: 'OK'}]);
      return;
    }

    // edit realm entry
    if (thisMed) {
      realm.write(() => {
          thisMed.name = medName;
          thisMed.dosage.amountPerDose = Number(dosageAmount);
          thisMed.dosage.interval = medFrequencyContext!.medFrequency[1];
          thisMed.dosage.timesPerInterval = medFrequencyContext!.medFrequency[0];
          thisMed.extraInfo = exInfo;
          thisMed.lastModified = new Date();
      });
  }

    // add med to database
    editMedInDb(JSON.parse(JSON.stringify(thisMed)));

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
    }
  }, []);

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
          title="Edit Med"
          onPress={editMed}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditMedScreen;


