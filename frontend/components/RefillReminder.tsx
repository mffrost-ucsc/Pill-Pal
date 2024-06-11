
import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {CheckBox} from '@rneui/themed';
import {IsRefillReminderContext} from './IsRefillReminderContext';
import {RefillInfoContext} from './RefillInfoContext';
import notifee, {EventType, EventDetail} from '@notifee/react-native';
import { setCategories } from '../notificationCategories';
import { Medication } from '../realm/models';
import realm from '../realm/models';

// sends the refill reminder
export async function sendRefillReminder(med:Medication) {
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
function resetPillCount(med:Medication) {
    realm.write(() => {
        med.pillCount = med.pillCount! + med.refillAmount!;
    })

    console.log('pill count reset to ' + med.pillCount);
} 

export const RefillReminder = () => {
    const isRefillReminderContext = React.useContext(IsRefillReminderContext);
    const refillInfoContext = React.useContext(RefillInfoContext); // index 0 = refillAmount, 1 = refillReminderCount, 2 = pillCount
    const toggleCheckbox = () => isRefillReminderContext!.setIsRefillReminder(!isRefillReminderContext!.isRefillReminder);

    const updateRefillInfo = (index:number, value:number) => {
        let prev:[number, number, number] = [...refillInfoContext!.refillInfo];

        prev[index] = value;

        refillInfoContext!.setRefillInfo(prev);
    }

    return(
        <View>
            <CheckBox
                checked={isRefillReminderContext!.isRefillReminder}
                onPress={toggleCheckbox}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                title="Send Me Reminders to Refill This Medication"
            />
            <View style={{display: (isRefillReminderContext!.isRefillReminder) ? 'flex' : 'none'}}>
                <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap', paddingVertical: '2%'}}>
                    <Text>{'Amount Per Refill'}</Text>
                    <TextInput
                        onChangeText={(val) => updateRefillInfo(0, Number(val))}
                        value={(refillInfoContext!.refillInfo[0]) ? String(refillInfoContext!.refillInfo[0]) : ''}
                        inputMode='numeric'
                        placeholder='Refill Amount'
                    />
                </View>
                <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap', paddingVertical: '2%'}}>
                    <Text>{'Number of Pills Left Before Reminder'}</Text>
                    <TextInput
                        onChangeText={(val) => updateRefillInfo(1, Number(val))}
                        value={(refillInfoContext!.refillInfo[1]) ? String(refillInfoContext!.refillInfo[1]) : ''}
                        inputMode='numeric'
                        placeholder='Amount Before Reminder'
                    />
                </View>
                <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap', paddingVertical: '2%'}}>
                    <Text>{'Current Amount'}</Text>
                    <TextInput
                        onChangeText={(val) => updateRefillInfo(2, Number(val))}
                        value={(refillInfoContext!.refillInfo[2]) ? String(refillInfoContext!.refillInfo[2]) : ''}
                        inputMode='numeric'
                        placeholder='Current Amount'
                    />
                </View>
            </View>
        </View>
    );
}
