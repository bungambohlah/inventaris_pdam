/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  COLOR,
  ThemeContext,
  getTheme,
  Subheader,
  Button,
  Snackbar,
} from 'react-native-material-ui';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './components/HomeScreen';
import AboutMe from './components/AboutMe';
import {isSignedIn, onSignIn, onSignOut} from './app/auth';
import {API_URL} from '@env';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  tabNavigator: {
    backgroundColor: '#e91e63',
  },
  image_login: {
    marginBottom: 0,
  },
  inputView: {
    backgroundColor: '#90caf9',
    borderRadius: 30,
    width: '70%',
    height: 45,
    marginBottom: 20,
    alignItems: 'center',
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
  },
  loginBtn: {
    width: '80%',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: '#2196f3',
  },
});

// you can set your style right here, it'll be propagated to application
const uiTheme = {
  palette: {
    primaryColor: COLOR.green500,
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};

const HomeContainer = ({navigation}) => {
  useEffect(() => {
    isSignedIn()
      .then((signIn) => {
        if (!signIn) {
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        }
      })
      .catch((error) => {
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
      });
  });
  return (
    <Tab.Navigator
      initialRouteName="Data Barang"
      activeColor="#f6f8fa"
      style={styles.tabNavigator}>
      <Tab.Screen
        name="Data Barang"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Data Barang',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Tentang Kami"
        component={AboutMe}
        options={{
          tabBarLabel: 'Tentang Kami',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const LoginContainer = ({navigation}) => {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const snackBarRef = useRef(null);

  const loginAPI = () => {
    setLoading(true);
    const body = {username, password};
    let formBody = [];
    for (let property in body) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(body[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody,
    };
    console.log(`API URL : ${API_URL}`);
    fetch(`${API_URL}/api/login`, options)
      .then((res) => res.json())
      .then((json) => {
        // console.log('json : ', json);
        if (Array.isArray(json) && json.length) {
          onSignIn(json[0]);
          navigation.reset({
            index: 0,
            routes: [{name: 'Data Barang'}],
          });
        }
        if (!Array.isArray(json) || json.length <= 0) {
          setSnackBarMessage('Username dan password anda salah!');
          setSnackBarVisible(true);
        }
      })
      .catch((error) => {
        console.error('Error : ', error);
      })
      .finally(() => {
        setLoading(false);
        setUsername(null);
        setPassword(null);
      });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Image
              style={styles.image_login}
              source={require('./assets/logo/logo.png')}
            />
            <View style={styles.inputView}>
              <TextInput
                style={styles.TextInput}
                placeholder="Username."
                placeholderTextColor="#003f5c"
                onChangeText={(username_text) => setUsername(username_text)}
              />
            </View>
            <View style={styles.inputView}>
              <TextInput
                style={styles.TextInput}
                placeholder="Password."
                placeholderTextColor="#003f5c"
                secureTextEntry={true}
                onChangeText={(password_text) => setPassword(password_text)}
              />
            </View>
            <Button
              raised
              primary
              text="LOGIN"
              style={{container: styles.loginBtn}}
              onPress={loginAPI}
            />
          </>
        )}
      </SafeAreaView>
      <View style={{height: 0, justifyContent: 'center'}}>
        <Snackbar
          ref={snackBarRef}
          visible={snackBarVisible}
          message={snackBarMessage}
          bottomNavigation={true}
          actionText="OK"
          button={{
            text: 'OK',
          }}
          onRequestClose={() => setSnackBarVisible(false)}
        />
      </View>
    </>
  );
};

const App = () => {
  return (
    <ThemeContext.Provider value={getTheme(uiTheme)}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Data Barang" component={HomeContainer} />
          <Stack.Screen name="Login" component={LoginContainer} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};

export default App;
