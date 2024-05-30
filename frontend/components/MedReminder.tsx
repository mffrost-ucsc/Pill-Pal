/**
 * This component handles the reminders to take medications, including the
 * checkbox and time fields.
 */

import React, {useState} from 'react';
import {Text, TextInput, View, Alert} from 'react-native';
import {CheckBox} from '@rneui/themed';
import notifee, {AndroidNotificationSetting, TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility} from '@notifee/react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import {IsMedReminderContext} from './IsMedReminderContext';

export async function setReminder(index:number, notifId:string, medName:string, dosageAmount:string, value:string, reminderTimes:any[]) {
  const settings = await notifee.getNotificationSettings();
  const date = new Date(Date.now());
  let interval;

  // date takes military time
  if (reminderTimes[index].period == 'PM' && reminderTimes[index].hours != 12) {
    reminderTimes[index].hours += 12;
  } else if (reminderTimes[index].period == 'AM' && reminderTimes[index].hours == 12) {
    reminderTimes[index].hours = 0;
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
    });

    // create a channel (android)
    const channelId = await notifee.createChannel({
      id: 'takeMedReminder',
      name: 'Take Med Reminder Channel',
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
        },
      },
      trigger,
    );
  } else { // inform user they need to change their permissions (android)
    Alert.alert('Permissions Required', 'Please enable SCHEDULE_EXACT_ALARM permissions in your settings. Otherwise you will not recieve reoccurring notifications from the app.', [{text: 'OK'}]);
    await notifee.openAlarmPermissionSettings();
  }
}

export const MedReminder = () => {
  const medReminderTimesContext = React.useContext(MedReminderTimesContext);
  const medFrequencyContext = React.useContext(MedFrequencyContext); // index 1 is interval (daily, weekly, asNeeded), index 0 is number of times per interval
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const [hour, setHour] = useState<Array<number>>([]);
  const [min, setMin] = useState<Array<number>>([]);
  const [dayDropdownOpen, setDayDropdownOpen] = useState<Array<boolean>>([]);
  const [dayVal, setDayVal] = useState<Array<any>>([]);
  const [day, setDay] = useState([
    {label: 'Monday', value: 1},
    {label: 'Tuesday', value: 2},
    {label: 'Wednesday', value: 3},
    {label: 'Thursday', value: 4},
    {label: 'Friday', value: 5},
    {label: 'Saturday', value: 6},
    {label: 'Sunday', value: 0},
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
