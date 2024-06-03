import React from 'react';
import {View} from 'react-native';
import {Medication} from '../realm/models';
import {useQuery} from '@realm/react';
import realm from '../realm/models';
import notifee, {EventType} from '@notifee/react-native';

function Refill() {
  const meds = useQuery(Medication);

  // function to send the refill reminder
  const sendRefillReminder = async (med:Medication) => {

    // Request permissions (ios)
    await notifee.requestPermission({
      announcement: true,
      provisional: true
    });

    // create a channel (android)
    const channelId = await notifee.createChannel({
      id: 'refillReminder',
      name: 'Refill Reminder Channel',
    });

    // display notification based on amount of medication left
    await notifee.displayNotification({
      title: 'Refill Reminder',
      body: `Refill ${med.name}. You have ${med.pillCount} pills left.`,
      android: {
        channelId,
        actions: [
          {
            title: 'Refilled',
            pressAction: {id: `yesRefilled ${med._id}`},
          },
          {
            title: 'Not Refilled',
            pressAction: {id: 'notRefilled'},
          },
        ],
      },
    });

    notifee.onBackgroundEvent(async ({ type, detail}) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction) {
        if (detail.pressAction.id.includes('yesRefilled')) {
          resetPillCount(detail.pressAction.id.substring(12))
        }
      }
    });
    
    notifee.onForegroundEvent(async ({ type, detail}) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction) {
        if (detail.pressAction.id.includes('yesRefilled')) {
          resetPillCount(detail.pressAction.id.substring(12))
        }
      }
    });
  }

  async function resetPillCount(medId:string) {
    const toUpdate = useQuery(Medication, meds => {
      return meds.filtered('_id === $0', medId)
    });

    realm.write(() => {
      if (toUpdate[0].pillCount && toUpdate[0].refillAmount) {
        toUpdate[0].pillCount += toUpdate[0].refillAmount
      }
    })
  } 

  // checks if any refills need to be done
  React.useEffect(() => {
    for (const med of meds) {
      if (med.pillCount && med.refillReminderCount) {
        if (med.pillCount <= med.refillReminderCount) {
          sendRefillReminder(med);
        }
      }
    }
  }, [])

  return(
    <></>
  );
}

export default Refill;
