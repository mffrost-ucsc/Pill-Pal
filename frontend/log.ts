import Realm, {BSON} from 'realm';
import {Medication, MedLog} from './realm/models';

export function toAsk(meds: Realm.Results<Medication>): Medication | null {
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
  const med = realm.objectForPrimaryKey(Medication, id);
  if (med === null) {
    return;
  }
  realm.write(() => {
    realm.create(MedLog, {
      name: med.name,
      amount: med.dosage.amountPerDose ?? 1,
      date: new Date(),
    });
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
