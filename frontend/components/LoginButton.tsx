import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginButton: React.FC = ({routeName}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    console.log('pressing button')
    navigation.navigate(routeName); // Replace 'NewScreen' with the name of your new screen
  };

  return (
    <Button
      title="Login"
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

export default LoginButton;
