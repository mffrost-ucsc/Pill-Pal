// NewScreen.tsx
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

import {RealmProvider} from '@realm/react';
import {Medication} from '../realm/models';
import Section from './Section'
import {NotificationButton, ReoccurringNotification} from './Notifications';
import MedList from './MedList';
import NavigateButton from './ButtonWithNavigation';
import AddMedication from './AddMedication';


const NewScreen: React.FC = () => {

  return (
    <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            rowGap: 16
          }}
        >
          <AddMedication/>
        </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewScreen;
