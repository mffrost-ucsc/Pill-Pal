/**
 * This component handles the reminders to take medications, including the
 * checkbox and time fields.
 */

import React, {useState} from 'react';
import {Text, TextInput, View, Alert, Platform} from 'react-native';
import {CheckBox} from '@rneui/themed';
import notifee, {AndroidNotificationSetting, TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility, EventType, EventDetail, IntervalTrigger, TimeUnit} from '@notifee/react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {MedReminderTimesContext} from './MedReminderTimesContext';
import {MedFrequencyContext} from './MedFrequencyContext';
import {IsMedReminderContext} from './IsMedReminderContext';
import { AuthorizationStatus } from '@notifee/react-native';
import { Reminder, Medication } from '../realm/models';
import {ServerAddr, ServerPort} from '../communication';
import { setCategories } from '../notificationCategories';
import { logAsked, logTaken } from '../log';
import realm from '../realm/models';
import storage from '../storage';
import moment from 'moment'; // for formatting date

export async function remindIn15(med:Medication, onResponse:(taken: boolean) => void) {
  // create a channel (android)
  const channelId = await notifee.createChannel({
    id: 'takeMedReminder',
    name: 'Take Med Reminder Channel',
  });

  // create categories (ios)
  await setCategories();

  // create interval trigger
  const trigger: IntervalTrigger = {
    type: TriggerType.INTERVAL,
    interval: 15,
    timeUnit: TimeUnit.MINUTES
  };

  // Create a trigger notification
  const notifId = await notifee.createTriggerNotification(
    {
      title: med.name,
      body: 'Take ' + med.dosage.amountPerDose + ' of ' + med.name,
      android: {
        channelId: channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PRIVATE,
        autoCancel: false,
        showTimestamp: true,
        actions: [
          {
            title: 'Taken',
            pressAction: {id: 'confirm'},
          },
          {
            title: 'Remind Later',
            pressAction: {id: 'wait'}
          },
          {
            title: 'Not Taken',
            pressAction: {id: 'deny'},
          },
        ],
      },
      ios: {
        categoryId: 'takeReminder',
      },
    },
    trigger,
  );

  const cb = (type: EventType, detail: EventDetail) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS && pressAction) {
      if (pressAction.id === 'confirm' || pressAction.id === 'deny') {
        onResponse(pressAction.id === 'confirm');
      } else if (pressAction.id === 'wait') {
        remindIn15(med, taken => {
          logAsked(realm, med);
          if (taken) {
            logTaken(realm, med);
          }
        },);
      }
    }
  };

  notifee.onForegroundEvent(({type, detail}) => {
    cb(type, detail);
  });
  notifee.onBackgroundEvent(async ({type, detail}) => {
    cb(type, detail);
  });

  console.log('created 15min notification');
}

function addReminderToDB(reminder:Reminder, token:string) {
  let header:any = {'Content-Type': 'application/json'};
  const data:any = {
    MedicationID: reminder.medId,
    ReminderID: reminder._id,
    Hour: reminder.hour,
    Minute: reminder.minute,
    Modified: moment(reminder.lastModified).format('YYYY-MM-DD HH:mm:ss')
  };

  if (reminder.day) {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    data['Day'] = days[reminder.day];
  }

  if (token != null) {
    header = {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
  }

  let url = 'http://' + ServerAddr + ':' + ServerPort + '/reminder';

  fetch(url, 
    {
      method: 'PUT',
      headers: header,
      body: JSON.stringify(data),
    }
  )
  .then((res) => {
    if (!res.ok) {
      throw res;
    }

    console.log('reminder added sucessfully');
  })
  .catch((error) => {
    if (error.status == 401) {
      Alert.alert('Invalid Credentials', 'Please login again.', [{text: 'OK'}]);
    } else {
      console.log(`ERROR: ${JSON.stringify(error)}`);
    }
  });
}

// sets up a reoccurring reminder using notifee
// does not store the reminder information
export async function setReminderNoStore(reminder:Reminder, onResponse:(taken: boolean) => void) {
  const date = new Date();
  let med:any = realm.objects(Medication).filtered('_id = $0', reminder.medId)[0];
  let interval;

  if (!med) {
    med = {name: 'medication', dosage: {amountPerDose: 'dosage'}}
  }

  // Request permissions (ios)
  await notifee.requestPermission({
    announcement: true,
  });

  // create categories (ios)
  await setCategories();

  // set time and interval
  if (reminder.day == null) {
    date.setHours(reminder.hour);
    date.setMinutes(reminder.minute);
    interval = RepeatFrequency.DAILY;

    // notifee doesn't accept dates in the past, so increment date by 1 if needed
    const now = new Date();
    if (date.getTime() < now.getTime()) {
      date.setDate(date.getDate() + 1);
    }
  } else {
    const dist = reminder.day - date.getDay();
    date.setDate(date.getDate() + dist);
    date.setHours(reminder.hour);
    date.setMinutes(reminder.minute);
    interval = RepeatFrequency.WEEKLY;

    // notifee doesn't accept dates in the past, so increment date by 7 if needed
    const now = new Date();
    if (date.getTime() < now.getTime()) {
      date.setDate(date.getDate() + 7);
    }
  }

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
      id: reminder._id,
      title: med.name,
      body: 'Take ' + med.dosage.amountPerDose + ' of ' + med.name,
      android: {
        channelId: channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PRIVATE,
        autoCancel: false,
        showTimestamp: true,
        actions: [
          {
            title: 'Taken',
            pressAction: {id: 'confirm'},
          },
          {
            title: 'Remind Later',
            pressAction: {id: 'wait'}
          },
          {
            title: 'Not Taken',
            pressAction: {id: 'deny'},
          },
        ],
      },
      ios: {
        categoryId: 'takeReminder',
      },
    },
    trigger,
  );

  const cb = (type: EventType, detail: EventDetail) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS && pressAction) {
      if (pressAction.id === 'confirm' || pressAction.id === 'deny') {
        onResponse(pressAction.id === 'confirm');
      } else if (pressAction.id === 'wait') {
        remindIn15(med, taken => {
          logAsked(realm, med);
          if (taken) {
            logTaken(realm, med);
          }
        },);
      }
    }
  };

  notifee.onForegroundEvent(({type, detail}) => {
    cb(type, detail);
  });
  notifee.onBackgroundEvent(async ({type, detail}) => {
    cb(type, detail);
  });

  console.log('reminder set for ' + date.toDateString());
}

