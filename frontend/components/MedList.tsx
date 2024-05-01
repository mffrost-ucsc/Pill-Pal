/**
 * This componenet will display a list of the user's current medications
 * It will pull from local storage to do this
 * TODO: I still need to set up retrieving from local storage
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

// json formatted data to test the display with
// TODO: switch this out to retrieve local data
let test_data = [
  {
    'name': 'Medication 1',
    'take': 'twice daily',
    'additional_info': 'take with meals',
  },
  {
    'name': 'Medication 2',
    'take': 'once a day',
    'additional_info': '',
  },
  {
    'name': 'Medication 3',
    'take': '3x a day',
    'additional_info': 'take 30mins before meals',
  }
];

/**
 * This will be a function to grab the data and format it as needed
 * Possibly not required depending on how data is stored
 */
function retrieveData() {
  return test_data;
}

function MedList() {
  const [expanded, setExpanded] = React.useState([0]); // array of currently expanded items
  const medList = useQuery(Medication);

  // will want to retrieve data upon loading this element
  // or retrieve when info has been updated
  React.useEffect(() => {
    retrieveData();
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
