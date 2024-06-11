/**
 * Home Screen for the app
 * When it first renders, it will synchronize the frontend and backend data
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {ServerAddr, ServerPort} from '../communication';
import {useQuery} from '@realm/react';
import realm from '../realm/models';
import {Medication, Reminder} from '../realm/models';
import { setReminderNoStore } from './MedReminder';
import {logAsked, logTaken} from '../log';
import {BSON} from 'realm';
import MedList from './MedList';
import Refill from './Refill';
import LogPopup from './LogPopup';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import moment from 'moment'; // for formatting date

function HomeScreen(){
  const localMedList = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0', storage.getInt('currentUser'));
  });
  const localReminderList = useQuery(Reminder, (meds) => {
    return meds.filtered('userId = $0', storage.getInt('currentUser'));
  });
  let dbMeds:Array<any> = [];
  let dbReminders:Array<any> = [];
  const authToken = storage.getString('userToken');
  const { signOut } = React.useContext(AuthenticationContext);
  const dayStrings = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayMap:Record<any, number> = {'Su': 0, 'Mo': 1, 'Tu': 2, 'We': 3, 'Th': 4, 'Fr': 5, 'Sa': 6};

  // fetches the medications from the database
  const fetchMedInfo:any = async () => {
    let header = {};

    if (authToken != null) {
      header = {'Authorization': `Bearer ${authToken}`};
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/medication';

    return await fetch(url, 
      {
        method: 'GET',
        headers: header,
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      return res.json();
    })
    .then((json) => {
      dbMeds = json;
      console.log('successfully fetched meds from DB');
      return json;
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
        return [];
      }
    });
  }

  // fetches the medications from the database
  const fetchReminderInfo:any = async () => {
    let header = {};

    if (authToken != null) {
      header = {'Authorization': `Bearer ${authToken}`};
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/reminder';

    return await fetch(url, 
      {
        method: 'GET',
        headers: header,
      }
    )
    .then((res) => {
      if (!res.ok) {
        throw res;
      }

      return res.json();
    })
    .then((json) => {
      dbReminders = json;
      console.log('successfully fetched reminders from DB');
      return json;
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
        return [];
      }
    });
  }

  const updateDbMedInfo = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data = {
      MedicationID: newData._id,
      Name: newData.name,
      Dosage: newData.dosage.amountPerDose,
      Frequency: newData.dosage.interval.charAt(0),
      TimesPerInterval: newData.dosage.timesPerInterval,
      TimeBetweenDose: newData.dosage.timeBetweenDose,
      AdditionalInfo: newData.extraInfo,
      Modified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss')
    };

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`};
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/medication';

    fetch(url, 
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

      console.log('info updated sucessfully');
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });
  }

  const addMedToDb = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data = {
      MedicationID: newData._id,
      Name: newData.name,
      Dosage: newData.dosage.amountPerDose,
      Frequency: newData.dosage.interval.charAt(0),
      TimesPerInterval: newData.dosage.timesPerInterval,
      TimeBetweenDose: newData.dosage.timeBetweenDose,
      AdditionalInfo: newData.extraInfo,
      Modified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss')
    };

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/medication';

    fetch(url, 
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

      console.log('prescription added sucessfully');
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        if (error.status == 401) {
          signOut();
        } else {
          console.log(`ERROR: ${JSON.stringify(error)}`);
        }
      }
    });
  }

  const updateDbReminder = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data = {
      ReminderID: newData._id,
      MedicationID: newData.medId,
      Hour: newData.hour,
      Minute: newData.minute,
      Day: newData.day,
      Modified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss')
    };

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`};
    } else {
      signOut();
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/reminder';

    fetch(url, 
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

      console.log('reminder updated sucessfully');
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
        signOut();
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });
  }

  const addReminderToDb = (newData:Record<string, any>) => {
    let header:any = {'Content-Type': 'application/json'};
    const data:any = {
      ReminderID: newData._id,
      MedicationID: newData.medId,
      Hour: newData.hour,
      Minute: newData.minute,
      Modified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss')
    };
  
    if (newData.day) {
      data['Day'] = dayStrings[newData.day];
    }
  
    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`};
    } else {
      signOut();
    }
  
    let url = 'http://' + ServerAddr + ':' + ServerPort + '/reminder';
  
    fetch(url, 
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
  
      console.log('reminder added sucessfully');
    })
    .catch((error) => {
      if (error.status == 401) {
        Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
      }
    });
  }

  // function will compare relevant fields of the 2 mediction entries
  const compareMedEntries = (dbEntry:Record<string, any>, localEntry:Record<string, any>) => {
    if (dbEntry.Name != localEntry.name ||
      dbEntry.Dosage != localEntry.dosage.amountPerDose ||
      dbEntry.Frequency != localEntry.dosage.interval.charAt(0) ||
      dbEntry.TimesPerInterval != localEntry.dosage.timesPerInterval ||
      dbEntry.TimeBetweenDose != localEntry.dosage.timeBetweenDose ||
      dbEntry.AdditionalInfo != localEntry.extraInfo) {
      return false;
    }

    return true;
  }

  // function will compare relevant fields of the 2 reminders
  const compareReminderEntries = (dbEntry:Record<string, any>, localEntry:Record<string, any>) => {
    if (dbEntry.Hour != localEntry.hour ||
      dbEntry.Minute != localEntry.minute ||
      dbEntry.Day != dayStrings[localEntry.day]) {
        return false;
    }

    return true;
  }

  const setupReminders = () => {
    const reminders = realm.objects(Reminder).filtered('userId = $0', storage.getInt('currentUser'));

    for (const rem of reminders) {
      const med = realm.objects(Medication).filtered('_id = $0', rem.medId)[0];

      setReminderNoStore(rem, taken => {
        logAsked(realm, med);
        if (taken) {
          logTaken(realm, med);
        }
      },)
    }
  }

  // synchronizes the med info fetched from the backend with local storage (realm)
  const synchronize = async () => {
    await fetchMedInfo();
    await fetchReminderInfo();

    // no need to synch if no data is present
    if (!localMedList && dbMeds.length == 0) {
      return;
    }

    // MEDICATION SYNCH
    // list lengths may vary, so we want the larger list to be the outer loop
    if (dbMeds.length >= localMedList.length) { // dbMeds is longer
      for (const dbMed of dbMeds) {
        let isFound = false;
        for (const localMed of localMedList) {
          if (dbMed.MedicationID == localMed._id) {
            isFound = true;
            if (!compareMedEntries(dbMed, localMed)) { // if the data isn't equal
              if (dbMed.Modified > localMed.lastModified) { // database is more recent
                // find interval
                let interval;
                if (dbMed.Frequency === 'd') {
                  interval = 'daily';
                } else if (dbMed.Frequency === 'w') {
                  interval = 'weekly';
                } else {
                  interval = 'asNeeded';
                }

                // write to realm
                realm.write(() => {
                  localMed.name = dbMed.Name;
                  localMed.dosage.amountPerDose = dbMed.Dosage;
                  localMed.dosage.interval = interval;
                  localMed.dosage.timesPerInterval = dbMed.TimesPerInterval;
                  localMed.dosage.timeBetweenDose = dbMed.TimeBetweenDose;
                  localMed.extraInfo = dbMed.AdditionalInfo;
                  localMed.lastModified = dbMed.Modified;
                })
              } else { // local is more recent
                updateDbMedInfo(localMed);
              }
            }
          }
        }
        // confirm we found a matching entry; if not need to add it to Realm
        if (!isFound) {
          let interval;
          // find interval
          if (dbMed.Frequency === 'd') {
            interval = 'daily';
          } else if (dbMed.Frequency === 'w') {
            interval = 'weekly';
          } else {
            interval = 'asNeeded';
          }
          let id = new BSON.UUID(dbMed.MedicationID);
          let dosage = {
            amountPerDose: dbMed.Dosage,
            interval: interval,
            timesPerInterval: dbMed.TimesPerInterval,
            timeBetweenDose: dbMed.TimeBetweenDose,
          }

          // write to realm
          realm.write(() => {
            realm.create(Medication, {
              _id: id,
              userId: storage.getInt('currentUser'),
              name: dbMed.Name,
              dosage: dosage,
              extraInfo: dbMed.AdditionalInfo,
              lastModified: dbMed.Modified,
            })
          })
        }
      }
    } else { // localMedList is longer
      for (const localMed of localMedList) {
        let isFound = false;
        for (const dbMed of dbMeds) {
          if (dbMed.MedicationID == localMed._id) {
            isFound = true;
            if (!compareMedEntries(dbMed, localMed)) { // if the data isn't equal
              if (dbMed.Modified > localMed.lastModified) { // database is more recent
                // find interval
                let interval;
                if (dbMed.Frequency === 'd') {
                  interval = 'daily';
                } else if (dbMed.Frequency === 'w') {
                  interval = 'weekly';
                } else {
                  interval = 'asNeeded';
                }

                // write to realm
                realm.write(() => {
                  localMed.name = dbMed.Name;
                  localMed.dosage.amountPerDose = dbMed.Dosage;
                  localMed.dosage.interval = interval;
                  localMed.dosage.timesPerInterval = dbMed.TimesPerInterval;
                  localMed.dosage.timeBetweenDose = dbMed.TimeBetweenDose;
                  localMed.extraInfo = dbMed.AdditionalInfo;
                  localMed.lastModified = dbMed.Modified;
                })
              } else { // local is more recent
                updateDbMedInfo(localMed);
              }
            }
          }
        }
        // confirm we found a matching entry; if not need to add it to the database
        if (!isFound) {
          addMedToDb(localMed);
        }
      }
    }

    //REMINDER SYNCH
    // list lengths may vary, so we want the larger list to be the outer loop
    if (dbReminders.length >= localReminderList.length) { // dbReminders is longer
      for (const dbRem of dbReminders) {
        let isFound = false;
        for (const localRem of localReminderList) {
          if (dbRem.ReminderID == localRem._id) {
            isFound = true;
            if (!compareReminderEntries(dbRem, localRem)) { // if the data isn't equal
              if (dbRem.Modified > localRem.lastModified) { // database is more recent
                // make sure takeReminder field is set properly
                let med = realm.objects(Medication).filtered('_id = $0', localRem.medId);
                if (med[0]) {
                  realm.write(() => {
                    med[0].takeReminder = true;
                  })
                }

                // write to realm
                realm.write(() => {
                  localRem.hour = dbRem.Hour;
                  localRem.minute = dbRem.Minute;
                  localRem.day = dayMap[dbRem.Day];
                  localRem.lastModified = dbRem.Modified;
                })
              } else { // local is more recent
                updateDbReminder(localRem);
              }
            }
          }
        }
        // confirm we found a matching entry; if not need to add it to Realm
        if (!isFound) {
          let medId = new BSON.UUID(dbRem.MedicationID);

          // make sure takeReminder field is set properly
          let med = realm.objects(Medication).filtered('_id = $0', medId);
          if (med[0]) {
            realm.write(() => {
              med[0].takeReminder = true;
            })
          }

          // write to realm
          realm.write(() => {
            realm.create(Reminder, {
              _id: dbRem.ReminderID,
              userId: storage.getInt('currentUser'),
              medId: medId,
              hour: dbRem.Hour,
              minute: dbRem.Minute,
              day: dayMap[dbRem.Day],
              lastModified: dbRem.Modified,
            })
          })
        }
      }
    } else { // localReminderList is longer
      for (const localRem of localReminderList) {
        let isFound = false;
        for (const dbRem of dbReminders) {
          if (dbRem.ReminderID == localRem._id) {
            isFound = true;
            if (!compareReminderEntries(dbRem, localRem)) { // if the data isn't equal
              if (dbRem.Modified > localRem.lastModified) { // database is more recent
                // make sure takeReminder field is set properly
                let med = realm.objects(Medication).filtered('_id = $0', localRem.medId);
                if (med[0]) {
                  realm.write(() => {
                    med[0].takeReminder = true;
                  })
                }
 
                // write to realm
                realm.write(() => {
                  localRem.hour = dbRem.Hour;
                  localRem.minute = dbRem.Minute;
                  localRem.day = dayMap[dbRem.Day];
                  localRem.lastModified = dbRem.Modified;
                })
              } else { // local is more recent
                updateDbReminder(localRem);
              }
            }
          }
        }
        // confirm we found a matching entry; if not need to add it to the database
        if (!isFound) {
          addReminderToDb(localRem);
        }
      }
    }

    // once data is synchronized, set up reminders
    setupReminders();
  }

  // on first render, fetch data from database and sync it
  React.useEffect(() => {
    synchronize();
  }, []);

  return(
    <SafeAreaView>
      <ScrollView 
        contentContainerStyle={{
          rowGap: 16,
          height: '100%'
        }}
      >
        <MedList/>
        <Refill/>
      </ScrollView>
    </SafeAreaView>
  );
}


export default HomeScreen
