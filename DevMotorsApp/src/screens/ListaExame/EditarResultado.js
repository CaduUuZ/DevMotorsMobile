import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StyleSheet
} from 'react-native';
import { EXAMES_ENDPOINT } from '../../config/api';

export default function EditarResultado({ route, navigation }) {
  const { idExame } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    pacienteId: '',
    laboratorio: '',
    exameTexto: '',
    dataExame: '',
    resultado: '',
    informacoesAdicionais: ''
  });

  useEffect(() => {
    if (!idExame) {
      Alert.alert('Erro', 'ID do exame não informado.');
      navigation.goBack();
      return;
    }
    const fetchExame = async () => {
      try {
        const res = await fetch(`${EXAMES_ENDPOINT}/${idExame}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao carregar exame');
        setForm({
          pacienteId: data.idPaciente || data.paciente?.idPaciente || '',
          laboratorio: data.laboratorio || '',
          exameTexto: data.exameTexto || '',
          dataExame: data.dataExame || '',
          resultado: data.resultado || '',
          informacoesAdicionais: data.informacoesAdicionais || data.informacoes_adicionais || ''
        });
      } catch (err) {
        Alert.alert('Erro', err.message || 'Falha ao carregar exame');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchExame();
  }, [idExame, navigation]);

  const handleSave = async () => {
    if (!form.pacienteId || !form.laboratorio || !form.exameTexto) {
      Alert.alert('Erro', 'Preencha paciente, laboratório e exame.');
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch(`${EXAMES_ENDPOINT}/${idExame}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          pacienteId: parseInt(form.pacienteId, 10),
          laboratorio: form.laboratorio,
          exameTexto: form.exameTexto,
          dataExame: form.dataExame,
          resultado: form.resultado,
          informacoesAdicionais: form.informacoesAdicionais
        })
      });
      let body;
      try { body = await res.json(); } catch { body = await res.text(); }

      if (res.ok) {
        Alert.alert('Sucesso', 'Exame atualizado.');
        navigation.goBack();
      } else {
        const msg = (body && (body.error || body.message)) || `Status ${res.status}`;
        Alert.alert('Erro', msg);
      }
    } catch (err) {
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#123458" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>ID do Paciente</Text>
      <TextInput
        style={styles.input}
        value={String(form.pacienteId)}
        onChangeText={t => setForm({ ...form, pacienteId: t.replace(/\D/g, '') })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Laboratório</Text>
      <TextInput style={styles.input} value={form.laboratorio} onChangeText={t => setForm({ ...form, laboratorio: t })} />

      <Text style={styles.label}>Exame</Text>
      <TextInput style={styles.input} value={form.exameTexto} onChangeText={t => setForm({ ...form, exameTexto: t })} />

      <Text style={styles.label}>Resultado</Text>
      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
        value={form.resultado}
        onChangeText={t => setForm({ ...form, resultado: t })}
        multiline
      />

      <Text style={styles.label}>Informações Adicionais (JSON ou texto)</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={form.informacoesAdicionais}
        onChangeText={t => setForm({ ...form, informacoesAdicionais: t })}
        multiline
      />

      <TouchableOpacity style={[styles.btn, salvando && styles.disabled]} onPress={handleSave} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar alterações</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F1EFEC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: '700', marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 6 },
  btn: { marginTop: 20, backgroundColor: '#123458', padding: 14, borderRadius: 10, alignItems: 'center' },
  disabled: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: '700' }
});