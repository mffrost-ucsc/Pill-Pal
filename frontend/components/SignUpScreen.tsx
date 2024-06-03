/**
 * Screen to let the user create an account
 * References:
 *  - https://www.simplilearn.com/tutorials/javascript-tutorial/email-validation-in-javascript
 */

import React from "react";
import { SafeAreaView, ScrollView, TextInput, View, Alert } from "react-native";
import { Text, Icon, Button } from "@rneui/themed";
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AuthenticationContext from "./AuthenticationContext";
import realm from '../realm/models';
import { User } from "../realm/models";
import storage from "../storage";

function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShowPassword = () => { 
    setShowPassword(!showPassword); 
  };
  const { signUp } = React.useContext(AuthenticationContext);

  const handleSubmit = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Unfinished Data Entry', 'Please fill in all of the fields.', [{text: 'OK'}]);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!email.match(emailRegex)) {
      Alert.alert('Invalid Email', 'Invalid email address. Please use format: example@email.com', [{text: 'OK'}]);
      return;
    }

    const data = {'FirstName': firstName, 'LastName': lastName, 'Email': email, 'Password': password};
    await signUp(data);

    // add user to Realm
    realm.write(() => {
      realm.create(User, {
        userId: storage.getInt('currentUser'),
        firstName: firstName,
        lastName: lastName,
        email: email,
      });
    });

    navigation.navigate('Login');
  }

  return (
    <SafeAreaView>
      <ScrollView style={{paddingHorizontal: '5%'}}>
        <View style={{flexDirection:'column', gap: 10}}>
          <Text h3 style={{textAlign: 'center', paddingVertical: '5%'}}>{'Create an Account'}</Text>
          <Text h4>First Name</Text>
          <TextInput
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Text h4>Last Name</Text>
          <TextInput
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <Text h4>Email Address</Text>
          <TextInput
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
          />
          <Text h4>Password</Text>
          <View style={{flexDirection: 'row'}}>
            <TextInput
              placeholder="Enter Password"
              style={{width: '75%'}}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              type='material-community'
              onPress={toggleShowPassword}
            />
          </View>
          <Button
            title="Create Account"
            onPress={() => handleSubmit()}
            style={{paddingHorizontal: '25%', paddingVertical: '5%'}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SignUpScreen;
