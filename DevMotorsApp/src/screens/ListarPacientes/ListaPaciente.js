import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Alert, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native';
import { PACIENTES_ENDPOINT } from '../../config/api';

const processApiResponse = async (response) => {
  const text = await response.text();
  let responseData = null;
  try { responseData = text ? JSON.parse(text) : null; } catch(e) { responseData = text; }
  return responseData;
};

const ListaPaciente = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      fetchPacientes();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPacientes = async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${PACIENTES_ENDPOINT}?search=${searchTerm}`);
      const responseData = await processApiResponse(response);

      if (response.ok) {
        setPacientes(responseData || []);
      } else {
        Alert.alert('Erro na Busca', String(responseData?.error || responseData?.message || `Status ${response.status}`));
        setPacientes([]);
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchPacientes(search);
  const handleNewPaciente = () => navigation?.navigate('CadastroPaciente');

  // ------------------- RENDER PACIENTE ANÔNIMO ------------------- //
  const renderPaciente = ({ item }) => {
    const id = item.idPaciente || item.id || '';
    const nome = item.nome || item.name || '—';

    return (
      <View style={styles.pacienteCard}>
        <Text style={styles.pacienteTitle}>#{id} - {nome}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.newButton} onPress={handleNewPaciente}>
            <Text style={styles.newButtonText}>+ Novo Paciente</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o nome ou código do paciente"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>Procurar</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Lista de Pacientes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={styles.loader} />
        ) : pacientes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
        ) : (
          <FlatList
            data={pacientes}
            renderItem={renderPaciente}
            keyExtractor={item => (item.idPaciente || item.id || '').toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  controls: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchContainer: { flexDirection: 'row', alignItems: 'center' },
  newButton: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginRight: 8 },
  newButtonText: { color: '#fff', fontWeight: '600' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8 },
  searchButton: { backgroundColor: '#667eea', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  searchButtonText: { color: '#fff', fontWeight: '600' },
  listContainer: { flex: 1, padding: 15 },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  pacienteCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  pacienteInfo: { flex: 1 },
  pacienteTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pacienteEmail: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 40 },
  loader: { marginTop: 40 },
});

export default ListaPaciente;
