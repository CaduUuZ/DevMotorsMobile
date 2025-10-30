// LoginCadastro.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, ScrollView, Alert
} from 'react-native';
import { REGISTER_ENDPOINT, LOGIN_ENDPOINT } from '../../config/api';

export default function LoginCadastro({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({ email: '', senha: '' });
  const [focusedField, setFocusedField] = useState(null);
  
  const modeText = isRegisterMode ? 'Registrar' : 'Entrar';
  const toggleMode = () => setIsRegisterMode(!isRegisterMode);
  
  const handleSubmit = async () => {
    if (!form.email || !form.senha) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    const endpoint = isRegisterMode ? REGISTER_ENDPOINT : LOGIN_ENDPOINT;
    console.log('[LoginCadastro] endpoint:', endpoint, 'payload:', form);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      console.log('[LoginCadastro] status:', response.status, 'body:', data);
      
      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Falha na operação');
        return;
      }
      console.log('Sucesso:', data);
      if (onLogin) onLogin(data.usuario || { id: data.id, email: form.email });
    } catch (err) {
      console.error('Erro de rede:', err);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Header com ícone */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔐</Text>
              </View>
              <Text style={styles.title}>{modeText}</Text>
              <Text style={styles.subtitle}>
                {isRegisterMode 
                  ? 'Crie sua conta para começar' 
                  : 'Bem-vindo de volta!'}
              </Text>
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              {['email', 'senha'].map((field) => (
                <View key={field} style={styles.inputWrapper}>
                  <Text style={styles.label}>
                    {field === 'email' ? '📧 Email' : '🔒 Senha'}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === field && styles.inputFocused
                    ]}
                    placeholder={field === 'email' ? 'seu@email.com' : '••••••••'}
                    placeholderTextColor="#999"
                    value={form[field]}
                    onChangeText={(text) => setForm({ ...form, [field]: text })}
                    onFocus={() => setFocusedField(field)}
                    onBlur={() => setFocusedField(null)}
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                    autoCapitalize="none"
                    secureTextEntry={field === 'senha'}
                  />
                </View>
              ))}

              <TouchableOpacity 
                style={styles.btn} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>{modeText}</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Toggle Mode */}
            <TouchableOpacity 
              style={styles.switchContainer} 
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                {isRegisterMode ? 'Já tem uma conta?' : 'Não tem conta?'}
              </Text>
              <Text style={styles.switchLink}>
                {isRegisterMode ? 'Entre aqui' : 'Registre-se'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  keyboardAvoid: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  container: { 
    width: '100%', 
    maxWidth: 420, 
    alignSelf: 'center' 
  },
  
  // Header
  header: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { 
    fontSize: 40 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#1a1a1a',
    marginBottom: 8 
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  
  // Form
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24
  },
  inputWrapper: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef', 
    borderRadius: 8,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 10
  },
  inputFocused: {
    borderColor: '#007bff',
    backgroundColor: '#fff',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  btn: { 
    width: '100%', 
    padding: 18,
    backgroundColor: '#007bff',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef'
  },
  dividerText: {
    color: '#999',
    paddingHorizontal: 16,
    fontSize: 14
  },
  
  // Switch
  switchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  switchText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4
  },
  switchLink: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600'
  }
});