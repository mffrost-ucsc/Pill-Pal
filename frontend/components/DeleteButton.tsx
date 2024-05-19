import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {BSON} from 'realm';
import {useRealm} from '@realm/react';
import {Medication} from '../realm/models';
import {User} from '../realm/models';
import {Button} from '@rneui/themed';
import {realmContext} from './RealmContext';

export const DeleteButton = () => {
  const realm = useRealm();
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [exInfo, setExInfo] = useState('');

 const deleteAll = () => {
    const toDelete = realm
      .objects(Medication)
    realm.write(() => {
      realm.delete(toDelete);
    });
  }

  return (
      <Button
        title="Add Med"
        onPress={deleteAll}
      />
  );
};