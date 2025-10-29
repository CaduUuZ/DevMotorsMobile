import React, { useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Telas existentes
import CadastroPaciente from './src/screens/CadastroPaciente/CadastroPaciente';
import LoginCadastro from './src/screens/LoginCadastro/LoginCadastro';
import Home from './src/screens/Home/Home';
import ListaExame from './src/screens/ListaExame/ListaExame'; 
import NovoExame from './src/screens/CadastroExame/NovoExame';
import ListaPaciente from './src/screens/ListarPacientes/ListaPaciente';
import TelaRelatorio from './src/screens/Admin/TelaRelatorio/TelaRelatorio';
import ListaPacienteAdmin from './src/screens/Admin/ListaPacienteAdmin/ListaPacienteAdmin';

// --- NAVIGATORS ---
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null); // Armazena dados do usuário
  const [isLoading, setIsLoading] = useState(false);

  // Função chamada quando o usuário faz login ou registro
  const handleLogin = (usuario) => {
    setIsLoading(true);
    console.log('Usuário autenticado:', usuario);
    
    setTimeout(() => {
      setUserToken('dummy-token'); // Define token
      setUserData(usuario); // Salva dados do usuário (id, email)
      setIsLoading(false);
    }, 500); // Animação suave
  };

  // Função de logout
  const handleLogout = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
    }, 300);
  };

  function MainDrawer() {
    return (
      <Drawer.Navigator 
        screenOptions={{ 
          drawerActiveTintColor: '#123458',
          headerStyle: { backgroundColor: '#123458' },
          headerTintColor: '#fff',
        }}
      >
        <Drawer.Screen name="Home">
          {props => <Home {...props} usuario={userData} onLogout={handleLogout} />}
        </Drawer.Screen>
        
        <Drawer.Screen 
          name="CadastroPaciente" 
          component={CadastroPaciente} 
          options={{ title: 'Novo Paciente' }}
        />
        
        <Drawer.Screen name="Lista Paciente">
          {props => <ListaPaciente {...props} usuario={userData} onLogout={handleLogout} />}
        </Drawer.Screen>
        
        <Drawer.Screen name="Novo Exame">
          {props => <NovoExame {...props} usuario={userData} onLogout={handleLogout} />}
        </Drawer.Screen>
        
        <Drawer.Screen name="Lista Exame">
          {props => <ListaExame {...props} usuario={userData} onLogout={handleLogout} />}
        </Drawer.Screen>
        
        <Drawer.Screen name="Relatório" options={{ title: 'Relatório (Admin)' }}>
          {props => <TelaRelatorio {...props} usuario={userData} onLogout={handleLogout} />}
        </Drawer.Screen>
        
        <Drawer.Screen name="Listar Pacientes Admin" options={{ title: 'Pacientes (Admin)' }}>
          {props => <ListaPacienteAdmin {...props} usuario={userData} onLogout={handleLogout} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    );
  }

  function AuthStackScreen() {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login">
          {props => <LoginCadastro {...props} onLogin={handleLogin} />}
        </AuthStack.Screen>
      </AuthStack.Navigator>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#123458" />
        <Text style={{ marginTop: 10, color: '#123458', fontSize: 16 }}>Carregando...</Text>
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
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F1EFEC',
  },
});