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

      // ✅ Chama onLogin para avisar o App que o usuário logou
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
            <Text style={styles.title}>{modeText}</Text>

            {['email', 'senha'].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field === 'email' ? 'Email' : 'Senha'}
                value={form[field]}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
                keyboardType={field === 'email' ? 'email-address' : 'default'}
                autoCapitalize="none"
                secureTextEntry={field === 'senha'}
              />
            ))}

            <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
              <Text style={styles.btnText}>{modeText}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.switch}>
                {isRegisterMode ? 'Já tem uma conta? Entre' : 'Não tem conta? Registre-se'}
              </Text>
            </TouchableOpacity>
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
  container: { width: '100%', maxWidth: 400, padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 30 },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  btn: { width: '100%', padding: 15, backgroundColor: '#007bff', borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
  switch: { color: '#007bff', textDecorationLine: 'underline', marginTop: 10 },
});
