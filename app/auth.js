import AsyncStorage from '@react-native-community/async-storage';

export const USER_KEY = 'auth-users';
export const USER_DATA_KEY = 'users';

export const onSignIn = (users = {}) => {
  AsyncStorage.setItem(USER_KEY, 'true');
  if (users && users.token) {
    console.log('users sign in : ', users);
    AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
  }
};

export const onSignOut = () => {
  AsyncStorage.removeItem(USER_KEY);
  AsyncStorage.removeItem(USER_DATA_KEY);
};

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_KEY)
      .then((res) => {
        if (res !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch((err) => reject(err));
  });
};

export const getUserData = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_DATA_KEY)
      .then((res) => {
        if (res !== null) {
          resolve(JSON.parse(res));
        } else {
          resolve(null);
        }
      })
      .catch((err) => reject(err));
  });
};
