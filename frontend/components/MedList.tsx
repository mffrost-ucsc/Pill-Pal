/**
 * This componenet will display a list of the user's current medications
 * It will pull from local storage to do this
 *
 * References:
 *  - https://reactnativeelements.com/docs/components/listItem_accordion#props
 *  - https://stackoverflow.com/questions/75057902/how-to-expand-only-one-item-from-a-list-item-accordion-in-react-native
 *
 * If there is trouble seeing icons, follow the installation instructions on https://github.com/oblador/react-native-vector-icons?tab=readme-ov-file#installation
 */

import React from 'react';
import {useQuery} from '@realm/react';
import {ScrollView} from 'react-native';
import {ListItem, Text} from '@rneui/themed';
import {Medication} from '../realm/models';
import storage from '../storage';

function MedList() {
  const [expanded, setExpanded] = React.useState([0]); // array of currently expanded items
  const medList = useQuery(Medication, (meds) => {
    return meds.filtered('userId = $0', storage.getInt('currentUser'));
  });;

  React.useEffect(() => {
    setExpanded([]);
  }, [setExpanded]);

  return(
    <ScrollView>
      {medList.map((med, i) => (
        <ListItem.Accordion
          key={i}
          icon={{name:'chevron-down', type:'material-community'}}
          content={
            <>
              <ListItem.Content>
                <ListItem.Title>{med.name}</ListItem.Title>
                <ListItem.Subtitle>{med.dosage.interval}</ListItem.Subtitle>
              </ListItem.Content>
            </>
          }
          isExpanded={expanded.includes(i)}
          onPress={() => {
            if (expanded.includes(i)) {
              setExpanded(expanded.filter(i => i !== i));
            } else {
              setExpanded([...expanded, i]);
            }
          }}
        >
          <Text style={{padding: '5%'}}>Additional Info: {(med.extraInfo) ? med.extraInfo : "None"}</Text>
        </ListItem.Accordion>
      ))}
    </ScrollView>
  );
}

export default MedList;
