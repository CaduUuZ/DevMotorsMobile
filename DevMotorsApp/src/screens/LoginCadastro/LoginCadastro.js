// LoginCadastro.js
// Componente que fornece a interface de Login e Cadastro de usuário.
// - Modo de operação troca entre 'Entrar' e 'Registrar'.
// - Envia requisições para os endpoints definidos em `src/config/api.js`.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGISTER_ENDPOINT, LOGIN_ENDPOINT } from '../../config/api.js';

// Componente principal exportado
export default function LoginCadastro({ onLogin }) {
  // Indica se estamos no modo de cadastro (true) ou login (false)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  // Estado do formulário contém os campos utilizados pela API
  const [form, setForm] = useState({ email: '', senha: '' });
  // Guarda o campo atualmente focado para estilos visuais
  const [focusedField, setFocusedField] = useState(null);
  
  // Texto do botão e título dependendo do modo
  const modeText = isRegisterMode ? 'Registrar' : 'Entrar';
  // Alterna entre os modos Entrar / Registrar
  const toggleMode = () => setIsRegisterMode(!isRegisterMode);
  
  // Função que lida com o envio do formulário para o backend
  const handleSubmit = async () => {
    // Validação básica de presença de valores
    if (!form.email || !form.senha) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    // Escolhe o endpoint conforme o modo atual
    const endpoint = isRegisterMode ? REGISTER_ENDPOINT : LOGIN_ENDPOINT;
    console.log('[LoginCadastro] endpoint:', endpoint, 'payload:', form);
    
    try {
      // Requisição POST com o corpo JSON
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      // Tenta extrair o JSON retornado
      const data = await response.json();
      console.log('[LoginCadastro] status:', response.status, 'body:', data);
      
      // Se a resposta não for 2xx, mostra a mensagem de erro
      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Falha na operação');
        return;
      }

      // Se a API retornou um token, salva localmente para sessões futuras
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        console.log('[LoginCadastro] Token salvo com sucesso:', data.token);
      }

      // Feedback para o usuário
      Alert.alert('Sucesso', isRegisterMode ? 'Conta criada!' : 'Login realizado!');
      
      // Notifica o pai (se fornecido) sobre o usuário logado/criado
      if (onLogin) onLogin(data.usuario || { id: data.id, email: form.email });
    } catch (err) {
      // Erros de rede / exceção genérica
      console.error('Erro de rede:', err);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    }
  };

  // Renderiza a interface
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Cabeçalho com ícone, título e subtítulo */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔐</Text>
              </View>
              {/* Título que muda conforme o modo */}
              <Text style={styles.title}>{modeText}</Text>
              {/* Subtítulo informativo */}
              <Text style={styles.subtitle}>
                {isRegisterMode 
                  ? 'Crie sua conta para começar' 
                  : 'Bem-vindo de volta!'}
              </Text>
            </View>

            {/* Formulário com inputs para email e senha */}
            <View style={styles.formContainer}>
              {['email', 'senha'].map((field) => (
                <View key={field} style={styles.inputWrapper}>
                  {/* Rótulo do campo (com emoji para clareza visual) */}
                  <Text style={styles.label}>
                    {field === 'email' ? '📧 Email' : '🔒 Senha'}
                  </Text>
                  {/* Campo de texto controlado pelo estado `form` */}
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

              {/* Botão principal: Entrar / Registrar */}
              <TouchableOpacity 
                style={styles.btn} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>{modeText}</Text>
              </TouchableOpacity>
            </View>

            {/* Divider visual entre formulário e ação de alternância */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botão para alternar entre Entrar e Registrar */}
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
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
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
  icon: { fontSize: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
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
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 4 },
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
    width: '100%', padding: 18, backgroundColor: '#007bff',
    borderRadius: 12, alignItems: 'center', marginTop: 8,
    shadowColor: '#007bff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e9ecef' },
  dividerText: { color: '#999', paddingHorizontal: 16, fontSize: 14 },
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
  switchText: { color: '#666', fontSize: 14, marginBottom: 4 },
  switchLink: { color: '#007bff', fontSize: 16, fontWeight: '600' }
});
