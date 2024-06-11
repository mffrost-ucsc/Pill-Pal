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
 *  - https://reactnavigation.org/docs/drawer-based-navigation
 */

import React from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {RealmProvider} from '@realm/react';
import {User, Medication, Reminder, MedLog} from './realm/models';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import SignUpScreen from './components/SignUpScreen';
import HomeNavigation from './components/HomeNavigation';
import {MedReminderTimesProvider} from './components/MedReminderTimesContext';
import {MedFrequencyProvider} from './components/MedFrequencyContext';
import {IsMedReminderProvider} from './components/IsMedReminderContext';
import { RefillInfoProvider } from './components/RefillInfoContext';
import { IsRefillReminderProvider } from './components/IsRefillReminderContext';
import { EditMedProvider } from './components/EditMedContext';
import {ServerAddr, ServerPort} from './communication';
import notifee from '@notifee/react-native'; 
import AuthenticationContext from './components/AuthenticationContext';
import storage from './storage';
var base64js = require('base64-js');

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
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            isLoading:false,
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
    // Fetch the token from storage then navigate to appropriate place
    const bootstrapAsync = async () => {
      let userToken = undefined;

      try {
        userToken = await storage.getStringAsync('userToken');
      } catch (e) {
        dispatch({type: 'SIGN_OUT'});
        return;
      }

      // After restoring token, validate it with the web server
      if (!userToken) {
        dispatch({type: 'SIGN_OUT'});
        state.isLoading = false;
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
        if (error.message == 'Network request failed'  || error.status == 404) {
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
        const header = {'Content-Type': 'application/json'};
        const data = {'username': username, 'password': password};
        await fetch(url, 
          {
            method: 'POST',
            headers: header,
            body: JSON.stringify(data),
          }
        )
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
    
          return res.json();
        })
        .then((json) => {
          storage.setString('userToken', json.token);
          storage.setInt('currentUser', json.userId);
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
      signOut: async () => {
        storage.setInt('currentUser', NaN);
        await notifee.cancelAllNotifications();
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async (data:any) => {
        // send username and password to server to create new user
        let url = 'http://' + ServerAddr + ':' + ServerPort + '/user';
        const header = {'Content-Type': 'application/json'};
        await fetch(url, 
          {
            method: 'PUT',
            headers: header,
            body: JSON.stringify(data),
          }
        )
        .then((res) => {
          if (!res.ok) {
            throw res;
          }

          return res.json();
        })
        .then((json) => {
          storage.setInt('currentUser', json.userId);
          
          Alert.alert('User Successfully Created', 'You will now be returned to the login screen.', [{text: 'OK'}]);

          return;
        })
        .catch((error) => {
          if (error.message == 'Network request failed' || error.status == 404) {
            Alert.alert('Sign Up Failed', 'Please make sure you are connected to internet and try again.', [{text: 'OK'}]);
          } else if (error.status == 403) {
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
      <RealmProvider schema={[User, Medication, Reminder, MedLog]} encryptionKey={base64js.toByteArray(storage.getString('realmKey'))}>
        <MedReminderTimesProvider>
          <MedFrequencyProvider>
            <IsMedReminderProvider>
              <IsRefillReminderProvider>
                <RefillInfoProvider>
                  <EditMedProvider>
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
                              <Stack.Screen options={{headerShown: false}} name="HomeScreen" component={HomeNavigation} />
                          </>
                        )}
                      </Stack.Navigator>
                    </NavigationContainer>
                  </EditMedProvider>
                </RefillInfoProvider>
              </IsRefillReminderProvider>
            </IsMedReminderProvider>
          </MedFrequencyProvider>
        </MedReminderTimesProvider>
      </RealmProvider>
    </AuthenticationContext.Provider>
  );
}

export default App;
