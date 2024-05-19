
import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
import {RealmProvider} from '@realm/react';

import Section from './Section'
import NavigateButton from './ButtonWithNavigation';
import LoginButton from './LoginButton';
import Logo from '../pillHome.png';
import {User} from '../realm/models';
import { CreateUser } from './CreateUser';

const styles = StyleSheet.create({
  logo: {
      width: 200,
      height: 200,
  },
});

function LoginScreen(){

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
                    <CreateUser/>
                    <LoginButton routeName={'HomeScreen'}/>


              </SafeAreaView>
        );
}


export default LoginScreen
