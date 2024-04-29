
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

import Test from './Test';
import Section from './Section'
import {NotificationButton, ReoccurringNotification} from './Notifications';
import AppNavigator from './AppNavigator';
import NavigateButton from './ButtonWithNavigation';
import NewScreen from './NewScreen';

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

              <View style={{flexDirection:'column', gap: 10}}>
                <Test />
                <NotificationButton/>
                <NavigateButton routeName={'NewScreen'}/>
                <ReoccurringNotification/>
              </View>

              <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <Header />
                <View
                  style={{
                    backgroundColor: isDarkMode ? Colors.black : Colors.white,
                  }}>
                  <Section title="Step One">
                    Edit <Text style={styles.highlight}>App.tsx</Text> to change this
                    screen and then come back to see your edits.
                  </Section>
                  <Section title="See Your Changes">
                    <ReloadInstructions />
                  </Section>
                  <Section title="Debug">
                    <DebugInstructions />
                  </Section>
                  <Section title="Learn More">
                    Read the docs to discover what to do next:
                  </Section>
                  <LearnMoreLinks />
                </View>
              </ScrollView>
            </SafeAreaView>
        );
}


export default HomeScreen
