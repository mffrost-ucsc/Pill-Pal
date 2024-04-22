/**
 * For Now, this component is a button that will send the user a notification
 * References/Credits:
 *  - https://notifee.app/react-native/docs/displaying-a-notification
 */

import React from 'react';
import notifee, {IntervalTrigger, TriggerType, TimeUnit} from '@notifee/react-native';
import {View, Alert} from 'react-native';
import {Button} from '@rneui/themed';

/**
 * Handles the onPress event for the Notification
 */
async function handleNotification() {
  // Request permissions (ios)
  await notifee.requestPermission({
    announcement: true,
    provisional: true
  });

  // create a channel (android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // display notification
  await notifee.displayNotification({
    title: 'Test Notification',
    body: 'Hello',
    android: {
      channelId,
      // if notification is pressed will open the app
      pressAction: {
        id: 'default',
      },
    },
  });
}

/**
 * Handles creating the reoccuring notification
 */
async function handleReoccurring() {
  // Request permissions (ios)
  await notifee.requestPermission({
    announcement: true,
    provisional: true
  });

  // create a channel (android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // create a trigger
  const trigger: IntervalTrigger = {
    type: TriggerType.INTERVAL,
    interval: 15,
    timeUnit: TimeUnit.MINUTES
  };

  // create the notification
  await notifee.createTriggerNotification(
    {
      id: 'every15mins',
      title: 'Reoccurring Notification',
      body: ':)',
      android: {
        channelId
      },
    },
    trigger,
  );

  // Alert the uer the notification is set
  Alert.alert('Reoccurring Notification Set', 'You should recieve a notification every 15 mins', [{text: 'OK'}]);
}

/**
 * Cancels the reoccurring notification
 * @param id the id of the notification
 */
async function cancelReoccurring(id:string) {
  await notifee.cancelNotification(id);

  // Alert the uer the notification is canceled
  Alert.alert('Reoccurring Notification Canceled', '', [{text: 'OK'}]);
}

/**
 * A button the will send the user a notification when they push it
 * @returns {React.JSX.Element}
 */
export function NotificationButton(): React.JSX.Element {
  return (
    <View>
      <Button title="Send Notification"
        type="solid"
        onPress={() => handleNotification()}
      />
    </View>
  );
}

/**
 * 2 Buttons:
 * One will create a reoccurring notification (triggers every 15 mins, minimum notifee will allow)
 * The other will cancel the notification
 * @returns {React.JSX.Element}
 */
export function ReoccurringNotification(): React.JSX.Element {
  return (
    <View style={{flexDirection:'column', gap: 10}}>
      <Button title="Send Notif. Every 15 Mins"
        type="solid"
        onPress={() => handleReoccurring()}
      />
      <Button title="Cancel 15 Min Notification"
        type="solid"
        onPress={() => cancelReoccurring('every15mins')}
      />
    </View>
  );
}
