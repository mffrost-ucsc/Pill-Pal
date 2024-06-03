import { SafeAreaView } from "react-native";
import { Text } from "@rneui/themed";
import Log from "./Log";

function LogScreen() {
  return (
    <SafeAreaView style={{paddingHorizontal: '5%'}}>
      <Text h4 style={{paddingVertical: '5%'}}>Here you can view a history of the medications you took and when</Text>
      <Text>Log Entries:</Text>
      <Log/>
    </SafeAreaView>
  );
}

export default LogScreen;