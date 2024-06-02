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

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {RealmProvider} from '@realm/react';
import {Medication, MedLog} from './realm/models';
import Test from './components/Test';
import {NotificationButton, ReoccurringNotification} from './components/Notifications';
import MedList from './components/MedList';
import NavigateButton from './components/ButtonWithNavigation';
import HomeScreen from './components/HomeScreen';
import NewScreen from './components/NewScreen';
import LoginScreen from './components/LoginScreen';
import LoginButton from './components/LoginButton';
import {MedReminderTimesProvider} from './components/MedReminderTimesContext';
import {MedFrequencyProvider} from './components/MedFrequencyContext';
import {IsMedReminderProvider} from './components/IsMedReminderContext';
import { RefillInfoProvider } from './components/RefillInfoContext';
import { IsRefillReminderProvider } from './components/IsRefillReminderContext';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <RealmProvider schema={[Medication, MedLog]}>
      <MedReminderTimesProvider>
        <MedFrequencyProvider>
          <IsMedReminderProvider>
            <IsRefillReminderProvider>
              <RefillInfoProvider>
                <NavigationContainer>
                  <Stack.Navigator initialRouteName="LoginScreen">
                      <Stack.Screen name="LoginScreen" component={LoginScreen} />
                      <Stack.Screen name="HomeScreen" component={HomeScreen} />
                      <Stack.Screen name="NewScreen" component={NewScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </RefillInfoProvider>
            </IsRefillReminderProvider>
          </IsMedReminderProvider>
        </MedFrequencyProvider>
      </MedReminderTimesProvider>
    </RealmProvider>
  );
}

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

export default App;

// vim: ts=2 sw=2
