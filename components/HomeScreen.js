import React, {useState, useEffect, useContext, createContext} from 'react';
import {
  Text,
  SafeAreaView,
  View,
  ScrollView,
  RefreshControl,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {Toolbar, Divider, Subheader} from 'react-native-material-ui';
import Modal from 'react-native-modal';
import {getUserData, onSignOut} from '../app/auth';
import {API_URL} from '@env';

const Stack = createStackNavigator();
const SearchContext = createContext(null);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    backgroundColor: 'white',
  },
  sectionHeaderStyle: {
    backgroundColor: '#0091ea',
    padding: 5,
    color: '#fff',
  },
  sectionHeaderStyleText: {
    fontSize: 18,
    color: '#eee',
  },
  sectionListItemStyle: {
    width: '100%',
    fontSize: 15,
    padding: 15,
    color: '#000',
    backgroundColor: '#e3f2fd',
  },
  listItemSeparatorStyle: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#C8C8C8',
  },
  containerToolbar: {
    backgroundColor: '#01579b',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // marginTop: 22,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

const DataBarang = ({navigation, route}) => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [dialog, setDialog] = useState({
    show: false,
    data: {},
  });
  const searchData = useContext(SearchContext);

  useEffect(() => {
    if (token) {
      console.log(`API URL : ${API_URL}`);
      let url = new URL(`${API_URL}/api/barang_per_kategori_api`);
      let params = {};
      const options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (typeof searchData === 'string' && searchData.length) {
        params.nama_barang = searchData;
      }
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key]),
      );

      fetch(url, options)
        .then((response) => {
          if (response && response.status === 200) {
            return response.json();
          }
          if ((response && response.status !== 200) || !response) {
            return Promise.resolve({});
          }
        })
        .then((json) => {
          let newArray = [];
          if (json && json.constructor === Object && Object.keys(json).length) {
            for (let property in json) {
              newArray.push({title: property, data: json[property]});
            }
          }
          setData(newArray);
        })
        .catch((error) => {
          console.error('error fetch : ', error);
          setData([]);
          if (token) {
            onSignOut();
            navigation.reset({index: 0, routes: [{name: 'Login'}]});
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isLoading, token, searchData]);

  useEffect(() => {
    getUserData()
      .then((user_data) => {
        console.log('user_data : ', user_data);
        if (user_data) {
          setUser(user_data);
        }
        if (user_data && user_data.token) {
          setToken(user_data.token);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const FlatListItemSeparator = () => {
    return (
      //Item Separator
      <Divider />
    );
  };

  const toggleModal = (item = {}) => {
    setDialog({show: !dialog.show, data: item});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal isVisible={dialog && dialog.show === true ? dialog.show : false}>
        <View style={styles.centeredView}>
          {dialog &&
          dialog.data.constructor === Object &&
          Object.keys(dialog.data).length ? (
            <>
              <Text style={styles.modalText}>
                Kode Barang : {dialog.data.id_barang}
              </Text>
              <Text style={styles.modalText}>
                Nama Barang : {dialog.data.nama_barang}
              </Text>
              <Text style={styles.modalText}>Harga : {dialog.data.harga}</Text>
              <Text style={styles.modalText}>
                Jumlah Baik : {dialog.data.jumlah}
              </Text>
              <Text style={styles.modalText}>
                Spesifikasi : {dialog.data.spesifikasi}
              </Text>
              {/* <Text>
                {dialog && dialog.data ? JSON.stringify(dialog.data) : null}
              </Text> */}
            </>
          ) : null}
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => toggleModal({})}>
            <Text style={styles.textStyle}>Tutup</Text>
          </Pressable>
        </View>
      </Modal>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              setLoading(true);
            }}
          />
        }>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <SectionList
              ItemSeparatorComponent={FlatListItemSeparator}
              sections={data}
              renderSectionHeader={({section}) => (
                <Subheader
                  text={`Kategori : ${section.title}`}
                  style={{
                    container: styles.sectionHeaderStyle,
                    text: styles.sectionHeaderStyleText,
                  }}
                />
              )}
              renderItem={({item}) => (
                // Single Comes here which will be repeatative for the FlatListItems
                <Text
                  style={styles.sectionListItemStyle}
                  //Item Separator View
                  onPress={() => toggleModal(item)}>
                  {item.nama_barang}
                </Text>
              )}
              keyExtractor={(item, index) => index}
              refreshing={isLoading}
              onRefresh={() => {
                setLoading(true);
              }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const HomeScreen = ({navigation}) => {
  const [searchData, setSearchData] = useState(null);

  return (
    <SearchContext.Provider value={searchData}>
      <Stack.Navigator
        initialRouteName={'Data Barang'}
        screenOptions={{
          header: ({scene, previous, navigation}) => {
            const {options} = scene.descriptor;
            const title =
              options.headerTitle !== undefined
                ? options.headerTitle
                : options.title !== undefined
                ? options.title
                : scene.route.name;

            return (
              <Toolbar
                leftElement={previous ? 'arrow-back' : undefined}
                onLeftElementPress={() => navigation.goBack()}
                centerElement={title}
                searchable={{
                  autoFocus: true,
                  placeholder: 'Cari Data Barang...',
                  onChangeText: (text_search) => {
                    setSearchData(text_search);
                  },
                  // onSubmitEditing: (text_search) => {
                  //   setSearchData(text_search);
                  // },
                  onSearchCloseRequested: () => {
                    setSearchData(null);
                  },
                }}
                rightElement={{
                  menu: {
                    icon: 'more-vert',
                    labels: ['Logout'],
                  },
                }}
                onRightElementPress={(label) => {
                  const {index = null} = label;
                  switch (index) {
                    case 0:
                      try {
                        onSignOut();
                        navigation.reset({index: 0, routes: [{name: 'Login'}]});
                      } catch (error) {
                        console.error(error);
                      }
                      break;

                    default:
                      break;
                  }
                }}
                style={{container: styles.containerToolbar}}
              />
            );
          },
        }}>
        <Stack.Screen name="Data Barang" component={DataBarang} />
      </Stack.Navigator>
    </SearchContext.Provider>
  );
};

export default HomeScreen;
