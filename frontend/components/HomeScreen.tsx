
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {Button} from '@rneui/themed';
import {ServerAddr, ServerPort} from '../communication';
import {useQuery} from '@realm/react';
import realm from '../realm/models';
import {Medication} from '../realm/models';
import {BSON} from 'realm';
import MedList from './MedList';
import Refill from './Refill';
import LogPopup from './LogPopup';
import AuthenticationContext from './AuthenticationContext';
import storage from '../storage';
import moment from 'moment'; // for formatting date

function HomeScreen(){
  const localMedList = useQuery(Medication);
  let dbInfo:Array<any> = [];
  const authToken = storage.getString('userToken');
  const { signOut } = React.useContext(AuthenticationContext);

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
      dbInfo = json;
      console.log('successfully fetched meds from DB');
      return json;
    })
    .catch((error) => {
      if (error.status == 401) {
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

  // function will compare relevant fields of the 2 entries
  const compareEntries = (dbEntry:Record<string, any>, localEntry:Record<string, any>) => {
    if (dbEntry.Name != localEntry.name ||
      dbEntry.Dosage != localEntry.dosage.amountPerDose ||
      dbEntry.Frequency != localEntry.dosage.interval.charAt(0) ||
      dbEntry.TimesPerInterval != localEntry.dosage.timesPerInterval ||
      dbEntry.AdditionalInfo != localEntry.extraInfo
    )
    {
      return false;
    }

    return true;
  }

  // synchronizes the med info fetched from the backend with local storage (realm)
  const synchronize = async () => {
    await fetchMedInfo();

    // no need to synch if no data is present
    if (!localMedList && dbInfo.length == 0) {
      return;
    }

    // list lengths may vary, so we want the larger list to be the outer loop
    if (dbInfo.length >= localMedList.length) {
      for (const dbMed of dbInfo) {
        let isFound = false;
        for (const localMed of localMedList) {
          if (dbMed.MedicationID == localMed._id) {
            isFound = true;
            if (!compareEntries(dbMed, localMed)) { // if the data isn't equal
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
          let id = new BSON.UUID(dbMed.medicationID);
          let dosage = {
            amountPerDose: dbMed.Dosage,
            interval: interval,
            timesPerInterval: dbMed.TimesPerInterval,
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
        for (const dbMed of dbInfo) {
          if (dbMed.PrescriptionID == localMed._id) {
            isFound = true;
            if (!compareEntries(dbMed, localMed)) { // if the data isn't equal
              if (dbMed.LastModified > localMed.lastModified) { // database is more recent
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
        <LogPopup/>
        <Button onPress={() => signOut()}>Logout</Button>
      </ScrollView>
    </SafeAreaView>
  );
}


export default HomeScreen