// sets up a reoccurring reminder using notifee and adds the reminder to realm and the database
export async function setReminder(index:number, notifId:string, med:Medication, dosageAmount:string, value:string, reminderTimes:any[], token:string, onResponse:(taken: boolean) => void) {
  const settings = await notifee.getNotificationSettings();
  const date = new Date();
  let interval;

  // Request permissions (ios)
  await notifee.requestPermission({
    announcement: true,
  });

  // check user permissions and alert if notifications not enabled
  if (settings.authorizationStatus  == AuthorizationStatus.DENIED) {
    Alert.alert('Permissions Required', 'Notifications are disabled for this app. Please enable them in the settings if you want to recieve reminders.', [{text: 'OK'}]);
  } else if (Platform.OS === 'android' && settings.android.alarm == AndroidNotificationSetting.ENABLED) {
    Alert.alert('Permissions Required', 'Please enable SCHEDULE_EXACT_ALARM permissions in your settings. Otherwise you will not recieve reoccurring notifications from the app.', [{text: 'OK'}]);
    await notifee.openAlarmPermissionSettings();
  }

  // date takes military time
  if (reminderTimes[index].period == 'PM' && reminderTimes[index].hours != 12) {
    reminderTimes[index].hours = Number(reminderTimes[index].hours) + 12;
  } else if (reminderTimes[index].period == 'AM' && reminderTimes[index].hours == 12) {
    reminderTimes[index].hours = 0;
  }

  // set time and interval
  if (value == 'daily') {
    date.setHours(reminderTimes[index].hours);
    date.setMinutes(reminderTimes[index].mins);
    interval = RepeatFrequency.DAILY;

    // notifee doesn't accept dates in the past, so increment date by 1 if needed
    const now = new Date();
    if (date.getTime() < now.getTime()) {
      date.setDate(date.getDate() + 1);
    }
  } else {
    const dist = reminderTimes[index].day - date.getDay();
    date.setDate(date.getDate() + dist);
    date.setHours(reminderTimes[index].hours);
    date.setMinutes(reminderTimes[index].mins);
    interval = RepeatFrequency.WEEKLY;

    // notifee doesn't accept dates in the past, so increment date by 7 if needed
    const now = new Date();
    if (date.getTime() < now.getTime()) {
      date.setDate(date.getDate() + 7);
    }
  }

  // create a channel (android)
  const channelId = await notifee.createChannel({
    id: 'takeMedReminder',
    name: 'Take Med Reminder Channel',
  });

  // create categories (ios)
  await setCategories();

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
      title: med.name,
      body: 'Take ' + dosageAmount + ' of ' + med.name,
      android: {
        channelId: channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PRIVATE,
        autoCancel: false,
        showTimestamp: true,
        actions: [
          {
            title: 'Taken',
            pressAction: {id: 'confirm'},
          },
          {
            title: 'Remind Later',
            pressAction: {id: 'wait'}
          },
          {
            title: 'Not Taken',
            pressAction: {id: 'deny'},
          },
        ],
      },
      ios: {
        categoryId: 'takeReminder',
      },
    },
    trigger,
  );

  const cb = (type: EventType, detail: EventDetail) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS && pressAction) {
      if (pressAction.id === 'confirm' || pressAction.id === 'deny') {
        onResponse(pressAction.id === 'confirm');
      } else if (pressAction.id === 'wait') {
        remindIn15(med, taken => {
          logAsked(realm, med);
          if (taken) {
            logTaken(realm, med);
          }
        },);
      }
    }
  };

  notifee.onForegroundEvent(({type, detail}) => {
    cb(type, detail);
  });
  notifee.onBackgroundEvent(async ({type, detail}) => {
    cb(type, detail);
  });

  // add to realm and database
  let reminder:any;
  realm.write(() => {
    reminder = realm.create(Reminder, {
      _id: notifId,
      userId: storage.getInt('currentUser'),
      medId: med._id,
      hour: date.getHours(),
      minute: date.getMinutes(),
      day: (value == 'daily') ? undefined : date.getDay(),
    });
  });
  addReminderToDB(reminder, token);

  console.log('reminder set for ' + JSON.stringify(reminderTimes[index]));
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
    {label: 'Sunday', value: 0},
    {label: 'Monday', value: 1},
    {label: 'Tuesday', value: 2},
    {label: 'Wednesday', value: 3},
    {label: 'Thursday', value: 4},
    {label: 'Friday', value: 5},
    {label: 'Saturday', value: 6},
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

  React.useEffect(() => {
    // reset data fields when isMedReminder becomes false
    if (!isMedReminderContext!.isMedReminder) {
      setHour([]);
      setMin([]);
      setDayVal([]);
      setCurrentDay(null);
      setPeriodVal([]);
      setCurrentPeriodVal(null);
    }
  }, [isMedReminderContext?.isMedReminder]);

  React.useEffect(() => {
    isMedReminderContext!.setIsMedReminder(false);
  }, []);

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
