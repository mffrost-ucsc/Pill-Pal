/**
 * This is just a test component to see if the realm is working correctly
 * Reference: https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */

import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {BSON} from 'realm';
import {Medication} from '../realm/models';
import {User} from '../realm/models';
import {Button} from '@rneui/themed';




export const CreateUser = () => {
  return (
    <View style={{flexDirection:'column', gap: 10}}>
      <Text>{'Add User'}</Text>
      <TextInput
        placeholder="User Name"
      />
      <TextInput
        placeholder="Password"
      />
      <Button
        title="Add User"
      />
    </View>
  );
};