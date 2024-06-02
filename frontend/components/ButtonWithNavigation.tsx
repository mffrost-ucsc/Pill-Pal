import React from 'react';
import {StyleSheet } from 'react-native';
import {Button} from '@rneui/themed';
import {ParamListBase, useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Props {
  routeName?: string
}

const NavigateButton = ({routeName}: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const handlePress = () => {
    console.log('pressing button')
    if (routeName) {
      navigation.navigate(routeName); // Replace 'NewScreen' with the name of your new screen
    } else {
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <Button
      title="Go to Medication Add/Delete Screen"
      onPress={handlePress}
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
    padding: 10,
  },
});

export default NavigateButton;
