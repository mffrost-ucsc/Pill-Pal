import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Image,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {Button} from '@rneui/themed';

import Section from './Section'
import NavigateButton from './ButtonWithNavigation';
import LoginButton from './LoginButton';
import Logo from '../pillHome.png';



const styles = StyleSheet.create({
  logo: {
      width: 200,
      height: 200,
  },
});

function handleSignUpPress(addUser: Function, userName: string, password: string) {
  fetch('http://' + ServerAddr + ':' + ServerPort + '/user', {method:'PUT', body{Email:userName, Password:password})
    .then((res) => {
      if (!res.ok) {
        throw res
      }

      return res.json();
    })
    .then((json) => {
      let str = '';
      for (let entry of json) {
        str += entry.title + ' ';
      }
      addUser(str);
    })
    .catch((error) => {
      addUser(`ERROR: ${error.toString()}`);
    });
}

function SignupScreen(){
    const [UserName, setUserName] = useState('');
    const [Password, setPassword] = useState('');
    const [Name, setName] = useState('');
    const [LastName, setLastName] = useState('');
    const [user, addUser] = React.useState('Click the Button');

    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        justifyContent: 'center',
        alignItems: 'center',
      };

    return(
     <SafeAreaView style={backgroundStyle}>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={backgroundStyle.backgroundColor}
                />

                    <Text>{'Signup'}</Text>
                          <TextInput
                            onChangeText={setUserName}
                            value={UserName}
                            placeholder="User Name"
                          />
                          <TextInput
                            onChangeText={setPassword}
                            value={Password}
                            placeholder="Password"
                          />
                          <Button
                            title="Sign Up"
                            onPress={() => {handleSignUpPress(addUser,UserName,Password)}}
                          />
              </SafeAreaView>
        );
}


export default SignupScreen