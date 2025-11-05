// src/screens/Admin/FormResultado.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { EXAMES_ENDPOINT } from '../../config/api';

export default function FormResultado({ route, navigation }) {
  const { idExame } = route.params;
  const [exame, setExame] = useState(null);
  const [campos, setCampos] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [totalCampos, setTotalCampos] = useState(0);

  const camposPorExame = {
    'urocultura com antibiograma': {
      'Meio de Cultura': [
        { nome: 'agar_cled', label: 'ÁGAR CLED', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] }
      ],
      'Coloração': [
        { nome: 'coloracao_gram', label: 'COLORAÇÃO DE GRAM', tipo: 'select', opcoes: ['Gram Positivo', 'Gram Negativo', 'Não realizado'] }
      ],
      'Testes para Gram Positivo': [
        { nome: 'agar_manitol', label: 'ÁGAR MANITOL', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'teste_catalase', label: 'TESTE DE CATALASE', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'teste_coagulase', label: 'TESTE DE COAGULASE', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'teste_novobiocina', label: 'TESTE DE NOVOBIOCINA', tipo: 'select', opcoes: ['Sensível', 'Resistente', 'Não realizado'] }
      ],
      'Testes para Gram Negativo': [
        { nome: 'agar_macconkey', label: 'ÁGAR MACCONKEY', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'epm', label: 'EPM', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'mili', label: 'MILI', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'citrato', label: 'CITRATO', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] }
      ],
      'Resultado Final': [
        { nome: 'resultado_gram_positivo', label: 'RESULTADO (Gram Positivo)', tipo: 'textarea' },
        { nome: 'resultado_gram_negativo', label: 'RESULTADO (Gram Negativo)', tipo: 'textarea' }
      ]
    },
    'escarro para exame de micobacterium tuberculosis': {
      'Coloração Inicial': [
        { nome: 'ziehl_nilsen', label: 'Coloração de Ziehl-Nilsen', tipo: 'select', opcoes: ['BAAR Positivo', 'BAAR Negativo', 'Não realizado'] }
      ],
      'Coloração de Gram': [
        { nome: 'coloracao_gram', label: 'COLORAÇÃO DE GRAM', tipo: 'select', opcoes: ['BGN (Bacilo Gram Negativo)', 'BGP (Bacilo Gram Positivo)', 'Não realizado'] }
      ],
      'Testes para BGP': [
        { nome: 'agar_manitol_bgp', label: 'ÁGAR MANITOL', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'teste_catalase_bgp', label: 'TESTE DE CATALASE', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'teste_coagulase_bgp', label: 'TESTE DE COAGULASE', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'teste_novobiocina_bgp', label: 'TESTE DE NOVOBIOCINA', tipo: 'select', opcoes: ['Sensível', 'Resistente', 'Não realizado'] }
      ],
      'Testes para BGN': [
        { nome: 'agar_macconkey_bgn', label: 'ÁGAR MACCONKEY', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'epm_bgn', label: 'EPM', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'mili_bgn', label: 'MILI', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] },
        { nome: 'citrato_bgn', label: 'CITRATO', tipo: 'select', opcoes: ['Positivo', 'Negativo', 'Não realizado'] }
      ],
      'Resultado Final': [
        { nome: 'resultado_bgp', label: 'RESULTADO (BGP)', tipo: 'textarea' },
        { nome: 'resultado_bgn', label: 'RESULTADO (BGN)', tipo: 'textarea' }
      ]
    },
  };

  const fetchExame = async () => {
    try {
      const response = await fetch(`${EXAMES_ENDPOINT}/${idExame}`);
      const data = await response.json();
      setExame(data);
      if (data.informacoesAdicionais) {
        setCampos(JSON.parse(data.informacoesAdicionais));
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o exame.');
    }
  };

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      // enviar informacoesAdicionais como JSON string
      const response = await fetch(`${EXAMES_ENDPOINT}/${idExame}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ informacoesAdicionais: JSON.stringify(campos) }),
      });
      if (response.ok) {
        Alert.alert('Sucesso', 'Informações salvas com sucesso!');
        // após salvar, navegar para a visualização do laudo atualizada
        navigation.navigate('VerLaudo', { idExame });
      } else {
        Alert.alert('Erro', 'Falha ao salvar informações.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro de rede ao salvar informações.');
    } finally {
      setSalvando(false);
    }
  };

  const handleChange = (nome, valor) => {
    setCampos(prev => {
      const novo = { ...prev, [nome]: valor };
      atualizarProgresso(novo);
      return novo;
    });
  };

  const atualizarProgresso = (camposAtualizados) => {
    const tipo = exame?.exameTexto?.toLowerCase();
    const config = camposPorExame[tipo];
    if (!config) return;
    const total = Object.values(config).flat().length;
    const preenchidos = Object.values(camposAtualizados).filter(v => v.trim() !== '').length;
    setTotalCampos(total);
    setProgresso((preenchidos / total) * 100);
  };

  const limparCampos = () => {
    Alert.alert('Confirmar', 'Deseja limpar todos os campos?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: () => {
          setCampos({});
          setProgresso(0);
        },
      },
    ]);
  };

  useEffect(() => {
    fetchExame();
  }, []);

  if (!exame) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007AFF" />;
  }

  const tipoExame = exame.exameTexto.toLowerCase();
  const camposConfig = camposPorExame[tipoExame];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Laudo Laboratorial</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Paciente:</Text>
        <Text>{exame.nome}</Text>
        <Text style={styles.label}>ID Paciente:</Text>
        <Text>{exame.idPaciente}</Text>
        <Text style={styles.label}>Idade:</Text>
        <Text>{exame.idade} anos</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Exame:</Text>
        <Text>{exame.exameTexto}</Text>
      </View>

      {camposConfig ? (
        Object.keys(camposConfig).map((grupo, idx) => (
          <View key={idx} style={styles.grupo}>
            <Text style={styles.grupoTitulo}>{grupo}</Text>
            {camposConfig[grupo].map((campo, i) => (
              <View key={i} style={styles.campo}>
                <Text style={styles.label}>{campo.label}</Text>
                {campo.tipo === 'select' ? (
                  <Picker
                    selectedValue={campos[campo.nome] || ''}
                    onValueChange={valor => handleChange(campo.nome, valor)}>
                    <Picker.Item label="Selecione..." value="" />
                    {campo.opcoes.map((op, idx2) => (
                      <Picker.Item key={idx2} label={op} value={op} />
                    ))}
                  </Picker>
                ) : campo.tipo === 'textarea' ? (
                  <TextInput
                    style={styles.textarea}
                    multiline
                    value={campos[campo.nome] || ''}
                    onChangeText={t => handleChange(campo.nome, t)}
                    placeholder={campo.placeholder || ''}
                  />
                ) : (
                  <TextInput
                    style={styles.input}
                    value={campos[campo.nome] || ''}
                    onChangeText={t => handleChange(campo.nome, t)}
                  />
                )}
              </View>
            ))}
          </View>
        ))
      ) : (
        <Text style={{ color: 'gray', marginTop: 20 }}>Tipo de exame não reconhecido.</Text>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progresso}%` }]} />
        <Text style={styles.progressText}>
          {Object.keys(campos).filter(k => campos[k]?.trim()).length} de {totalCampos} campos preenchidos
        </Text>
      </View>

      <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
        <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar Informações'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoLimpar} onPress={limparCampos}>
        <Text style={styles.botaoTexto}>Limpar Campos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  section: { marginBottom: 16 },
  label: { fontWeight: '600', marginTop: 8 },
  grupo: { marginVertical: 12 },
  grupoTitulo: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  campo: { marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 },
  textarea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, height: 80 },
  progressContainer: { marginTop: 20, alignItems: 'center' },
  progressBar: { height: 6, backgroundColor: '#4CAF50', borderRadius: 3, alignSelf: 'flex-start' },
  progressText: { marginTop: 6, fontSize: 14, color: '#333' },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  botaoLimpar: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
