import React from 'react';
import {View, Text} from 'react-native';
import {MedLog} from '../realm/models';
import {useQuery} from '@realm/react';
import storage from '../storage';

export default function Log(): React.JSX.Element {
  const r_logs = useQuery(MedLog, (logs) => {
    return logs.filtered('userId = $0', storage.getInt('currentUser'));
  });
  console.log('length of logs is ' + r_logs.length);
  const logs = r_logs.map(log => {
    return (
      <Text key={log.name + log.date.getTime().toString()}>
        {'Took ' +
          log.amount +
          ' ' +
          log.name +
          ' at ' +
          log.date.toLocaleString()}
      </Text>
    );
  });
  return <View>{logs}</View>;
}

// vim: ts=2 sw=2
