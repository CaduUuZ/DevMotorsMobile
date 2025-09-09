import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CadastroPaciente from './src/screens/CadastroPaciente/CadastroPaciente';
import LoginCadastro from './src/screens/LoginCadastro/Login';

export default function App() {
  return (
    <View style={styles.container}>
      <LoginCadastro/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
