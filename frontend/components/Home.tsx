/**
 * Home page
 */

import React from 'react';
import MedList from './MedList';
import {SafeAreaView, View} from 'react-native';
import {Button} from '@rneui/themed';
import {TestAdd} from './TestAdd';
import {ServerAddr, ServerPort} from '../communication';
import {useQuery, useRealm} from '@realm/react';
import {Medication} from '../realm/models';
const _ = require('lodash');

function Home() {
  const realm = useRealm();
  const [addMed, setAddMed] = React.useState(false);
  let dbInfo:Array<any>;

  // fetches the medications from the database
  const fetchMedInfo = () => {
    const authToken = null; // TODO: GET AUTHENTICATION TOKEN
    let header = {};

    if (authToken != null) {
      header = {'Authorization': `Bearer ${authToken}`}
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/get_all_prescription';

    fetch(url, 
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
      console.log('fetched: ' + json);
      dbInfo = json;
    })
    .catch((error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`);
    });
  }

  const updateDbMedInfo = (newData:Record<string, any>) => {
    const authToken = null; // TODO: GET AUTHENTICATION TOKEN
    let header = {};
    const data = {realmEntry: newData, prescriptionID: newData._id}

    if (authToken != null) {
      header = {'Authorization': `Bearer ${authToken}`}
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/update_prescription_realm';

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

      console.log('info updated sucessfully');
    })
    .catch((error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`);
    });
  }

  const addMedToDb = (newData:Record<string, any>) => {
    const authToken = null; // TODO: GET AUTHENTICATION TOKEN
    let header = {};
    const data = {PrescriptionID: newData._id, PatientID: 'TODO', DoctorID: '', PrescriptionDate: newData.lastModified, LastModified: newData.lastModified, RealmEntry: newData}

    if (authToken != null) {
      header = {'Authorization': `Bearer ${authToken}`}
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/update_prescription_realm';

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

      console.log('prescription added sucessfully');
    })
    .catch((error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`);
    });
  }

  // synchronizes the med info fetched from the backend with local storage (realm)
  const synchronize = () => {
    const localMedList = useQuery(Medication);

    // no need to synch if no data is present
    if (localMedList.length == 0 && dbInfo.length == 0) {
      return;
    }

    // list lengths may vary, so we want the larger list to be the outer loop
    if (dbInfo.length >= localMedList.length) {
      for (const dbMed of dbInfo) {
        let isFound = false;
        for (const localMed of localMedList) {
          if (dbMed.PrescriptionID == localMed._id) {
            isFound = true;
            if (_.isEqual(dbMed.RealmEntry, localMed)) { // if the data isn't equal
              if (dbMed.LastModified > localMed.lastModified) { // database is more recent
                realm.write(() => {
                  localMed.name = dbMed.RealmEntry.name;
                  localMed.dosage = dbMed.RealmEntry.dosage;
                  localMed.extraInfo = dbMed.RealmEntry.extraInfo;
                  localMed.lastModified = dbMed.RealmEntry.lastModified;
                })
              } else { // local is more recent
                updateDbMedInfo(localMed);
              }
            }
          }
        }
        // confirm we found a matching entry; if not need to add it to Realm
        if (!isFound) {
          realm.write(() => {
            realm.create(Medication, {
              _id: dbMed.RealmEntry._id,
              name: dbMed.RealmEntry.name,
              dosage: dbMed.RealmEntry.dosage,
              extraInfo: dbMed.RealmEntry.extraInfo,
              lastModified: dbMed.RealmEntry.lastModified,
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
            if (_.isEqual(dbMed.RealmEntry, localMed)) { // if the data isn't equal
              if (dbMed.LastModified > localMed.lastModified) { // database is more recent
                realm.write(() => {
                  localMed.name = dbMed.RealmEntry.name;
                  localMed.dosage = dbMed.RealmEntry.dosage;
                  localMed.extraInfo = dbMed.RealmEntry.extraInfo;
                  localMed.lastModified = dbMed.RealmEntry.lastModified;
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
    fetchMedInfo();
    synchronize();
  }, []);

  return(
    <SafeAreaView>
      <MedList/>
      <Button onPress={() => setAddMed(true)}>Add Medication</Button> 
      <View style={{display: (addMed) ? 'flex' : 'none'}}>
        <TestAdd/>
      </View>
    </SafeAreaView>
  );
}

export default Home;
