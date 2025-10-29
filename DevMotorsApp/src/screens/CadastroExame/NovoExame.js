// src/screens/exames/SolicitarExameScreen.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PACIENTES_ENDPOINT, EXAMES_ENDPOINT } from '../../config/api';

// ---------- FUNÇÃO AUXILIAR ----------
const processApiResponse = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

// ---------- LISTAS ----------
const laboratorios = [
  { label: 'Selecione...', value: '' },
  { label: 'Microbiologia', value: 'microbiologia' },
  { label: 'Parasitologia', value: 'parasitologia' },
  { label: 'Hematologia', value: 'hematologia' },
  { label: 'Bioquímica', value: 'bioquimica' },
  { label: 'Urinálise', value: 'urinalise' },
];

const LISTA_EXAMES = {
  microbiologia: ['Urocultura com antibiograma', 'Swab ocular', 'Escarro para exame de TB'],
  parasitologia: ['Exame parasitológico de fezes', 'Sangue oculto'],
  hematologia: ['Hemograma completo', 'Outros exames hematológicos'],
  bioquimica: ['Glicose', 'Colesterol', 'Triglicerídeos', 'Creatinina', 'Uréia'],
  urinalise: ['Urina tipo 1'],
};

// ---------- COMPONENTE PRINCIPAL ----------
export default function SolicitarExameScreen({ navigation }) {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [exameSelecionado, setExameSelecionado] = useState('');
  const [loading, setLoading] = useState(false);

  const examesDisponiveis = laboratorio ? LISTA_EXAMES[laboratorio] || [] : [];

  // ---------- BUSCAR PACIENTES ----------
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch(PACIENTES_ENDPOINT);
        const data = await processApiResponse(response);
        if (response.ok && Array.isArray(data)) {
          setPacientes(data);
        } else {
          console.error('Erro ao buscar pacientes:', data);
          Alert.alert('Erro', 'Não foi possível carregar os pacientes.');
        }
      } catch (err) {
        console.error('Erro de conexão pacientes:', err);
        Alert.alert('Erro de Conexão', 'Falha ao conectar ao servidor.');
      }
    };
    fetchPacientes();
  }, []);

  // ---------- ENVIAR EXAME ----------
  const handleSubmit = async () => {
    if (!pacienteId || !laboratorio || !exameSelecionado) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const dados = {
      pacienteId,
      laboratorio,
      exameTexto: exameSelecionado,
    };

    setLoading(true);
    try {
      const response = await fetch(EXAMES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const data = await processApiResponse(response);

      if (response.ok) {
        Alert.alert('Sucesso', `Exame "${exameSelecionado}" solicitado com sucesso!`);
        setPacienteId('');
        setLaboratorio('');
        setExameSelecionado('');
      } else {
        console.error('Erro da API:', response.status, data);
        const msg = (data && (data.error || data.message)) || 'Erro ao cadastrar exame.';
        Alert.alert('Erro', msg);
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      Alert.alert('Erro de Conexão', 'Falha ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitar Exame</Text>
        <Text style={styles.subtitle}>Preencha as informações abaixo</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Paciente</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={pacienteId}
            onValueChange={setPacienteId}
          >
            <Picker.Item label="Selecione..." value="" />
            {pacientes.map(p => (
              <Picker.Item
                key={p.idPaciente}
                label={`${p.nome} (${p.idade} anos)`}
                value={p.idPaciente}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Laboratório</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={laboratorio}
            onValueChange={(value) => {
              setLaboratorio(value);
              setExameSelecionado('');
            }}
          >
            {laboratorios.map((lab) => (
              <Picker.Item key={lab.value} label={lab.label} value={lab.value} />
            ))}
          </Picker>
        </View>

        {laboratorio ? (
          <>
            <Text style={styles.label}>Exame</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={exameSelecionado}
                onValueChange={setExameSelecionado}
              >
                <Picker.Item label="Selecione..." value="" />
                {examesDisponiveis.map((exame, i) => (
                  <Picker.Item key={i} label={exame} value={exame} />
                ))}
              </Picker>
            </View>
          </>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Solicitar Exame</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EFEC', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, color: '#123458', fontWeight: '700' },
  subtitle: { color: '#666', fontSize: 14 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  label: { color: '#1b1b1b', fontWeight: '600', marginTop: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden', marginTop: 6 },
  btnPrimary: { backgroundColor: '#123458', padding: 14, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: '700' },
});
