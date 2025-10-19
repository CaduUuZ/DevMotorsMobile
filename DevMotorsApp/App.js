import React, { useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Telas existentes
import CadastroPaciente from './src/screens/CadastroPaciente/CadastroPaciente';
import LoginRegisterScreen from './src/screens/LoginCadastro/Login';
import Home from './src/screens/Home/Home';
import ListaExame from './src/screens/Exames/ListaExame/ListaExame'; 
import NovoExame from './src/screens/Exames/NovoExame/NovoExame';
import ListaPaciente from './DevMotorsApp/src/screens/ListarPacientes/ListaPaciente.js';

// --- NAVIGATORS ---
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const setIsLoggedIn = (isLoggedIn) => {
    setIsLoading(true);
    setTimeout(() => {
      setUserToken(isLoggedIn ? 'dummy-token' : null);
      setIsLoading(false);
    }, 700);
  };

  function MainDrawer() {
    return (
      <Drawer.Navigator screenOptions={{ drawerActiveTintColor: '#123458' }}>
        <Drawer.Screen name="Home">
          {props => <Home {...props} onLogout={() => setIsLoggedIn(false)} />}
        </Drawer.Screen>

        <Drawer.Screen 
          name="CadastroPaciente" 
          component={CadastroPaciente} 
          options={{ title: 'Novo Paciente' }}
        />

        <Drawer.Screen 
          name="ListaPaciente"
          component={ListaPaciente}
          options={{ title: 'Lista Pacientes' }}
        />

        <Drawer.Screen name="Novo Exame">
          {props => <NovoExame {...props} onLogout={() => setIsLoggedIn(false)} />}
        </Drawer.Screen>

        <Drawer.Screen 
          name="Lista Exame"
          component={props => <ListaExame {...props} onLogout={() => setIsLoggedIn(false)} />}
        />
      </Drawer.Navigator>
    );
  }

  function AuthStackScreen() {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login">
          {props => <LoginRegisterScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
        </AuthStack.Screen>
      </AuthStack.Navigator>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#123458" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainDrawer} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1EFEC',
  },
});