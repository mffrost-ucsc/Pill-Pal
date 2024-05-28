/**
 * This is just a test component to see if the realm is working correctly
 * Reference: https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */

import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {BSON} from 'realm';
import {useRealm, useObject} from '@realm/react';
import {Medication} from '../realm/models';
import {Button} from '@rneui/themed';
import {ServerAddr, ServerPort} from '../communication';
import moment from 'moment'; // for formatting date


export const TestAdd = () => {
  const realm = useRealm();
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [exInfo, setExInfo] = useState('');

  const addMedToDb = (newData:Record<string, any>) => {
    const authToken = null; // TODO: GET AUTHENTICATION TOKEN
    let header:any = {'Content-Type': 'application/json'};
    const data = {PrescriptionID: newData._id, PatientID: -1, DoctorID: -1, PrescriptionDate: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss'), LastModified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss'), RealmEntry: newData}

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/add_prescription';

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

      console.log('prescription added sucessfully');
    })
    .catch((error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`);
    });
  }

  const addMed = () => {
    const id = new BSON.UUID();

    // add to realm
    realm.write(() => {
      realm.create(Medication, {
        _id: id,
        name: medName,
        dosage: {'interval': dosage},
        extraInfo: exInfo,
      });
    });

    // add to database
    const realmEntry = realm.objects(Medication).filtered('_id = $0', id);
    addMedToDb(JSON.parse(JSON.stringify(realmEntry[0])));

    setMedName('');
    setDosage('');
    setExInfo('');
  };

  const deleteAll = () => {
    const toDelete = realm
      .objects(Medication)
    realm.write(() => {
      realm.delete(toDelete);
    });
  }

  return (
    <View style={{flexDirection:'column', gap: 10}}>
      <Text>{'Add Prescription (Realm Test)'}</Text>
      <TextInput
        onChangeText={setMedName}
        value={medName}
        placeholder="Medication Name"
      />
      <TextInput
        onChangeText={setDosage}
        value={dosage}
        placeholder="Dosage Info"
      />
      <TextInput
        onChangeText={setExInfo}
        value={exInfo}
        placeholder="Additional Info"
      />
      <Button
        title="Add Med"
        onPress={addMed}
      />
      <Button
        title="Delete All Meds"
        onPress={deleteAll}
      />
    </View>
  );
};