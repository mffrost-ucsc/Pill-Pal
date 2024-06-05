
import React, {useState} from 'react';
import {Text, TextInput, View, Alert} from 'react-native';
import {CheckBox} from '@rneui/themed';
import {MedFrequencyContext} from './MedFrequencyContext';
import {IsRefillReminderContext} from './IsRefillReminderContext';
import {RefillInfoContext} from './RefillInfoContext';

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
