import Realm, {BSON} from 'realm';
import { sendRefillReminder } from './components/RefillReminder';
import realm, {Medication, MedLog, Reminder} from './realm/models';
import storage from './storage';

export function toAsk(meds: Realm.Results<Medication>): Medication | null {
  for (const med of meds) {
    const reminders = realm.objects(Reminder).filtered('medId = $0', med._id);
    const now = new Date();

    // dont ask if no reminders set
    if (reminders.length == 0) {
      continue;
    }

    const should = [] // list of when meds should be taken
    for (const rem of reminders) {
      let date = new Date();
      date.setHours(rem.hour);
      date.setMinutes(rem.minute);
      if (rem.day) {
        const now = new Date();
        const dist = rem.day - date.getDay();
        date.setDate(date.getDate() + dist);
        if (date.getTime() < now.getTime()) {
          date.setDate(date.getDate() + 7);
        }
      }
      should.push(date);
    }

    // sort should list
    should.sort((a, b) => a.getTime() - b.getTime());

    // if last time asked is earlier than the reminder, need to send a popup
    // also check that the difference isn't too big
    const last = med.lastAsked ?? should[0];
    for (const remTime of should) {
      var hourDiff = Math.abs(last.getTime() - remTime.getTime()) / 3600000;
      if (last.getTime() < remTime.getTime() && remTime.getTime() < now.getTime()) { 
        if (hourDiff < 1) {
          return med;
        }
      }
    }
  }
  return null;
}

export function logTaken(realm: Realm, med: Medication) {
  realm.write(() => {
    realm.create(MedLog, {
      name: med.name,
      amount: med.dosage.amountPerDose ? +med.dosage.amountPerDose : 1,
      date: new Date(),
      userId: storage.getInt('currentUser'),
    });
  });

  if (med.refillReminder) {
    realm.write(() => {
      med.pillCount = med.pillCount! - med.dosage.amountPerDose!;
    })

    if (med.pillCount! <= med.refillReminderCount!) {
      sendRefillReminder(med);
    }
  }

  console.log('Took ' + med.name + ' at ' + new Date().toString() + '.');
}

export function logAsked(realm: Realm, med: Medication) {
  realm.write(() => {
    med.lastAsked = new Date();
  });
  console.log('Asked about ' + med.name + '.');
}
// vim: sw=2 ts=2
