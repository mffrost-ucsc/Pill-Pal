/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

/**
 * This file was automatically generated when I created the frontend
 * We should be able to change or get rid of most of this stuff
 * I created a Test component to see if our frontend and backend could communicated properly
 */

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
  Button,
  Alert
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {RealmProvider} from '@realm/react';
import {Medication, MedLog} from './realm/models';
import Test from './components/Test';
import {NotificationButton, ReoccurringNotification} from './components/Notifications';
import MedList from './components/MedList';
import {TestAdd} from './components/TestAdd';
import {MedReminderTimesProvider} from './components/MedReminderTimesContext';
import {MedFrequencyProvider} from './components/MedFrequencyContext';
import {IsMedReminderProvider} from './components/IsMedReminderContext';
import { RefillInfoProvider } from './components/RefillInfoContext';
import { IsRefillReminderProvider } from './components/IsRefillReminderContext';
import {useQuery, useRealm} from '@realm/react';
import notifee, {EventType} from '@notifee/react-native';
import Refill from './components/Refill';
import LogPopup from './components/LogPopup';
import Log from './components/Log';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <RealmProvider schema={[Medication, MedLog]}>
        <ScrollView 
          contentContainerStyle={{
            rowGap: 16,
            height: '100%'
          }}
        >
          <NotificationButton/>
          <ReoccurringNotification/>
          <MedList/>
          <MedReminderTimesProvider>
            <MedFrequencyProvider>
              <IsMedReminderProvider>
                <IsRefillReminderProvider>
                  <RefillInfoProvider>
                    <Refill/>
                    <TestAdd/>
                  </RefillInfoProvider>
                </IsRefillReminderProvider>
                <LogPopup/>
                <Log/>
              </IsMedReminderProvider>
            </MedFrequencyProvider>
          </MedReminderTimesProvider>
        </ScrollView>
      </RealmProvider>
    </SafeAreaView>
  );
}

export default App;

// vim: ts=2 sw=2
