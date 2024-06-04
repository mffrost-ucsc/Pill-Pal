/**
 * This file will hold our realm models to be used for local storage
 * References:
 *  - https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */
import Realm, {BSON, Dictionary} from 'realm';

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

let realm = new Realm({ schema: [User, Medication, MedLog] })
export default realm;
