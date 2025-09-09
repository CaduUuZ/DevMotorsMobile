import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';

// Obtém a largura da tela do dispositivo
const { width } = Dimensions.get('window');

const LoginRegisterScreen = () => {
  // Estado para controlar se está no modo registro (true) ou login (false)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Estado para armazenar os dados do formulário de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    senha: ''
  });
  
  // Estado para armazenar os dados do formulário de registro
  const [registerForm, setRegisterForm] = useState({
    email: '',
    senha: ''
  });

  // Função chamada quando o usuário tenta fazer login
  const handleLogin = () => {
    console.log('Login:', loginForm);
  };

  // Função chamada quando o usuário tenta se registrar
  const handleRegister = () => {
    console.log('Register:', registerForm);
  };

  // Função para alternar para o modo de registro
  const switchToRegister = () => {
    setIsRegisterMode(true);
  };

  // Função para alternar para o modo de login
  const switchToLogin = () => {
    setIsRegisterMode(false);
  };

  // Componente que renderiza o formulário de login
  const renderLoginForm = () => (
    <View style={styles.formBox}>
      {/* Título do formulário */}
      <Text style={styles.formTitle}>Entrar</Text>
      
      {/* Campo de input para email */}
      <View style={styles.inputGroup}>
        <TextInput
          style={[
            styles.inputField,
            // Aplica estilo diferente se o campo estiver preenchido
            loginForm.email ? styles.inputFieldFilled : null
          ]}
          placeholder="Email"
          placeholderTextColor="#666"
          value={loginForm.email}
          // Atualiza o estado quando o texto muda
          onChangeText={(text) => setLoginForm({...loginForm, email: text})}
          keyboardType="email-address" // Teclado otimizado para email
          autoCapitalize="none" // Não capitaliza automaticamente
        />
      </View>

      {/* Campo de input para senha */}
      <View style={styles.inputGroup}>
        <TextInput
          style={[
            styles.inputField,
            // Aplica estilo diferente se o campo estiver preenchido
            loginForm.senha ? styles.inputFieldFilled : null
          ]}
          placeholder="Senha"
          placeholderTextColor="#666"
          value={loginForm.senha}
          // Atualiza o estado quando o texto muda
          onChangeText={(text) => setLoginForm({...loginForm, senha: text})}
          secureTextEntry // Oculta o texto digitado (para senhas)
        />
      </View>

      {/* Botão de login */}
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Entrar</Text>
      </TouchableOpacity>

      {/* Link para alternar para o formulário de registro */}
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

  // Componente que renderiza o formulário de registro
  const renderRegisterForm = () => (
    <View style={styles.formBox}>
      {/* Título do formulário */}
      <Text style={styles.formTitle}>Registrar</Text>
      
      {/* Campo de input para email */}
      <View style={styles.inputGroup}>
        <TextInput
          style={[
            styles.inputField,
            // Aplica estilo diferente se o campo estiver preenchido
            registerForm.email ? styles.inputFieldFilled : null
          ]}
          placeholder="Email"
          placeholderTextColor="#666"
          value={registerForm.email}
          // Atualiza o estado quando o texto muda
          onChangeText={(text) => setRegisterForm({...registerForm, email: text})}
          keyboardType="email-address" // Teclado otimizado para email
          autoCapitalize="none" // Não capitaliza automaticamente
        />
      </View>

      {/* Campo de input para senha */}
      <View style={styles.inputGroup}>
        <TextInput
          style={[
            styles.inputField,
            // Aplica estilo diferente se o campo estiver preenchido
            registerForm.senha ? styles.inputFieldFilled : null
          ]}
          placeholder="Senha"
          placeholderTextColor="#666"
          value={registerForm.senha}
          // Atualiza o estado quando o texto muda
          onChangeText={(text) => setRegisterForm({...registerForm, senha: text})}
          secureTextEntry // Oculta o texto digitado (para senhas)
        />
      </View>

      {/* Botão de registro */}
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Registrar</Text>
      </TouchableOpacity>

      {/* Link para alternar para o formulário de login */}
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

  // Componente principal que renderiza toda a tela
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* KeyboardAvoidingView ajusta a tela quando o teclado aparece */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* ScrollView permite scroll quando o conteúdo é maior que a tela */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Container principal dos formulários */}
          <View style={styles.container}>
            {/* Container que desliza horizontalmente entre os formulários */}
            <View style={[
              styles.formContainer,
              // Aplica transformação quando está no modo registro
              isRegisterMode && styles.showRegister
            ]}>
              {/* Renderiza ambos os formulários lado a lado */}
              {renderLoginForm()}
              {renderRegisterForm()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  // Área segura que respeita os limites da tela (notch, etc)
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Container para evitar sobreposição do teclado
  keyboardAvoid: {
    flex: 1,
  },
  // Container do ScrollView
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Container principal com efeito glassmorphism
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Fundo semi-transparente
    borderRadius: 20,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    // Sombra para Android
    elevation: 10,
    overflow: 'hidden',
  },
  // Container que contém ambos os formulários lado a lado
  formContainer: {
    position: 'relative',
    width: width * 2, // Largura dupla para conter dois formulários
    flexDirection: 'row',
    transform: [{ translateX: 0 }], // Posição inicial
  },
  // Estilo aplicado quando mostra o formulário de registro
  showRegister: {
    transform: [{ translateX: -width * 0.5 }], // Desliza para mostrar o registro
  },
  // Container individual de cada formulário
  formBox: {
    width: width * 0.5, // Metade da largura da tela
    maxWidth: 200,
    padding: 40,
    alignItems: 'center',
  },
  // Título dos formulários
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  // Container de cada grupo de input
  inputGroup: {
    position: 'relative',
    marginBottom: 25,
    width: '100%',
  },
  // Estilo base dos campos de input
  inputField: {
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e1e5e9', // Cor da borda padrão
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: 'transparent',
    color: '#333',
  },
  // Estilo aplicado quando o campo está preenchido
  inputFieldFilled: {
    borderColor: '#007bff', // Borda azul quando preenchido
  },
  // Estilo dos botões
  btn: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    // Sombra do botão para iOS
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Sombra do botão para Android
    elevation: 5,
  },
  // Texto dos botões
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Container dos links de alternância
  switchForm: {
    alignItems: 'center',
  },
  // Texto normal dos links de alternância
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  // Estilo dos links clicáveis
  switchLink: {
    color: '#007bff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginRegisterScreen;