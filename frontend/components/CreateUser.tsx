/**
 * This is just a test component to see if the realm is working correctly
 * Reference: https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */

import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {BSON} from 'realm';
import {useRealm} from '@realm/react';
import {Medication} from '../realm/models';
import {User} from '../realm/models';
import {Button} from '@rneui/themed';


export const CreateUser = () => {
  const realm = useRealm();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const addUser = () => {
    realm.write(() => {
      realm.create(User, {
        _id: new BSON.ObjectId(),
        userName: userName,
        password: password,
      });
    });

    setUserName('');
    setPassword('');
  };

  const deleteAll = () => {
    const toDelete = realm
      .objects(User)
    realm.write(() => {
      realm.delete(toDelete);
    });
  }

  return (
    <View style={{flexDirection:'column', gap: 10}}>
      <Text>{'Add User (Realm Test)'}</Text>
      <TextInput
        onChangeText={setUserName}
        value={userName}
        placeholder="User Name"
      />
      <TextInput
        onChangeText={setPassword}
        value={password}
        placeholder="Password"
      />
      <Button
        title="Add User"
        onPress={addUser}
      />
    </View>
  );
};
