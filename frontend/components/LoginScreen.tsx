/**
 * Login Page
 * References:
 *  - https://www.geeksforgeeks.org/how-to-show-and-hide-password-in-react-native/
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { Button, Text, Icon } from '@rneui/themed';
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AuthenticationContext from './AuthenticationContext';

const styles = StyleSheet.create({
  logo: {
      width: 200,
      height: 200,
      alignSelf: 'center',
      paddingVertical: '5%',
  },
});

function LoginScreen(){
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShowPassword = () => { 
    setShowPassword(!showPassword); 
  };
  const { signIn } = React.useContext(AuthenticationContext);
  
  return(
    <SafeAreaView>
      <ScrollView style={{paddingHorizontal: '5%'}}>
        <Image style={styles.logo} source={require('../pillHome.png')}/>
        <View style={{flexDirection:'column', gap: 10}}>
          <Text h3 style={{textAlign: 'center', paddingBottom: '5%'}}>{'Welcome to Pill Pal!'}</Text>
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
            title="Login"
            onPress={() => signIn(email, password)}
            style={{paddingHorizontal: '25%', paddingVertical: '5%'}}
          />
        </View>
        <Text onPress={() => {
            setEmail('');
            setPassword('');
            navigation.navigate('Sign Up');
          }}
          style={{paddingTop: '5%', textAlign: 'center'}}
        >
          {`Don't Have An Account?\nClick Here to Create One`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LoginScreen;
