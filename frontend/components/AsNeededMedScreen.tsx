
import { useQuery } from "@realm/react";
import { Medication } from "../realm/models";
import storage from "../storage";
import { SafeAreaView, ScrollView, Alert } from "react-native";
import { ListItem, Button } from "@rneui/themed";
import { logTaken } from "../log";
import realm from "../realm/models";


function AsNeededMedScreen() {
  const asNeededMeds = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0 && dosage.interval = $1', storage.getInt('currentUser'), 'asNeeded');
  });

  const logMed = (med:any) => {
    const now = new Date();
    Alert.alert('Medication Logged', 'Log added.', [{text: 'OK'}]);
    logTaken(realm, med);
    realm.write(() => {
      med.lastTaken = now;
    });
  }

  const handleLog = (med:any) => {
    if (med.lastTaken) {
      const now = new Date();
      const lastTaken = new Date(med.lastTaken);
      const canTake = new Date(lastTaken.getFullYear(), lastTaken.getMonth(), lastTaken.getDate(), lastTaken.getHours() + med.dosage.timeBetweenDose, lastTaken.getMinutes());

      // alert user if it is too soon to take med
      if (now.getTime() < canTake.getTime()) {
        Alert.alert('Warning: Too Soon to Take Medication Again', `The next time you can take ${med.name} is ${(canTake.toDateString() === now.toDateString()) ? 'today' : canTake.toDateString()} at ${canTake.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Are you sure you want to take ${med.name} now?`,
          [
            {
              text: 'Yes',
              onPress: () => logMed(med),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            }
          ],
        );
      } else {
        logMed(med);
      }
    } else {
      logMed(med);
    }
  }


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
                     {`Take ${(med.dosage.amountPerDose == 1) ? '1 pill' : med.dosage.amountPerDose + ' pills'} ${(med.dosage.timeBetweenDose) ? ((med.dosage.timeBetweenDose == 1) ? 'every hour ' : 'every ' + med.dosage.timeBetweenDose + ' hours ') : ''}as needed`}
                  </ListItem.Subtitle>
                }
              </ListItem.Content>
              <Button onPress={() => handleLog(med)}>
                Log
              </Button>
            </>
          </ListItem>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default AsNeededMedScreen;
