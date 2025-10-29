import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, ScrollView, Alert
} from 'react-native';
import { REGISTER_ENDPOINT, LOGIN_ENDPOINT } from '../../config/api.js';

export default function LoginCadastro({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({ email: '', senha: '' });
  const modeText = isRegisterMode ? 'Registrar' : 'Entrar';
  const toggleMode = () => setIsRegisterMode(!isRegisterMode);

  const handleSubmit = async () => {
    if (!form.email || !form.senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const endpoint = isRegisterMode ? REGISTER_ENDPOINT : LOGIN_ENDPOINT;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.message || "Falha na operação.");
        return;
      }

      console.log(`${modeText} bem-sucedido:`, data);

      const usuario = data.usuario || { id: data.id, email: form.email };
      if (onLogin) onLogin(usuario);

    } catch (error) {
      console.error('Erro de rede:', error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior='padding' style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.formBox}>
              <Text style={styles.formTitle}>{modeText}</Text>

              {/* Campos */}
              {['email', 'senha'].map((field) => (
                <View style={styles.inputGroup} key={field}>
                  <TextInput
                    style={[
                      styles.inputField,
                      form[field] ? styles.inputFieldFilled : null
                    ]}
                    placeholder={field === 'email' ? 'Email' : 'Senha'}
                    placeholderTextColor="#666"
                    value={form[field]}
                    onChangeText={(text) => setForm({ ...form, [field]: text })}
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                    autoCapitalize="none"
                    secureTextEntry={field === 'senha'}
                  />
                </View>
              ))}

              {/* Botão principal */}
              <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
                <Text style={styles.btnText}>{modeText}</Text>
              </TouchableOpacity>

              {/* Alternar modo */}
              <View style={styles.switchForm}>
                <Text style={styles.switchText}>
                  {isRegisterMode ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                  <Text style={styles.switchLink} onPress={toggleMode}>
                    {isRegisterMode ? 'Entre aqui' : 'Registre-se'}
                  </Text>
                </Text>
              </View>
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
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
    padding: 40,
  },
  formBox: { alignItems: 'center', width: '100%' },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center'
  },
  inputGroup: { width: '100%', marginBottom: 25 },
  inputField: {
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    fontSize: 16,
    color: '#333'
  },
  inputFieldFilled: { borderColor: '#007bff' },
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
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchForm: { alignItems: 'center' },
  switchText: { color: '#666', fontSize: 14 },
  switchLink: {
    color: '#007bff',
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
});
