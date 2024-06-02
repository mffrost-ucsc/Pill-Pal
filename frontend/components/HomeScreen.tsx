
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
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {Button} from '@rneui/themed';

import {RealmProvider} from '@realm/react';
import {Medication, MedLog} from '../realm/models';
import { TestAdd } from './TestAdd';
import Section from './Section'
import {NotificationButton, ReoccurringNotification} from './Notifications';
import MedList from './MedList';
import NavigateButton from './ButtonWithNavigation';
import NewScreen from './NewScreen';
import {DeleteButton} from './deleteButton';
import {useQuery, useRealm} from '@realm/react';
import notifee, {EventType} from '@notifee/react-native';
import Refill from './Refill';
import LogPopup from './LogPopup';
import Log from './Log';
import AuthenticationContext from './AuthenticationContext';

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

function HomeScreen(){
  const { signOut } = React.useContext(AuthenticationContext);

  return(
    <SafeAreaView>
      <ScrollView 
        contentContainerStyle={{
          rowGap: 16,
          height: '100%'
        }}
      >
        <NotificationButton/>
        <ReoccurringNotification/>
        <MedList/>
        <Refill/>
        <TestAdd/>
        <LogPopup/>
        <Log/>
        <NavigateButton routeName={'NewScreen'}/>
        <Button onPress={() => signOut()}>Logout</Button>
      </ScrollView>
    </SafeAreaView>
  );
}


export default HomeScreen
