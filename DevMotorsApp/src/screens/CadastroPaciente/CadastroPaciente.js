import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, 
  useWindowDimensions, Alert, ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PACIENTES_ENDPOINT } from '../../config/api';


// ------------------- FUNÇÕES AUXILIARES ------------------- //

// Formata telefone
const formatPhone = (text) => {
  const cleanText = text.replace(/\D/g, '');
  if (cleanText.length <= 10) { 
    return cleanText.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
  } else { 
    return cleanText.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  }
};

// Formata data DD/MM/AAAA
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

// Converte data para MySQL (YYYY-MM-DD)
const formatDataParaMysql = (data) => {
  const partes = data.split('/');
  if (partes.length === 3){
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return data;
};

// Calcula idade a partir de DD/MM/AAAA
const calcularIdadeFromDDMMYYYY = (dataDDMMYYYY) => {
  if (!dataDDMMYYYY) return '';
  const partes = dataDDMMYYYY.split('/');
  if (partes.length !== 3) return '';
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return '';
  const hoje = new Date();
  const nasc = new Date(ano, mes, dia);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 0 ? String(idade) : '';
};


// ------------------- COMPONENTE PRINCIPAL ------------------- //

export default function CadastroPaciente({ navigation }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  // --------- ESTADOS --------- //
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [medicamentoContinuo, setMedicamentoContinuo] = useState('nao');
  const [patologia, setPatologia] = useState('nao');
  const [qualMedicamento, setQualMedicamento] = useState('');
  const [qualPatologia, setQualPatologia] = useState('');
  const [idade, setIdade] = useState('');
  const [loading, setLoading] = useState(false);


  // --------- FUNÇÃO DE CADASTRO --------- //
  const handleCadastro = async () => {
    if (!nomeCompleto || !dataNascimento || !telefone || !email) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios (Nome, Data, Telefone e Email).');
      return;
    }

    const dadosPaciente = {
      nome: nomeCompleto,
      dataNascimento: formatDataParaMysql(dataNascimento),
      telefone,
      email,
      nomeMae,
      idade: idade || null,
      medicamento: medicamentoContinuo === 'sim' ? qualMedicamento : 'Nenhum',
      patologia: patologia === 'sim' ? qualPatologia : 'Nenhuma',
    };

    setLoading(true);
    try {
      const response = await fetch(PACIENTES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPaciente),
      });

      const text = await response.text();
      let responseData = null;
      try { responseData = text ? JSON.parse(text) : null; } catch(e) { responseData = text; }

      if (response.ok) {
        Alert.alert('Sucesso', 'Paciente cadastrado com sucesso!');
        navigation?.goBack ? navigation.goBack() : limparFormulario();
      } else {
        console.error('Erro da API:', response.status, responseData);
        const errMsg = (responseData && (responseData.error || responseData.message)) || `Status ${response.status}`;
        Alert.alert('Erro', String(errMsg));
      }

    } catch (error) {
      console.error('Erro de Conexão:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar-se ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setNomeCompleto('');
    setDataNascimento('');
    setTelefone('');
    setEmail('');
    setNomeMae('');
    setMedicamentoContinuo('nao');
    setPatologia('nao');
    setQualMedicamento('');
    setQualPatologia('');
    setIdade('');
  };


  // --------- RENDER --------- //
  return (
    <ScrollView 
      style={styles.scrollContainer} 
      contentContainerStyle={styles.contentContainer} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>

        {/* HEADER */}
        <View style={styles.formHeader}>
          <Text style={styles.title}>Cadastro de Paciente</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
        </View>

        {/* NOME */}
        <CampoTexto 
          label="Nome Completo" 
          value={nomeCompleto} 
          onChangeText={setNomeCompleto} 
          placeholder="Digite o nome completo" 
          isSmallScreen={isSmallScreen}
        />

        {/* DATA DE NASCIMENTO */}
        <CampoTexto 
          label="Data de Nascimento" 
          value={dataNascimento} 
          onChangeText={text => {
            const formatted = formatData(text);
            setDataNascimento(formatted);
            setIdade(calcularIdadeFromDDMMYYYY(formatted));
          }} 
          placeholder="DD/MM/AAAA" 
          keyboardType="numeric"
          maxLength={10}
          isSmallScreen={isSmallScreen}
        />

        {/* TELEFONE */}
        <CampoTexto 
          label="Telefone" 
          value={telefone} 
          onChangeText={text => setTelefone(formatPhone(text))} 
          placeholder="(00) 00000-0000" 
          keyboardType="phone-pad"
          maxLength={15}
          helpText="Formato: (00) 00000-0000"
          isSmallScreen={isSmallScreen}
        />

        {/* IDADE (somente leitura) */}
        <CampoTexto 
          label="Idade" 
          value={idade} 
          placeholder="Idade será calculada automaticamente" 
          editable={false} 
          isSmallScreen={isSmallScreen}
        />

        {/* EMAIL */}
        <CampoTexto 
          label="Email" 
          value={email} 
          onChangeText={setEmail} 
          placeholder="Digite o email" 
          keyboardType="email-address"
          autoCapitalize="none"
          isSmallScreen={isSmallScreen}
        />

        {/* NOME DA MÃE */}
        <CampoTexto 
          label="Nome da Mãe" 
          value={nomeMae} 
          onChangeText={setNomeMae} 
          placeholder="Digite o nome da mãe"
          isSmallScreen={isSmallScreen}
        />

        {/* PICKERS CONDICIONAIS */}
        <CampoPicker 
          label="Toma algum medicamento contínuo?" 
          selectedValue={medicamentoContinuo} 
          onValueChange={value => {
            setMedicamentoContinuo(value);
            if (value === 'nao') setQualMedicamento('');
          }}
          isSmallScreen={isSmallScreen}
        />
        {medicamentoContinuo === 'sim' && (
          <CampoTexto 
            label="Qual medicamento contínuo?" 
            value={qualMedicamento} 
            onChangeText={setQualMedicamento} 
            placeholder="Ex: Losartana 50mg"
            isSmallScreen={isSmallScreen}
            conditional
          />
        )}

        <CampoPicker 
          label="Paciente tem alguma patologia?" 
          selectedValue={patologia} 
          onValueChange={value => {
            setPatologia(value);
            if (value === 'nao') setQualPatologia('');
          }}
          isSmallScreen={isSmallScreen}
        />
        {patologia === 'sim' && (
          <CampoTexto 
            label="Qual patologia?" 
            value={qualPatologia} 
            onChangeText={setQualPatologia} 
            placeholder="Ex: Hipertensão, Diabetes Tipo 2"
            isSmallScreen={isSmallScreen}
            conditional
          />
        )}

        {/* BOTÃO */}
        <TouchableOpacity 
          style={[styles.btnPrimary, loading && styles.btnDisabled]} 
          onPress={handleCadastro}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Cadastrar Paciente</Text>}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}


