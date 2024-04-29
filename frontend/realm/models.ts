/**
 * This file will hold our realm models to be used for local storage
 * References:
 *  - https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/quick-start/
 */
import Realm, {BSON, Dictionary} from 'realm';

// dosage info, made dictionary so fields can be separated
// will probably need to change this as we go
interface Dosage extends Dictionary {
  amountPerDose?: number; // number of pills per dose 
  interval?: string; // how often (daily, weekly, etc)
  timesPerInterval?: number // number of times in that interval (like 2x per day)
}

export class Medication extends Realm.Object<Medication> {
  _id!: BSON.ObjectId; // unique id for each med (generated automatically)
  name!: string; // name of the med
  dosage!: Dosage; // see dictionary above
  extraInfo?: string; // additional info about the med (optional)

  static schema: Realm.ObjectSchema = {
    name: 'Medication',
    properties: {
      _id: {type: 'objectId', default: () => new BSON.ObjectId()},
      name: 'string',
      dosage: 'mixed{}',
      extraInfo: 'string',
    },
    primaryKey: '_id',
  };
}
