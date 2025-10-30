import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Modal,
  ScrollView, Alert, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native';
// Ajuste do caminho para o arquivo de config (três níveis acima)
import { PACIENTES_ENDPOINT } from '../../../config/api';

// ------------------- FUNÇÕES AUXILIARES ------------------- //
const processApiResponse = async (response) => {
  const text = await response.text();
  let responseData = null;
  try { responseData = text ? JSON.parse(text) : null; } catch(e) { responseData = text; }
  return responseData;
};

// ------------------- COMPONENTE PRINCIPAL ------------------- //
const ListaPaciente = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal de edição
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    idPaciente: '',
    nome: '',
    idade: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    medicamento: '',
    patologia: ''
  });

  // ------------------- FETCH PACIENTES ------------------- //
  // Função de busca (declarada antes do useEffect para evitar ambiguidade)
  const fetchPacientes = async (searchTerm = '') => {
    setLoading(true);
    try {
      const url = `${PACIENTES_ENDPOINT}${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`;
      console.log('[ListaPacienteAdmin] GET', url);
      const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      const responseData = await processApiResponse(response);

      if (response.ok) {
        setPacientes(Array.isArray(responseData) ? responseData : []);
      } else {
        console.error('Erro da API:', response.status, responseData);
        Alert.alert('Erro na Busca', String(responseData?.error || responseData?.message || `Status ${response.status}`));
        setPacientes([]);
      }
    } catch (error) {
      console.error('Erro de Conexão:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar ao focar a tela
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      fetchPacientes();
    });
    // busca inicial
    fetchPacientes();
    return unsubscribe;
  }, [navigation]);

  const handleSearch = () => fetchPacientes(search);

  // ------------------- CRUD ------------------- //

  // Abrir modal para editar paciente
  const openEditModal = (paciente) => {
    setFormData({
      idPaciente: paciente.idPaciente?.toString() || paciente.id?.toString() || '',
      nome: paciente.nome || '',
      idade: paciente.idade?.toString() || '',
      email: paciente.email || '',
      telefone: paciente.telefone || '',
      dataNascimento: paciente.dataNascimento || '',
      medicamento: paciente.medicamento || '',
      patologia: paciente.patologia || ''
    });
    setModalVisible(true);
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    const { idPaciente, nome, idade, email, telefone, dataNascimento, medicamento, patologia } = formData;

    if (!idPaciente) {
      Alert.alert('Erro', 'ID do paciente ausente.');
      return;
    }

    if (!nome || !email) {
      Alert.alert('Erro', 'Preencha pelo menos nome e email.');
      return;
    }

    setSaving(true);
    try {
      const url = `${PACIENTES_ENDPOINT}/${encodeURIComponent(idPaciente)}`;
      console.log('[ListaPacienteAdmin] PUT', url, { nome, idade, email, telefone, dataNascimento, medicamento, patologia });
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ nome, idade, email, telefone, dataNascimento, medicamento, patologia })
      });
      const responseData = await processApiResponse(response);

      if (response.ok) {
        Alert.alert('Sucesso', 'Paciente atualizado!');
        setModalVisible(false);
        fetchPacientes(search);
      } else {
        console.error('Erro ao atualizar:', response.status, responseData);
        Alert.alert('Erro', String(responseData?.error || responseData?.message || `Status ${response.status}`));
      }
    } catch (error) {
      console.error('Erro de Conexão ao salvar edição:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setSaving(false);
    }
  };

  // Excluir paciente
  const handleDelete = (idPaciente, nome) => {
  console.log('[DEBUG] Clicou em deletar', idPaciente, nome);

  if (!idPaciente) {
    Alert.alert('Erro', 'ID do paciente ausente.');
    console.error('[DEBUG] ID do paciente ausente!');
    return;
  }

  Alert.alert(
    'Tem certeza?', `Você não poderá reverter esta ação!\n\nPaciente: ${nome}`,
    [
      { text: 'Cancelar', style: 'cancel', onPress: () => console.log('[DEBUG] Cancelou exclusão') },
      {
        text: 'Sim, excluir!',
        style: 'destructive',
        onPress: async () => {
          console.log('[DEBUG] Confirmou exclusão do paciente', idPaciente);
          setLoading(true);

          try {
            const url = `${PACIENTES_ENDPOINT}/${encodeURIComponent(idPaciente)}`;
            console.log('[DEBUG] URL DELETE:', url);

            const response = await fetch(url, {
              method: 'DELETE',
              headers: { Accept: 'application/json' },
            });

            console.log('[DEBUG] Status resposta DELETE:', response.status);

            if (response.status === 204 || response.ok) {
              Alert.alert('Excluído!', 'Paciente excluído com sucesso.');
              console.log('[DEBUG] Paciente deletado com sucesso');
              fetchPacientes(search);
            } else {
              const responseData = await processApiResponse(response);
              console.error('[DEBUG] Erro ao excluir:', response.status, responseData);
              Alert.alert(
                'Erro na Exclusão',
                String(responseData?.error || responseData?.message || `Status ${response.status}`)
              );
            }
          } catch (error) {
            console.error('[DEBUG] Erro de conexão ao excluir:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]
  );
};


  // ------------------- RENDER PACIENTE ------------------- //
  const renderPaciente = ({ item }) => (
    <View style={styles.pacienteCard}>
      <View style={styles.pacienteInfo}>
        <Text style={styles.pacienteTitle}>#{item.idPaciente || item.id} - {item.nome} {item.idade ? `(${item.idade} anos)` : ''}</Text>
        <Text style={styles.pacienteEmail}>{item.email || ''} {item.telefone ? `| ${item.telefone}` : ''}</Text>
        <Text style={styles.pacienteEmail}>Medicação: {item.medicamento || 'Nenhum'}</Text>
        <Text style={styles.pacienteEmail}>Patologia: {item.patologia || 'Nenhuma'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.buttonIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.idPaciente || item.id, item.nome)}>
          <Text style={styles.buttonIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ------------------- BOTÃO NOVO ------------------- //
  const handleNewPaciente = () => navigation?.navigate('CadastroPaciente');

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

      {/* ------------------- MODAL EDIÇÃO ------------------- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Paciente</Text>
            {['nome','idade','email','telefone','dataNascimento','medicamento','patologia'].map(field => (
              <TextInput
                key={field}
                style={styles.modalInput}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChangeText={text => setFormData({...formData, [field]: text})}
              />
            ))}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor:'#667eea' }]} onPress={handleSaveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Salvar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor:'#6c757d' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// ------------------- ESTILOS ------------------- //
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
  pacienteCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pacienteInfo: { flex: 1, marginRight: 10 },
  pacienteTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pacienteEmail: { fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row' },
  editButton: { backgroundColor: '#ffc107', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  deleteButton: { backgroundColor: '#dc3545', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  buttonIcon: { fontSize: 20 },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 40 },
  loader: { marginTop: 40 },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContainer: { backgroundColor:'#fff', padding:20, borderRadius:12, width:'90%' },
  modalTitle: { fontSize:20, fontWeight:'700', marginBottom:12, textAlign:'center' },
  modalInput: { borderWidth:1, borderColor:'#e0e0e0', borderRadius:8, paddingHorizontal:12, paddingVertical:10, marginBottom:10 },
  modalButton: { flex:1, paddingVertical:14, borderRadius:8, alignItems:'center', marginHorizontal:5 },
  modalButtonText: { color:'#fff', fontWeight:'700' }
});

export default ListaPaciente;

