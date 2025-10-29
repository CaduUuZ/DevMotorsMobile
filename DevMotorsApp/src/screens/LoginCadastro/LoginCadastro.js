import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { REGISTER_ENDPOINT, LOGIN_ENDPOINT } from '../../config/api.js';

const { width } = Dimensions.get('window');

export default function LoginCadastro(props) {
  const { onLogin } = props;
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', senha: '' });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          senha: loginForm.senha,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Usuário logado:', data.usuario);
        
        // Vai direto para a home após login
        if (onLogin) onLogin(data.usuario || data);
        
      } else {
        const errorData = await response.json();
        Alert.alert("Falha no Login", errorData.message || "Email ou senha incorretos.");
        console.error('Erro na API:', errorData);
      }
    } catch (error) {
      console.error('Erro de rede ao fazer login:', error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    }
  };

  const handleRegister = async () => {
    if (!registerForm.email || !registerForm.senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerForm.email,
          senha: registerForm.senha,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registro bem-sucedido:', data);
        
        // Cria objeto do usuário com os dados do registro
        const usuario = {
          id: data.id,
          email: registerForm.email
        };
        
        // Vai direto para a home após registrar
        if (onLogin) onLogin(usuario);
        
      } else {
        const errorData = await response.json();
        Alert.alert("Falha no Registro", errorData.message || "Erro desconhecido ao registrar.");
        console.error('Erro na API:', errorData);
      }
    } catch (error) {
      console.error('Erro de rede ao registrar:', error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor. Verifique se a API está rodando no IP e porta corretos.");
    }
  };

  const switchToRegister = () => setIsRegisterMode(true);
  const switchToLogin = () => setIsRegisterMode(false);

  const renderLoginForm = () => (
    <View style={styles.formBox}>
      <Text style={styles.formTitle}>Entrar</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.inputField, loginForm.email ? styles.inputFieldFilled : null]}
          placeholder="Email"
          placeholderTextColor="#666"
          value={loginForm.email}
          onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.inputField, loginForm.senha ? styles.inputFieldFilled : null]}
          placeholder="Senha"
          placeholderTextColor="#666"
          value={loginForm.senha}
          onChangeText={(text) => setLoginForm({ ...loginForm, senha: text })}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Entrar</Text>
      </TouchableOpacity>
      <View style={styles.switchForm}>
        <Text style={styles.switchText}>
          Não tem uma conta?{' '}
          <Text style={styles.switchLink} onPress={switchToRegister}>
            Registre-se
          </Text>
        </Text>
      </View>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formBox}>
      <Text style={styles.formTitle}>Registrar</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.inputField, registerForm.email ? styles.inputFieldFilled : null]}
          placeholder="Email"
          placeholderTextColor="#666"
          value={registerForm.email}
          onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.inputField, registerForm.senha ? styles.inputFieldFilled : null]}
          placeholder="Senha"
          placeholderTextColor="#666"
          value={registerForm.senha}
          onChangeText={(text) => setRegisterForm({ ...registerForm, senha: text })}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Registrar</Text>
      </TouchableOpacity>
      <View style={styles.switchForm}>
        <Text style={styles.switchText}>
          Já tem uma conta?{' '}
          <Text style={styles.switchLink} onPress={switchToLogin}>
            Entre aqui
          </Text>
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior='padding' style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={[styles.formContainer, isRegisterMode && styles.showRegister]}>
              {renderLoginForm()}
              {renderRegisterForm()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
    overflow: 'hidden',
  },
  formContainer: {
    position: 'relative',
    width: '200%',
    flexDirection: 'row',
    transform: [{ translateX: 0 }]
  },
  showRegister: {
    transform: [{ translateX: '-50%' }]
  },
  formBox: {
    width: '50%',
    padding: 40,
    alignItems: 'center'
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center'
  },
  inputGroup: {
    position: 'relative',
    marginBottom: 25,
    width: '100%'
  },
  inputField: {
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: 'transparent',
    color: '#333'
  },
  inputFieldFilled: {
    borderColor: '#007bff'
  },
  btn: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  switchForm: {
    alignItems: 'center'
  },
  switchText: {
    color: '#666',
    fontSize: 14
  },
  switchLink: {
    color: '#007bff',
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
});