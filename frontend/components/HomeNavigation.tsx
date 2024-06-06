
import AddMedicationScreen from "./AddMedicationScreen";
import HomeScreen from "./HomeScreen";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import LogScreen from "./LogScreen";
import EditMedScreen from "./EditMedScreen";
import AsNeededMedScreen from "./AsNeededMedScreen";
import ProfileScreen from "./ProfileScreen";

const Drawer = createDrawerNavigator();

function HomeNavigation() {
  return(
    <NavigationContainer independent={true}>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="As Needed Medications" component={AsNeededMedScreen} />
        <Drawer.Screen name="Add Medication" component={AddMedicationScreen} />
        <Drawer.Screen name="Medication Logs" component={LogScreen} />
        <Drawer.Screen name="Edit Medication" component={EditMedScreen}
          options={{
                    drawerItemStyle: { display: 'none' }
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default HomeNavigation;
