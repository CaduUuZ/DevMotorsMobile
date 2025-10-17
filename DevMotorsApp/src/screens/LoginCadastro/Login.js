import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';

// Pega a largura da tela para calcular layouts responsivos
const { width } = Dimensions.get('window');

// Componente principal da tela de Login / Registro
export default function LoginRegisterScreen(props) {
  // Recebe callback de login via props (ex.: navegação ou autenticação)
  const { onLogin } = props;

  // Estado que controla se a tela está em modo de registro ou login
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Estados para armazenar valores dos formulários
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', senha: '' });

  // Handler chamado ao submeter o formulário de login
  const handleLogin = () => {
    console.log('Login:', loginForm); // para debug
    if (onLogin) onLogin(); // chama callback externo se fornecido
  };

  // Handler chamado ao submeter o formulário de registro
  const handleRegister = () => {
    console.log('Register:', registerForm); // para debug
    if (onLogin) onLogin(); // aqui também chama onLogin — ajustar se quiser comportamento diferente
  };

  // Funções para alternar entre modos
  const switchToRegister = () => setIsRegisterMode(true);
  const switchToLogin = () => setIsRegisterMode(false);

  // Renderiza o formulário de login
  const renderLoginForm = () => (
    <View style={styles.formBox}>
      <Text style={styles.formTitle}>Entrar</Text>

      {/* Campo de email */}
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.inputField, loginForm.email ? styles.inputFieldFilled : null]} // altera borda quando preenchido
          placeholder="Email"
          placeholderTextColor="#666"
          value={loginForm.email}
          onChangeText={(text) => setLoginForm({ ...loginForm, email: text })} // atualiza estado
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Campo de senha */}
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

      {/* Botão de entrar */}
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Entrar</Text>
      </TouchableOpacity>

      {/* Link para trocar para o registro */}
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

      {/* Campo de email para registro */}
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

      {/* Campo de senha para registro */}
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

      {/* Botão de registrar */}
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Registrar</Text>
      </TouchableOpacity>

      {/* Link para voltar ao login */}
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

  // Estrutura principal: SafeArea -> KeyboardAvoiding -> Scroll -> Container
  // A ideia do layout é ter dois formulários lado a lado (largura total = 2 * 100%)
  // e mover o container horizontalmente para mostrar apenas um deles conforme isRegisterMode.
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

// Estilos do componente
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' }, // cor de fundo da tela
  keyboardAvoid: { flex: 1 }, // permite o KeyboardAvoidingView preencher a tela
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, // centraliza o conteúdo
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
  // Container que segura os dois formulários lado a lado. largura = 200% (2x)
  formContainer: { 
    position: 'relative', 
    width: '200%', 
    flexDirection: 'row', 
    transform: [{ translateX: 0 }] 
  },
  // Quando em modo registro, aplica uma translação de -50% para mostrar o segundo formulário
  showRegister: { 
    transform: [{ translateX: '-50%' }] 
  },
  // Caixa individual do formulário (tamanho 50% da largura total = 100% do container visível)
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
  }, // mudança visual quando o campo tem valor
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