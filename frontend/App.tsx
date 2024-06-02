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
 * References:
 *  - https://reactnavigation.org/docs/auth-flow/
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
import SplashScreen from './components/SplashScreen';
import SignUpScreen from './components/SignUpScreen';
import {MedReminderTimesProvider} from './components/MedReminderTimesContext';
import {MedFrequencyProvider} from './components/MedFrequencyContext';
import {IsMedReminderProvider} from './components/IsMedReminderContext';
import { RefillInfoProvider } from './components/RefillInfoContext';
import { IsRefillReminderProvider } from './components/IsRefillReminderContext';
import {ServerAddr, ServerPort} from './communication';
import AuthenticationContext from './components/AuthenticationContext';
import storage from './storage';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {

  const [state, dispatch] = React.useReducer(
    (prevState:any, action:any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            isLoading: false,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken = undefined;

      try {
        userToken = await storage.getStringAsync('userToken');
      } catch (e) {
        return
      }

      // After restoring token, validate it with the web server
      if (!userToken) {
        dispatch({type: 'SIGN_OUT'});
        return;
      }

      let header = {'Authorization': `Bearer ${userToken}`}
      let url = 'http://' + ServerAddr + ':' + ServerPort + '/name';

      await fetch(url, 
        {
          method: 'GET',
          headers: header,
        }
      )
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
  
        dispatch({ type: 'RESTORE_TOKEN', token: userToken });
        return;
      })
      .catch((error) => {
        if (error.message == 'Network request failed') {
          dispatch({ type: 'RESTORE_TOKEN', token: userToken });
          return;
        } else {
          dispatch({type: 'SIGN_OUT'});
          return;
        }
      });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (username:string, password:string) => {
        // send username and password to server to get token
        let url = 'http://' + ServerAddr + ':' + ServerPort + '/login';
        await fetch(url, 
          {
            method: 'POST',
          }
        )
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
    
          return res.json();
        })
        .then((json) => {
          dispatch({ type: 'SIGN_IN', token: json.token });
          return;
        })
        .catch((error) => {
          if (error.message == 'Network request failed' || error.status == 404) {
            Alert.alert('Login Failed', 'Please make sure you are connected to internet and try again.', [{text: 'OK'}]);
          } else if (error.status == 401) {
            Alert.alert('Login Failed', 'Invalid email or password.', [{text: 'OK'}]);
          } else {
            Alert.alert('Internal Server Error', 'Please try again later.', [{text: 'OK'}]);
            console.log(`ERROR: ${JSON.stringify(error.message)}`);
          }
          dispatch({type: 'SIGN_OUT'});
          return;
        });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async (data:any) => {
        // send username and password to server to create new user
        let url = 'http://' + ServerAddr + ':' + ServerPort + '/login';
        await fetch(url, 
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
    
          Alert.alert('User Successfully Created', 'You will now be returned to the login screen.', [{text: 'OK'}]);
        })
        .catch((error) => {
          if (error.message == 'Network request failed' || error.status == 404) {
            Alert.alert('Sign Up Failed', 'Please make sure you are connected to internet and try again.', [{text: 'OK'}]);
          } else if (error.status == 401) {
            Alert.alert('Sign Up Failed', 'There is already a user with this email.', [{text: 'OK'}]);
          } else {
            Alert.alert('Internal Server Error', 'Please try again later.', [{text: 'OK'}]);
            console.log(`ERROR: ${JSON.stringify(error)}`);
          }
        });

        dispatch({type: 'SIGN_OUT'});
        return;
      },
    }),
    []
  );

  if (state.isLoading) {
    return <SplashScreen/>;
  }

  return (
    <AuthenticationContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {(state.userToken == null) ? (
            <>
              <Stack.Screen name="Login"
                component={LoginScreen}
                options={{
                  animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                }}
              />
              <Stack.Screen name="Sign Up"
                component={SignUpScreen}
              />
            </>
          ) : (
            <>
              <RealmProvider schema={[Medication, MedLog]}>
                <MedReminderTimesProvider>
                  <MedFrequencyProvider>
                    <IsMedReminderProvider>
                      <IsRefillReminderProvider>
                        <RefillInfoProvider>
                            <Stack.Screen name="HomeScreen" component={HomeScreen} />
                            <Stack.Screen name="NewScreen" component={NewScreen} />
                        </RefillInfoProvider>
                      </IsRefillReminderProvider>
                    </IsMedReminderProvider>
                  </MedFrequencyProvider>
                </MedReminderTimesProvider>
              </RealmProvider>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthenticationContext.Provider>
  );
}

export default App;
