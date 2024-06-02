/**
 * Component to just show the app logo with a loading message
 */

import { SafeAreaView, Image, StyleSheet } from "react-native";
import { Text } from "@rneui/themed";

const styles = StyleSheet.create({
  logo: {
      width: 200,
      height: 200,
  },
});

function SplashScreen() {
  return (
    <SafeAreaView>
      <Image style={styles.logo} source={require('../pillHome.png')}/>
      <Text h2>Loading...</Text>
    </SafeAreaView>
  );
}

export default SplashScreen;
