import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialIcons";

import LoginCadastro from "./src/screens/LoginCadastro/LoginCadastro";
import Home from "./src/screens/Home/Home";
import ListaExame from "./src/screens/ListaExame/ListaExame";
import NovoExame from "./src/screens/CadastroExame/NovoExame";
import ListaPaciente from "./src/screens/ListarPacientes/ListaPaciente";
import CadastroPaciente from "./src/screens/CadastroPaciente/CadastroPaciente";
import TelaRelatorio from "./src/screens/Admin/TelaRelatorio/TelaRelatorio";
import ListaPacienteAdmin from "./src/screens/Admin/ListaPacienteAdmin/ListaPacienteAdmin";
import ListaUsuarios from "./src/screens/ListaUsuarios/ListaUsuarios";
import VerLaudo from "./src/screens/Laudo/VerLaudo"; // ✅ import correto

const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (usuario) => {
    setIsLoading(true);
    setTimeout(() => {
      setUserData(usuario);
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setUserData(null);
  };

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
        <DrawerItemList {...props} />
        <View
          style={{
            marginTop: "auto",
            borderTopWidth: 1,
            borderTopColor: "#ccc",
            padding: 10,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 8 }}
            onPress={handleLogout}
          >
            <Icon
              name="logout"
              size={20}
              color="#c62828"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#c62828", fontSize: 16, fontWeight: "bold" }}>
              Sair
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    );
  }

  function MainDrawer() {
    const isAdmin = userData?.isAdmin === 1 || userData?.isAdmin === true;

    return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: "#123458",
          headerStyle: { backgroundColor: "#123458" },
          headerTintColor: "#fff",
        }}
      >
        <Drawer.Screen name="Home">
          {(props) => (
            <Home {...props} usuario={userData} onLogout={handleLogout} />
          )}
        </Drawer.Screen>

        <Drawer.Screen
          name="CadastroPaciente"
          component={CadastroPaciente}
          options={{ title: "Novo Paciente" }}
        />

        <Drawer.Screen name="Lista Paciente">
          {(props) => (
            <ListaPaciente
              {...props}
              usuario={userData}
              onLogout={handleLogout}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Novo Exame">
          {(props) => (
            <NovoExame {...props} usuario={userData} onLogout={handleLogout} />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Lista Exame">
          {(props) => (
            <ListaExame {...props} usuario={userData} onLogout={handleLogout} />
          )}
        </Drawer.Screen>
            </Drawer.Screen>

            <Drawer.Screen
              name="Listar Pacientes Admin"
              options={{
                title: "Pacientes (Admin)",
                drawerLabelStyle: { color: "#0d6efd", fontWeight: "bold" },
              }}
            >
              {(props) => (
                <ListaPacienteAdmin
                  {...props}
                  usuario={userData}
                  onLogout={handleLogout}
                />
              )}
            </Drawer.Screen>

            <Drawer.Screen
              name="Usuários (Admin)"
              options={{
                title: "Gerenciar Usuários",
                drawerLabelStyle: {
                  color: "#0d6efd",
                  fontWeight: "bold",
                },
              }}
            >
              {(props) => (
                <ListaUsuarios
                  {...props}
                  usuario={userData}
                  onLogout={handleLogout}
                />
              )}
            </Drawer.Screen>
          </>
        )}
      </Drawer.Navigator>
    );
  }

  // ✅ Novo Stack que contém o Drawer + VerLaudo
  function MainStack() {
    const Stack = createNativeStackNavigator();
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Drawer" component={MainDrawer} />
        <Stack.Screen name="VerLaudo" component={VerLaudo} />
      </Stack.Navigator>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#123458" />
        <Text style={{ marginTop: 10, color: "#123458", fontSize: 16 }}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userData ? (
        <MainStack /> // ✅ trocado
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login">
            {(props) => <LoginCadastro {...props} onLogin={handleLogin} />}
          </AuthStack.Screen>
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1EFEC",
  },
});
