import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NavigateButton: React.FC = ({routeName}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    console.log('pressing button')
    navigation.navigate(routeName); // Replace 'NewScreen' with the name of your new screen
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