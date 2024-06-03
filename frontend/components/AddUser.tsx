/**
 * This is a Test componenet to check
 * if the fronend and backend are working properly
 * it can be deleted
 */
import React from 'react';
import {Text, SafeAreaView, View} from 'react-native';
import {Button} from '@rneui/themed';
import {ServerAddr, ServerPort} from '../communication';

/**
 * This function handles the press event.
 * Basically just makes a get request to the test endpoint
 * and then sets the test state to the output
 */
function handleSignUpPress(addUser: Function, userName: string, password: string) {
  fetch('http://' + ServerAddr + ':' + ServerPort + '/user', {method:'PUT', body{Email:userName,Password:password})
    .then((res) => {
      if (!res.ok) {
        throw res
      }

      return res.json();
    })
    .then((json) => {
      let str = '';
      for (let entry of json) {
        str += entry.title + ' ';
      }
      addUser(str);
    })
    .catch((error) => {
      addUser(`ERROR: ${error.toString()}`);
    });
}


function AddUser(): React.JSX.Element {
  const [user, addUser] = React.useState('Click the Button');

  return (
    <View>
      <Button title="Press Me"
        type="solid"
        onPress={() => {handlePress(setTest)}}
        containerStyle={{
          width: 150,
        }}
      />
      <Text>
        {AddUser}
      </Text>
    </View>
  );
}

export default AddUser;
