/**
 * This is just a test component to see if the realm is working correctly
 * Reference: https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */

import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {BSON} from 'realm';
import {useRealm} from '@realm/react';
import {Medication} from '../realm/models';
import {Button} from '@rneui/themed';


export const TestAdd = () => {
  const realm = useRealm();
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [exInfo, setExInfo] = useState('');

  const addMed = () => {
    realm.write(() => {
      realm.create(Medication, {
        _id: new BSON.ObjectId(),
        name: medName,
        dosage: {'interval': dosage},
        extraInfo: exInfo,
      });
    });

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