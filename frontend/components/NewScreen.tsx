// NewScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import NavigateButton from './ButtonWithNavigation'; // Import the button component

const NewScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <NavigateButton
        routeName={'HomeScreen'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewScreen;
