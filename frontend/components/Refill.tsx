import React from 'react';
import {Medication} from '../realm/models';
import {View, Text, Alert} from 'react-native';
import realm from '../realm/models';
import notifee, {EventType, EventDetail} from '@notifee/react-native';
import storage from '../storage';
import { setCategories } from '../notificationCategories';

// sends the refill reminder
async function sendRefillReminder(med:Medication) {
  // Request permissions (ios)
  await notifee.requestPermission({
    announcement: true,
  });

  // create categories (ios)
  await setCategories();

  // create a channel (android)
  const channelId = await notifee.createChannel({
    id: 'refillReminder',
    name: 'Refill Reminder Channel',
  });

  // display notification based on amount of medication left
  await notifee.displayNotification({
    title: 'Refill Reminder',
    body: 'Refill ' + med.name + '. You have ' + med.pillCount + ' pills left.',
    android: {
      channelId,
      actions: [
        {
          title: 'Refilled',
          pressAction: {id: 'yesRefilled'},
        },
        {
          title: 'Not Refilled',
          pressAction: {id: 'notRefilled'},
        },
      ],
    },
    ios: {
      categoryId: 'refillReminder',
    },
  });

  const cb = (type: EventType, detail: EventDetail) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS && detail.pressAction) {
      if (detail.pressAction.id == 'yesRefilled') {
        resetPillCount(med)
      }
    }
  };

  notifee.onBackgroundEvent(async ({ type, detail}) => {
    cb(type, detail);
  });
  
  notifee.onForegroundEvent(async ({ type, detail}) => {
    cb(type, detail);
  });
}

// resets the pillCount of med
function resetPillCount(med:any) {
  if (med.pillCount < med.refillReminderCount) {
    realm.write(() => {
      med.pillCount = med.pillCount + med.refillAmount;
    })
  }
  console.log('pill count reset');
} 

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
