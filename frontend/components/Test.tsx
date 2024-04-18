/**
 * This is a Test componenet to check
 * if the fronend and backend are working properly
 * it can be deleted
 */
import React from 'react';
import {Text, SafeAreaView, View} from 'react-native';
import {Button} from '@rneui/themed';

/**
 * This function handles the press event.
 * Basically just makes a get request to the test endpoint
 * and then sets the test state to the output
 */
function handlePress(setTest: Function) {
  fetch('http://localhost:5000/test')
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
      setTest(str);
    })
    .catch((error) => {
      setTest(`ERROR: ${error.toString()}`);
    });
}

/**
 * Basic component with one state variable.
 */
function Test(): React.JSX.Element {
  const [test, setTest] = React.useState('Click the Button');

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
        {test}
      </Text>
    </View>
  );
}

export default Test;
