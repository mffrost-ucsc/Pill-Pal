
import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View, Alert} from 'react-native';
import {Button, CheckBox} from '@rneui/themed';
import notifee, {AndroidNotificationSetting, TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility} from '@notifee/react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import {IsMedReminderContext} from './IsMedReminderContext';

export async function setReminder(index:number, notifId:string, medName:string, dosageAmount:string, value:string, reminderTimes:any[]) {
  const settings = await notifee.getNotificationSettings();
  const date = new Date(Date.now());
  let interval;

  if (reminderTimes[index].period == 'PM') {
    reminderTimes[index].hours += 12;
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
  const medFrequencyContext = React.useContext(MedFrequencyContext);
  const isMedReminderContext = React.useContext(IsMedReminderContext);
  const [hour, setHour] = useState<Array<number>>([]);
  const [min, setMin] = useState<Array<number>>([]);
  const [dayDropdownOpen, setDayDropdownOpen] = useState<Array<boolean>>([]);
  const [dayVal, setDayVal] = useState<Array<any>>([]);
  const [day, setDay] = useState<Array<Array<Record<any, any>>>>([]);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [periodVal, setPeriodVal] = useState(null);
  const [period, setPeriod] = useState([
    {label: 'AM', value: 'AM'},
    {label: 'PM', value: 'PM'},
  ]);
  const [currentDay, setCurrentDay] = useState(null);
  const toggleCheckbox = () => isMedReminderContext!.setIsMedReminder(!isMedReminderContext!.isMedReminder);

  const addReminderTime = (index:number, field:string, newVal:string) => {
    let newList = medReminderTimesContext!.medReminderTimes;

    if (!newList[index]) {
      newList[index] = {'hours': NaN, 'mins': NaN, 'day': '', 'period': ''};
    }

    let temp;
    if (field == 'hours') {
      temp = [...hour];
      temp[index] = Number(newVal);
      setHour(temp);
      newList[index]['hours'] = hour[index];
    } else if (field == 'mins') {
      temp = [...min];
      temp[index] = Number(newVal);
      setMin(temp);
      newList[index]['mins'] = min[index];
    } else if (field == 'day') {
      newList[index]['day'] = dayVal[index];
    } else {
      newList[index]['period'] = period[index];
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

  const calcVal = (index:number, valList:any[], val:any) => {
    const temp = [...valList];

    temp[index] = val;

    return temp;
  }

  React.useEffect(() => {
    let dayDropdown = [];
    let dayVals = [];
    let tempDayVal =[];
    let hourList = [];
    let minList = [];
    for (let i = 0; i < medFrequencyContext!.medFrequency[0]; i++) {
      dayDropdown.push(false);
      dayVals.push([
        {label: 'Monday', value: 0},
        {label: 'Tuesday', value: 1},
        {label: 'Wednesday', value: 2},
        {label: 'Thursday', value: 3},
        {label: 'Friday', value: 4},
        {label: 'Saturday', value: 5},
        {label: 'Sunday', value: 6},
      ]);
      tempDayVal.push(null);
      hourList.push(NaN);
      minList.push(NaN);
    }

    setDayDropdownOpen(dayDropdown);
    setDay(dayVals);
    setDayVal(tempDayVal);
    setHour(hourList);
    setMin(minList);
  });

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
        {(medFrequencyContext!.medFrequency[0] || medFrequencyContext!.medFrequency[1]) ? Array.from({length: medFrequencyContext!.medFrequency[0]},(_, index) =>
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
              open={periodDropdownOpen}
              value={periodVal}
              items={period}
              setOpen={setPeriodDropdownOpen}
              setValue={setPeriodVal}
              setItems={setPeriod}
              listMode="SCROLLVIEW"
              containerStyle={{
                zIndex: periodDropdownOpen ? 1000 : 0
              }}
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
              open={periodDropdownOpen}
              value={periodVal}
              items={period}
              setOpen={setPeriodDropdownOpen}
              setValue={setPeriodVal}
              setItems={setPeriod}
              listMode="SCROLLVIEW"
              containerStyle={{
                zIndex: periodDropdownOpen ? 1000 : 0
              }}
              placeholder='AM or PM'
            />
            <DropDownPicker
              open={dayDropdownOpen[index]}
              value={dayVal[index]}
              items={day[index]}
              setOpen={() => setDayDropdownOpen(calcDropdownOpen(index, dayDropdownOpen))}
              setValue={setCurrentDay}
              onChangeValue={(val) => {setDayVal(calcVal(index, dayVal, val)); addReminderTime(index, 'day', val)}}
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
