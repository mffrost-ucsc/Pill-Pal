import Realm, {BSON} from 'realm';
import {Medication, MedLog} from './realm/models';

function createMeds(realm: Realm): void {
  realm.write(() => {
    realm.deleteAll();
    realm.create(Medication, {
      name: 'med1',
      dosage: {amountPerDose: 1, interval: 'daily', timesPerInterval: 1},
      extraInfo: '',
    });
    realm.create(Medication, {
      name: 'med2',
      dosage: {amountPerDose: 2, interval: 'weekly', timesPerInterval: 1},
      extraInfo: '',
    });
    realm.create(Medication, {
      name: 'med3',
      dosage: {amountPerDose: 3, interval: 'monthly', timesPerInterval: 1},
      extraInfo: '',
    });
  });
}
function clearLastAsked(realm: Realm): void {
  realm.write(() => {
    const meds = realm.objects(Medication);
    for (let med of meds) {
      med.lastAsked = undefined;
    }
  });
}

export function toAsk(realm: Realm): Medication | null {
  // createMeds(realm); return null;
  // clearLastAsked(realm); return null;
  const meds = realm.objects(Medication);
  for (const med of meds) {
    const last = med.lastAsked ?? new Date(0);
    const dosage = med.dosage;
    const intv = dosage.interval;
    const now = new Date();
    const dateDiff = now.getTime() - last.getTime();
    const dateDiffDays = dateDiff / 1000 / 60 / 60 / 24;
    if (intv === 'daily' && dateDiffDays >= 1) {
      return med;
    } else if (intv === 'weekly' && dateDiffDays >= 7) {
      return med;
    } else if (intv === 'monthly' && dateDiffDays >= 28) {
      return med;
    }
  }
  return null;
}

export function logTaken(realm: Realm, id: BSON.ObjectId) {
  realm.write(() => {
    realm.create(MedLog, {medId: id, date: new Date()});
  });
  console.log('Took ' + id.toString() + ' at ' + new Date().toString() + '.');
}

export function logAsked(realm: Realm, id: BSON.ObjectId) {
  realm.write(() => {
    const med = realm.objectForPrimaryKey(Medication, id);
    if (med) {
      med.lastAsked = new Date();
    }
  });
  console.log('Asked about ' + id.toString() + '.');
}
// vim: sw=2 ts=2
