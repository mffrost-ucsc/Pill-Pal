
import AddMedicationScreen from "./AddMedicationScreen";
import HomeScreen from "./HomeScreen";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import LogScreen from "./LogScreen";

const Drawer = createDrawerNavigator();

function HomeNavigation() {
  return(
    <NavigationContainer independent={true}>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Add Medication" component={AddMedicationScreen} />
        <Drawer.Screen name="Medication Logs" component={LogScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default HomeNavigation;
