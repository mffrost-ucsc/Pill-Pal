
import { useQuery } from "@realm/react";
import { Medication } from "../realm/models";
import storage from "../storage";
import { SafeAreaView, ScrollView } from "react-native";
import { ListItem, Button } from "@rneui/themed";
import { logTaken } from "../log";
import realm from "../realm/models";


function AsNeededMedScreen() {
  const asNeededMeds = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0 && dosage.interval = $1', storage.getInt('currentUser'), 'asNeeded');
  });

  return (
    <SafeAreaView>
      <ScrollView>
        {asNeededMeds.map((med, i) => (
          <ListItem key={'asNeeded' + i}>
            <>
              <ListItem.Content>
                <ListItem.Title>{med.name}</ListItem.Title>
                { 
                  <ListItem.Subtitle>
                    {`Take ${(med.dosage.amountPerDose == 1) ? '1 pill' : med.dosage.amountPerDose + ' pills'} as needed`}
                  </ListItem.Subtitle>
                }
              </ListItem.Content>
              <Button onPress={() => logTaken(realm, med)}>Log</Button>
            </>
          </ListItem>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default AsNeededMedScreen;
