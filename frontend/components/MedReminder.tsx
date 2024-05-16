
import React, {useState} from 'react';
import {Text, TextInput, View, Alert} from 'react-native';
import {CheckBox} from '@rneui/themed';
import notifee, {AndroidNotificationSetting, TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility, EventType, EventDetail} from '@notifee/react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import {IsMedReminderContext} from './IsMedReminderContext';
import {logAsked, logTaken} from '../log';

export async function setReminder(index:number, notifId:string, medName:string, dosageAmount:string, value:string, reminderTimes:any[], onResponse:(taken: bool) => void) {
  const settings = await notifee.getNotificationSettings();
  const date = new Date(Date.now());
  let interval;

  if (reminderTimes[index].period == 'PM') {
    reminderTimes[index].hours = +reminderTimes[index].hours + 12;
  }

  // set time and interval
  if (value == 'daily') {
    date.setHours(reminderTimes[index].hours);
    date.setMinutes(reminderTimes[index].mins);
    interval = RepeatFrequency.DAILY;
  } else {
    const dist = reminderTimes[index].day - date.getDay();
    date.setDate(date.getDate() + dist);
    date.setHours(reminderTimes[index].hours);
    date.setMinutes(reminderTimes[index].mins);
    interval = RepeatFrequency.WEEKLY;
  }

  // check for proper settings on android
  if (settings.android.alarm == AndroidNotificationSetting.ENABLED) {

    // Request permissions (ios)
    await notifee.requestPermission({
      announcement: true,
      provisional: true
    });

    // create a channel (android)
    const channelId = await notifee.createChannel({
      id: 'takeMedReminder',
      name: 'Take Med Reminder',
    });

    // Create a time-based trigger
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(), 
      repeatFrequency: interval,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    // Create a trigger notification
    await notifee.createTriggerNotification(
      {
        id: notifId,
        title: medName,
        body: 'Take ' + dosageAmount + ' of ' + medName,
        android: {
          channelId: channelId,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PRIVATE,
          autoCancel: false,
          showTimestamp: true,
          actions: [
            {
              title: 'Taken',
              pressAction: {id: 'yes'},
            },
            {
              title: 'Not Taken',
              pressAction: {id: 'no'},
            },
          ],
        },
        ios: {
          categoryId: 'reminder',
        },
      },
      trigger,
    );
  } else { // inform user they need to change their permissions (android)
    Alert.alert('Permissions Required', 'Please enable SCHEDULE_EXACT_ALARM permissions in your settings. Otherwise you will not recieve reoccurring notifications from the app.', [{text: 'OK'}]);
    await notifee.openAlarmPermissionSettings();
  }

  const cb = (type: EventType, detail: EventDetail) => {
    if (type === EventType.ACTION_PRESS) {
      if (detail.pressAction.id === 'yes' || detail.pressAction.id === 'no') {
        onResponse(detail.pressAction.id === 'yes');
      }
      notifee.cancelDisplayedNotification(notifId);
    }
    console.log('in handler');
  };

  notifee.onForegroundEvent(({type, detail}) => {
    cb(type, detail);
  });
  notifee.onBackgroundEvent(async ({type, detail}) => {
    cb(type, detail);
  });

  console.log('reminder set for ' + reminderTimes[index]);
}

