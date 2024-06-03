

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
import {Button} from '@rneui/themed';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import Section from './Section'
import NavigateButton from './ButtonWithNavigation';
import LoginButton from './LoginButton';
import Logo from '../pillHome.png';
import {User} from '../realm/models';


const styles = StyleSheet.create({
  logo: {
      width: 200,
      height: 200,
  },
});

function LoginScreen(){
    const navigation = useNavigation()

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
                    <Image style={styles.logo} source={require('../pillHome.png')}/>
                    <View style={{flexDirection:'column', gap: 10}}>
                    <Text>{'Login'}</Text>
                    <TextInput
                      placeholder="User Name"
                    />
                    <TextInput
                      placeholder="Password"
                    />
                    <Button
                      title="Login"
                    />
                    <Button
                      title="Sign Up"
                      onPress={() => navigation.navigate("SignupScreen")}
                    />
                  </View>
              </SafeAreaView>
        );
}


export default LoginScreen
