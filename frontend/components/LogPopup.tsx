import React, {useState} from 'react';
import {View, Modal, Text, StyleSheet} from 'react-native';
import {Button} from '@rneui/themed';
import {logTaken, logAsked, toAsk} from '../log';
import {Medication} from '../realm/models';
import {useRealm, useQuery} from '@realm/react';
import Realm from 'realm';
import storage from '../storage';

function popupContents(
  realm: Realm,
  med: Medication,
  cleanup: () => void,
): React.JSX.Element {
  return (
    <View>
      <Text style={styles.popupText}>
        Did you take {med.dosage.amountPerDose} {med.name}?
      </Text>
      <View style={styles.yesNo}>
        <Button
          style={styles.button}
          onPress={() => {
            logTaken(realm, med);
            cleanup();
          }}>
          Yes
        </Button>
        <Button style={styles.button} onPress={cleanup}>
          No
        </Button>
      </View>
    </View>
  );
}

let once = false;

/**
 * A button the will display a popup asking if the med was taken
 * @returns {React.JSX.Element}
 */
export default function LogPopup(): React.JSX.Element {
  const realm = useRealm();
  const meds = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0 && takeReminder = true', storage.getInt('currentUser'));
  });
  const med = toAsk(meds);
  const [time, setTime] = useState(Date.now()); // want the component to rerender every hour

  if (once) {
    for (const m of meds) {
      realm.write(() => {
        m.lastAsked = undefined;
      });
    }
    once = false;
  }

  React.useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 3600000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!med) {
    return <View />;
  }

  return (
    <>
      <View style={styles.centeredView}>
        <Modal transparent={true}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {popupContents(realm, med, () => {
                logAsked(realm, med);
              })}
            </View>
          </View>
        </Modal>
      </View>
      <View style={{display: 'none'}}>
        <Text>{time}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: '#50505050',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  popupText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  yesNo: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
// vim: sw=2 ts=2
