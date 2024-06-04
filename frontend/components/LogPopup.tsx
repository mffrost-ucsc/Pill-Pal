import React, {useState} from 'react';
import {View, Modal, Text, StyleSheet} from 'react-native';
import {Button} from '@rneui/themed';
import {logTaken, logAsked, toAsk} from '../log';
import {Medication} from '../realm/models';
import {useRealm, useQuery} from '@realm/react';
import Realm from 'realm';

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
  const meds = useQuery(Medication);
  const med = toAsk(meds);

  if (once) {
    for (const m of meds) {
      realm.write(() => {
        m.lastAsked = undefined;
      });
    }
    once = false;
  }
  // testMeds(realm);

  if (!med) {
    return <View />;
  }

  return (
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
