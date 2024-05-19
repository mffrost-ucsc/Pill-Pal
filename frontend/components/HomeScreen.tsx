
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
import { createStackNavigator } from '@react-navigation/stack';
import {Button} from '@rneui/themed';

import {RealmProvider} from '@realm/react';
import {Medication} from '../realm/models';
import { TestAdd } from './TestAdd';
import Section from './Section'
import {NotificationButton, ReoccurringNotification} from './Notifications';
import MedList from './MedList';
import NavigateButton from './ButtonWithNavigation';
import NewScreen from './NewScreen';
import {deleteButton} from './deleteButton';

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

    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      };


    return(
     <SafeAreaView style={backgroundStyle}>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={backgroundStyle.backgroundColor}
                />

                <RealmProvider schema={[Medication]}>
                  <ScrollView
                    contentContainerStyle={{
                      rowGap: 16
                    }}
                  >
                    <MedList/>
                    <NavigateButton routeName={'NewScreen'}/>
                  </ScrollView>
                </RealmProvider>
              </SafeAreaView>
        );
}


export default HomeScreen
