
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { Button, Text } from '@rneui/themed';
import { useQuery } from '@realm/react';
import { User } from '../realm/models';
import storage from '../storage';
import AuthenticationContext from './AuthenticationContext';

const styles = StyleSheet.create({
  image: {
      width: 175,
      height: 175,
      alignSelf: 'center',
      paddingVertical: '15%',
  },
});

function ProfileScreen() {
  const { signOut } = React.useContext(AuthenticationContext);
  const user = useQuery(User, (users) => {
    return users.filtered('userId = $0', storage.getInt('currentUser'));
  });

  return (
    <SafeAreaView>
      <Image style={styles.image} source={require('../blank-avatar.png')}/>
      <View style={{flexDirection:'column', gap: 10, padding: '5%'}}>
        <Text h4 style={{flexWrap: 'wrap',}}>{`First Name: ${user[0].firstName}`}</Text>
        <Text h4 style={{flexWrap: 'wrap',}}>{`Last Name: ${user[0].lastName}`}</Text>
        <Text h4 style={{flexWrap: 'wrap',}}>{`Email Address: ${user[0].email}`}</Text>
      </View>
      <View>
        <Button onPress={() => signOut()}>
          Logout
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default ProfileScreen;
