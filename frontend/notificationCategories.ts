/**
 * This file holds the categories for notifications (ios only)
 * Reference:
 *  - https://notifee.app/react-native/docs/ios/categories
 */

import notifee from '@notifee/react-native';

export async function setCategories() {
  await notifee.setNotificationCategories([
    {
      id: 'takeReminder',
      actions: [
        {
          id: 'confirm',
          title: 'Taken',
        },
        {
          id: 'wait',
          title: 'Remind Later',
        },
        {
          id: 'deny',
          title: 'Not Taken',
        },
      ],
    },
    {
      id: 'refillReminder',
      actions: [
        {
          title: 'Refilled',
          id: `yesRefilled`,
        },
        {
          title: 'Not Refilled',
          id: 'notRefilled',
        },
      ],
    },
  ]);
}