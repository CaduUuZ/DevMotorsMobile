import React, { useState } from 'react';
import {  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator} from 'react-native';
import { API_BASE_URL } from '../../config/api.js'; // ajuste o caminho conforme sua estrutura

const { width } = Dimensions.get('window');

export default function LoginRegisterScreen(props) {
  const { onLogin } = props;
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  // Handler de login com integração API
  const handleLogin = async () => {
    // Validação básica
    if (!loginForm.email || !loginForm.senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          senha: loginForm.senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login bem-sucedido
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        // Aqui você pode salvar o token se a API retornar
        // await AsyncStorage.setItem('token', data.token);
        if (onLogin) onLogin(data); // passa os dados do usuário
      } else {
        // Erro retornado pela API
        Alert.alert('Erro', data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  // Handler de registro com integração API
  const handleRegister = async () => {
    // Validação básica
    if (!registerForm.email || !registerForm.senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Validação de senha (mínimo 6 caracteres)
    if (registerForm.senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerForm.email,
          senha: registerForm.senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro bem-sucedido
        Alert.alert(
          'Sucesso', 
          'Conta criada com sucesso!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Limpa o formulário e volta para login
                setRegisterForm({ email: '', senha: '' });
                switchToLogin();
              }
            }
          ]
        );
      } else {
        // Erro retornado pela API
        Alert.alert('Erro', data.message || 'Não foi possível criar a conta');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => setIsRegisterMode(true);
  const switchToLogin = () => setIsRegisterMode(false);

  // Renderiza o formulário de login
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
          editable={!loading}
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
          autoComplete="password" // Adicionar
          textContentType="password" // Adicionar para iOS
          editable={!loading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.btn, loading && styles.btnDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.btnText}>Entrar</Text>
        )}
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

  // Renderiza o formulário de registro
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
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.inputField, registerForm.senha ? styles.inputFieldFilled : null]}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#666"
          value={registerForm.senha}
          onChangeText={(text) => setRegisterForm({ ...registerForm, senha: text })}
          secureTextEntry
          autoComplete="password" // Adicionar
          textContentType="password" // Adicionar para iOS
          editable={!loading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.btn, loading && styles.btnDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.btnText}>Registrar</Text>
        )}
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
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
  btnDisabled: {
    opacity: 0.6,
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