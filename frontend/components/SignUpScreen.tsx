/**
 * Screen to let the user create an account
 */

import React from "react";
import { SafeAreaView, ScrollView, TextInput, View, Alert } from "react-native";
import { Text, Icon, Button } from "@rneui/themed";
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AuthenticationContext from "./AuthenticationContext";

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

  const handleSubmit = () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Unfinished Data Entry', 'Please fill in all of the fields.', [{text: 'OK'}]);
      return;
    }

    const data = {'FirstName': firstName, 'LastName': lastName, 'Email': email, 'Password': password};
    signUp(data);
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
