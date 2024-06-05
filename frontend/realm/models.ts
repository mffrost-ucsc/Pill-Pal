/**
 * This file will hold our realm models to be used for local storage
 * References:
 *  - https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */
import Realm, {BSON, Dictionary} from 'realm';
import storage from '../storage';
var base64js = require('base64-js');

// dosage info, made dictionary so fields can be separated
interface Dosage extends Dictionary {
  amountPerDose?: number; // number of pills per dose 
  interval?: string; // how often (daily, weekly, etc)
  timesPerInterval?: number; // number of times in that interval (like 2x per day)
  timeBetweenDose?: number; // hours required before taking med again (for as needed meds)
}

export class User extends Realm.Object<User> {
    userId!: number;
    firstName!: string;
    lastName!: string;
    email!: string;

    static schema: Realm.ObjectSchema = {
      name: 'User',
      properties: {
        userId: 'int',
        firstName: 'string',
        lastName: 'string',
        email: 'string',
      },
      primaryKey: 'userId',
    };
}

export class Medication extends Realm.Object<Medication> {
  _id!: BSON.UUID; // unique id for each med
  userId!: number; // id of the user
  name!: string; // name of the med
  dosage!: Dosage; // see dictionary above
  lastAsked?: Date; // last time asked if taken
  extraInfo?: string; // additional info about the med (optional)
  takeReminder!: boolean;
  reminderId?: string[];
  refillReminder!:boolean;
  refillAmount?: number;
  refillReminderCount?: number;
  pillCount?: number;
  lastTaken?: Date;
  lastModified!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Medication',
    properties: {
      _id: {type: 'uuid', default: () => new BSON.UUID()},
      userId: 'int',
      name: 'string',
      dosage: 'mixed{}',
      lastAsked: 'date?',
      lastLogged: 'date?',
      extraInfo: 'string?',
      takeReminder: {type: 'bool', default: false},
      reminderId: 'string?[]',
      refillReminder: {type: 'bool', default: false},
      refillAmount: 'int?',
      refillReminderCount: 'int?',
      pillCount: 'int?',
      lastTaken: 'date?',
      lastModified: {type: 'date', default: () => new Date()},
    },
    primaryKey: '_id',
  };
}

export class Reminder extends Realm.Object<Reminder> {
  _id!: string; // id of reminder (should match what notifee stores)
  userId!: number; // id of the user
  medId!: BSON.UUID; // id of the medication
  hour!: number; // hour reminder is set to
  minute!: number; // minute reminder is set to
  day?: number; // day reminder is set to (for weekly reminders)
  lastModified!: Date; 

  static schema: Realm.ObjectSchema = {
    name: 'Reminder',
    properties: {
      _id: {type: 'string', default: () => String(new BSON.UUID())},
      userId: 'int',
      medId: 'uuid',
      hour: 'int',
      minute: 'int',
      day: 'int?',
      lastModified: {type: 'date', default: () => new Date()},
    },
    primaryKey: '_id',
  };
}

export class MedLog extends Realm.Object<MedLog> {
  name!: string; // name of the med
  amount!: number; // number of pills taken
  date!: Date; // date/time taken
  userId!: number; // id of the user

  static schema: Realm.ObjectSchema = {
    name: 'MedLog',
    properties: {
      name: 'string',
      amount: 'int',
      date: 'date',
      userId: 'int',
    },
  };
}

// get key for encryption from storage or generate it if it doesn't exist
let key;
let fromStorage = storage.getString('realmKey');
if (fromStorage) {
  key = base64js.toByteArray(fromStorage); 
} else {
  key = key = new Int8Array(64);
  crypto.getRandomValues(key);
  storage.setString('realmKey', base64js.fromByteArray(key));
}
fromStorage = '';

// initialize realm
let realm = new Realm({ schema: [User, Medication, Reminder, MedLog], encryptionKey: key });
export default realm;

// wipe key
key.fill(0);
