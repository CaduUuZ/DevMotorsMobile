import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  useWindowDimensions,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 


// URL da API
const API_BASE_URL = 'https://sua-api.com/api'; 

// Funções de Máscara
const formatPhone = (text) => {
  const cleanText = text.replace(/\D/g, '');
  
  if (cleanText.length <= 10) { 
    return cleanText.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
  } else { 
    return cleanText.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  }
};

const formatData = (text) => {
  const cleanText = text.replace(/\D/g, '');
  
  if (cleanText.length <= 8) {
    return cleanText
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
  }
  return cleanText.slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
};


export default function CadastroPaciente(props) {
  const { navigation } = props;
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  // ESTADOS
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [medicamentoContinuo, setMedicamentoContinuo] = useState('nao');
  const [patologia, setPatologia] = useState('nao');
  const [qualMedicamento, setQualMedicamento] = useState('');
  const [qualPatologia, setQualPatologia] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento

  // FUNÇÃO DE CADASTRO CONECTADA À API (POST)
  const handleCadastro = async () => {
    // 1. Validação Básica
    if (!nomeCompleto || !dataNascimento || !telefone || !email) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (Nome, Data, Telefone e Email).');
        return;
    }

    // 2. Preparação dos Dados
    const dadosPaciente = {
        nomeCompleto,
        dataNascimento,
        telefone,
        email,
        nomeMae,
        // Envia o detalhe ou um indicador de 'Nenhum'
        medicamento: medicamentoContinuo === 'sim' ? qualMedicamento : 'Nenhum',
        patologia: patologia === 'sim' ? qualPatologia : 'Nenhuma',
    };

    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/pacientes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dadosPaciente),
        });

        if (response.ok) {
            Alert.alert('Sucesso', 'Paciente cadastrado com sucesso!');
            
            // Opcional: Voltar para a tela anterior (Lista de Pacientes)
            if (navigation && typeof navigation.goBack === 'function') {
                navigation.goBack(); 
            } else {
                // Se não houver navegação, apenas limpa o formulário
                setNomeCompleto('');
                setDataNascimento('');
                setTelefone('');
                setEmail('');
                setNomeMae('');
                setMedicamentoContinuo('nao');
                setPatologia('nao');
                setQualMedicamento('');
                setQualPatologia('');
            }

        } else {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido da API.' }));
            console.error('Erro da API:', errorData);
            Alert.alert('Erro no Cadastro', `Falha ao cadastrar: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Erro de Rede/Fetch:', error);
        Alert.alert('Erro de Conexão', 'Não foi possível conectar-se ao servidor. Verifique o IP/CORS.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>
        {/* Cabeçalho */}
        <View style={styles.formHeader}>
          <Text style={styles.title}>Cadastro de Paciente</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo para realizar o cadastro</Text>
        </View>

        {/* Nome Completo */}
        <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
          <View style={[styles.formControl, styles.formControlFull]}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              placeholderTextColor="#999"
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
            />
          </View>
        </View>

        {/* Data de Nascimento e Telefone */}
        <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
          <View style={[styles.formControl, isSmallScreen && styles.formControlFull]}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatData(text))}
              maxLength={10} 
            />
          </View>
          <View style={[styles.formControl, styles.formControlSpacing, isSmallScreen && styles.formControlFull]}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={(text) => setTelefone(formatPhone(text))}
              maxLength={15} 
            />
            <Text style={styles.helpText}>Formato: (00) 00000-0000</Text>
          </View>
        </View>

        {/* Email */}
        <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
          <View style={[styles.formControl, styles.formControlFull]}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Nome da Mãe */}
        <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
          <View style={[styles.formControl, styles.formControlFull]}>
            <Text style={styles.label}>Nome da Mãe</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da mãe"
              placeholderTextColor="#999"
              value={nomeMae}
              onChangeText={setNomeMae}
            />
          </View>
        </View>

        {/* Medicamento Contínuo - Select */}
        <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
          <View style={[styles.formControl, styles.formControlFull]}>
            <Text style={styles.label}>Toma algum medicamento contínuo?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.select}
                selectedValue={medicamentoContinuo}
                onValueChange={(itemValue) => {
                    setMedicamentoContinuo(itemValue);
                    if (itemValue === 'nao') setQualMedicamento('');
                }}
                mode="dropdown"
              >
                <Picker.Item label="Selecione..." value="" enabled={false} />
                <Picker.Item label="Sim" value="sim" />
                <Picker.Item label="Não" value="nao" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Medicamento Contínuo - Input Condicional */}
        {medicamentoContinuo === 'sim' && (
          <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
            <View style={[styles.formControl, styles.formControlFull]}>
              <Text style={styles.label}>Qual medicamento contínuo?</Text>
              <TextInput
                style={[styles.input, styles.conditionalInput]}
                placeholder="Ex: Losartana 50mg"
                placeholderTextColor="#999"
                value={qualMedicamento}
                onChangeText={setQualMedicamento}
              />
            </View>
          </View>
        )}

        {/* Patologia - Select */}
        <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
          <View style={[styles.formControl, styles.formControlFull]}>
            <Text style={styles.label}>Paciente tem alguma patologia que trata?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.select}
                selectedValue={patologia}
                onValueChange={(itemValue) => {
                    setPatologia(itemValue);
                    if (itemValue === 'nao') setQualPatologia('');
                }}
                mode="dropdown"
              >
                <Picker.Item label="Selecione..." value="" enabled={false} />
                <Picker.Item label="Sim" value="sim" />
                <Picker.Item label="Não" value="nao" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Patologia - Input Condicional */}
        {patologia === 'sim' && (
          <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
            <View style={[styles.formControl, styles.formControlFull]}>
              <Text style={styles.label}>Qual patologia o paciente trata?</Text>
              <TextInput
                style={[styles.input, styles.conditionalInput]}
                placeholder="Ex: Hipertensão, Diabetes Tipo 2"
                placeholderTextColor="#999"
                value={qualPatologia}
                onChangeText={setQualPatologia}
              />
            </View>
          </View>
        )}

        {/* Botão */}
        <TouchableOpacity 
          style={[styles.btnPrimary, loading && styles.btnDisabled]} 
          onPress={handleCadastro}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Cadastrar Paciente</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Scroll principal
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F1EFEC',
  },

  // Conteúdo centralizado dentro do Scroll
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 30,
  },

  // Container interno do formulário
  innerContainer: {
    padding: 20,
    backgroundColor: '#ffffffff',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 900,
  },

  formHeader: {
    marginBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    color: '#123458',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 14,
    width: '100%',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  formControl: {
    flex: 1,
    minWidth: 140,
  },
  formControlFull: {
    width: '100%',
  },
  formControlSpacing: {
    marginLeft: 12,
  },
  label: {
    marginBottom: 8,
    color: '#1b1b1b',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  conditionalInput: {
      borderColor: '#123458',
      borderWidth: 2,
      backgroundColor: '#f6f6ff',
  },
  helpText: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  select: {
    height: 48,
    width: '100%',
    color: '#222',
  },
  btnPrimary: {
    marginTop: 22,
    backgroundColor: '#123458',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    backgroundColor: '#6c757d',
  }
});