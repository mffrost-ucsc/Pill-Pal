import React from 'react';
import {Medication} from '../realm/models';
import {View, Text} from 'react-native';
import { sendRefillReminder } from './RefillReminder';
import realm from '../realm/models';
import storage from '../storage';

function Refill() {
  const meds = realm.objects(Medication).filtered('userId = $0', storage.getInt('currentUser'));
  const [time, setTime] = React.useState(Date.now()); // want the component to rerender every hour

  // check for any refills
  React.useEffect(() => {
    for (const med of meds) {
      if (med.pillCount && med.refillReminderCount) {
        if (med.pillCount <= med.refillReminderCount) {
          sendRefillReminder(med);
        }
      }

      const interval = setInterval(() => setTime(Date.now()), 900000);
      return () => {
        clearInterval(interval);
      };
    }

  }, []);

  return(
    <>
      <View style={{display: 'none'}}>
        <Text>{time}</Text>
      </View>
    </>
  );
}

export default Refill;
