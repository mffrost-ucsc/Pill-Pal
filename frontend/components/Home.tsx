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
import {BSON} from 'realm';
import moment from 'moment'; // for formatting date
var _ = require('lodash'); // for comparing dictionaries

function Home(): React.JSX.Element {
  const realm = useRealm();
  const localMedList = useQuery(Medication);
  let dbInfo:Array<any> = [];

  // fetches the medications from the database
  const fetchMedInfo:any = async () => {
    const authToken = null; // TODO: GET AUTHENTICATION TOKEN
    let header = {};

    if (authToken != null) {
      header = {'Authorization': `Bearer ${authToken}`}
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/get_all_prescription';

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
      console.log(`ERROR: ${JSON.stringify(error)}`);
      return [];
    });
  }

  const updateDbMedInfo = (newData:Record<string, any>) => {
    const authToken = null; // TODO: GET AUTHENTICATION TOKEN
    let header:any = {'Content-Type': 'application/json'};
    const data = {realmEntry: newData, prescriptionID: newData._id}

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`};
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
    let header:any = {'Content-Type': 'application/json'};
    const data = {PrescriptionID: newData._id, PatientID: -1, DoctorID: -1, PrescriptionDate: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss'), LastModified: moment(newData.lastModified).format('YYYY-MM-DD HH:mm:ss'), RealmEntry: newData}

    if (authToken != null) {
      header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
    }

    let url = 'http://' + ServerAddr + ':' + ServerPort + '/add_prescription';

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
          let entry = JSON.parse(dbMed.RealmEntry);
          let id = new BSON.UUID(entry._id);
          realm.write(() => {
            realm.create(Medication, {
              _id: id,
              name: entry.name,
              dosage: entry.dosage,
              extraInfo: entry.extraInfo,
              lastModified: entry.lastModified,
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
    synchronize();
  }, []);

  return(
    <SafeAreaView>
      <MedList/>
      <TestAdd/>
    </SafeAreaView>
  );
}

export default Home;