// ------------------- COMPONENTES REUTILIZÁVEIS ------------------- //

const CampoTexto = ({ label, value, onChangeText, placeholder, keyboardType, maxLength, editable=true, helpText, isSmallScreen, conditional=false, autoCapitalize='sentences' }) => (
  <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
    <View style={[styles.formControl, styles.formControlFull]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, conditional && styles.conditionalInput, !editable && { backgroundColor: '#f3f3f3' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
      />
      {helpText && <Text style={styles.helpText}>{helpText}</Text>}
    </View>
  </View>
);

const CampoPicker = ({ label, selectedValue, onValueChange, isSmallScreen }) => (
  <View style={[styles.formRow, isSmallScreen && styles.columnLayout]}>
    <View style={[styles.formControl, styles.formControlFull]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
          <Picker.Item label="Selecione..." value="" enabled={false} />
          <Picker.Item label="Sim" value="sim" />
          <Picker.Item label="Não" value="nao" />
        </Picker>
      </View>
    </View>
  </View>
);


// ------------------- ESTILOS ------------------- //

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#F1EFEC' },
  contentContainer: { alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 30 },
  innerContainer: { padding: 20, backgroundColor: '#fff', alignSelf: 'center', width: '100%', maxWidth: 900 },
  formHeader: { marginBottom: 18, alignItems: 'center', width: '100%' },
  title: { fontSize: 26, color: '#123458', fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6, textAlign: 'center' },
  formRow: { flexDirection: 'row', marginBottom: 14, width: '100%', flexWrap: 'wrap', alignItems: 'flex-start' },
  columnLayout: { flexDirection: 'column' },
  formControl: { flex: 1, minWidth: 140 },
  formControlFull: { width: '100%' },
  formControlSpacing: { marginLeft: 12 },
  label: { marginBottom: 8, color: '#1b1b1b', fontWeight: '600', fontSize: 15 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff', color: '#222' },
  conditionalInput: { borderColor: '#123458', borderWidth: 2, backgroundColor: '#f6f6ff' },
  helpText: { fontSize: 12, color: '#777', marginTop: 6 },
  pickerContainer: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  btnPrimary: { marginTop: 22, backgroundColor: '#123458', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDisabled: { backgroundColor: '#6c757d' }
});