export const MedReminder = () => {
  const medReminderTimesContext = React.useContext(MedReminderTimesContext);
  const medFrequencyContext = React.useContext(MedFrequencyContext);
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const [hour, setHour] = useState<Array<number>>([]);
  const [min, setMin] = useState<Array<number>>([]);
  const [dayDropdownOpen, setDayDropdownOpen] = useState<Array<boolean>>([]);
  const [dayVal, setDayVal] = useState<Array<any>>([]);
  const [day, setDay] = useState([
    {label: 'Monday', value: 0},
    {label: 'Tuesday', value: 1},
    {label: 'Wednesday', value: 2},
    {label: 'Thursday', value: 3},
    {label: 'Friday', value: 4},
    {label: 'Saturday', value: 5},
    {label: 'Sunday', value: 6},
  ]);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState<Array<boolean>>([]);
  const [periodVal, setPeriodVal] = useState<Array<string>>([]);
  const [currentPeriodVal, setCurrentPeriodVal] = useState(null);
  const [period, setPeriod] = useState([
    {label: 'AM', value: 'AM'},
    {label: 'PM', value: 'PM'},
  ]);
  const [currentDay, setCurrentDay] = useState(null);
  const toggleCheckbox = () => isMedReminderContext!.setIsMedReminder(!isMedReminderContext!.isMedReminder);

  const addReminderTime = (index:number, field:string, newVal:string) => {
    let newList = [... medReminderTimesContext!.medReminderTimes];

    if (!newList[index]) {
      newList[index] = {'hours': NaN, 'mins': NaN, 'day': '', 'period': ''};
    }

    let temp;
    if (field == 'hours') {
      temp = [...hour];
      temp[index] = Number(newVal);
      setHour(temp);
      newList[index].hours = newVal;
    } else if (field == 'mins') {
      if (Number(newVal) > 0) {
        newVal = newVal.replace(/^0+/, '');
      }
      temp = [...min];
      temp[index] = Number(newVal);
      setMin(temp);
      newList[index].mins = newVal;
    } else if (field == 'day') {
      let temp = [... dayVal];
      temp[index] = newVal;
      setDayVal(temp);
      newList[index].day = newVal;
    } else {
      let temp = [... periodVal];
      temp[index] = newVal;
      setPeriodVal(temp);
      newList[index].period = newVal;
    }

    medReminderTimesContext!.setMedReminderTimes(newList);
  }

  const calcDropdownOpen = (index:number, dropdown:boolean[]) => {
    const temp = [...dropdown];

    if (temp[index]) {
      temp[index] = false;
    } else {
      temp[index] = true;
    }

    return temp;
  }

  React.useEffect(() => {
    for (let i = 0; i < dayVal.length; i++) {
      if (dayVal[i] == 'updating') {
        addReminderTime(i, 'day', currentDay!);
      }
    }
  }, [currentDay]);

  React.useEffect(() => {
    for (let i = 0; i < periodVal.length; i++) {
      if (periodVal[i] == 'updating') {
        addReminderTime(i, 'period', currentPeriodVal!);
      }
    }
  }, [currentPeriodVal]);

  const [isSet, setIsSet] = React.useState(false);
  if (!isSet) {
    notifee.setNotificationCategories([
      {
        id: 'reminder',
        actions: [
          {
            id: 'yes',
            title: 'Taken',
          },
          {
            id: 'no',
            title: 'Not Taken',
          },
        ],
      },
    ]);
  }

  return (
    <View>
      <CheckBox
            disabled={(medFrequencyContext!.medFrequency[1] == 'asNeeded') ? true : false}
            checked={(medFrequencyContext!.medFrequency[1] == 'asNeeded') ? false : isMedReminderContext!.isMedReminder}
            onPress={toggleCheckbox}
            iconType="material-community"
            checkedIcon="checkbox-outline"
            uncheckedIcon={'checkbox-blank-outline'}
            title="Send Me Reminders to Take This Medication"
      />
      <View style={{display: (isMedReminderContext!.isMedReminder && medFrequencyContext!.medFrequency[1] != 'asNeeded') ? 'flex' : 'none'}}>
        {(!Number.isNaN(medFrequencyContext!.medFrequency[0]) && !(medFrequencyContext!.medFrequency[1].length == 0)) ? Array.from({length: medFrequencyContext!.medFrequency[0]},(_, index) =>
          (medFrequencyContext!.medFrequency[1] == 'daily') ?
          <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap'}} key={'daily' + index}>
            <Text>{'Reminder ' + (index + 1) + ':'}</Text>
            <TextInput
              onChangeText={(newVal) => addReminderTime(index, 'hours', newVal)}
              value={(hour[index]) ? String(hour[index]) : ''}
              inputMode='numeric'
              placeholder="Hour" 
            />
            <TextInput
              onChangeText={(newVal) => addReminderTime(index, 'mins', newVal)}
              value={(min[index] || min[index] == 0) ? ((min[index] < 10) ? '0' + String(min[index]) : String(min[index])) : ''}
              inputMode='numeric'
              placeholder="Minute" 
            />
            <DropDownPicker
              open={periodDropdownOpen[index]}
              value={periodVal[index]}
              items={period}
              setOpen={() => setPeriodDropdownOpen(calcDropdownOpen(index, periodDropdownOpen))}
              setValue={(val) => {
                let temp = [... periodVal];
                temp[index] = 'updating';
                setPeriodVal(temp);
                setCurrentPeriodVal(val);
              }}
              setItems={setPeriod}
              listMode="SCROLLVIEW"
              dropDownDirection="TOP"
              placeholder='AM or PM'
            />
          </View>
          : 
          <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap'}} key={'weekly' + index}>
            <Text key={index}>{'Reminder ' + (index + 1) + ':'}</Text>
            <TextInput
              onChangeText={(newVal) => addReminderTime(index, 'hours', newVal)}
              value={(hour[index]) ? String(hour[index]) : ''}
              inputMode='numeric'
              placeholder="Hour" 
            /> 
            <TextInput
              onChangeText={(newVal) => addReminderTime(index, 'mins', newVal)}
              value={(min[index] || min[index] == 0) ? ((min[index] < 10) ? '0' + String(min[index]) : String(min[index])) : ''}
              inputMode='numeric'
              placeholder="Minute" 
            />
            <DropDownPicker
              open={periodDropdownOpen[index]}
              value={periodVal[index]}
              items={period}
              setOpen={() => setPeriodDropdownOpen(calcDropdownOpen(index, periodDropdownOpen))}
              setValue={(val) => {
                let temp = [... periodVal];
                temp[index] = 'updating';
                setPeriodVal(temp);
                setCurrentPeriodVal(val);
              }}
              setItems={setPeriod}
              listMode="SCROLLVIEW"
              dropDownDirection="TOP"
              placeholder='AM or PM'
            />
            <DropDownPicker
              open={dayDropdownOpen[index]}
              value={dayVal[index]}
              items={day}
              setOpen={() => setDayDropdownOpen(calcDropdownOpen(index, dayDropdownOpen))}
              setValue={(val) => {
                let temp = [... dayVal];
                temp[index] = 'updating';
                setDayVal(temp);
                setCurrentDay(val);
              }}
              setItems={setDay}
              listMode="SCROLLVIEW"
              dropDownDirection="TOP"
              placeholder='Day of the Week'
            />
          </View>
        ) : (<Text>{'Please Fill in the Information Above'}</Text>)}
      </View>
    </View>
  );
}
