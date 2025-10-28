import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar
} from 'react-native';

// Importe sua constante de configuração da API, como no código base.
// Assumindo que você tem uma constante para o endpoint de pacientes
// ou que o 'API_BASE_URL' + '/pacientes' é o correto.
const API_BASE_URL = Platform.OS === 'android'
  ? `http://10.0.2.2:${PORT}`
  : `http://${HOST_IP}:${PORT}`; // Mantenha ou substitua pela sua base
const PACIENTES_ENDPOINT = `${API_BASE_URL}/pacientes`; // Exemplo: https://sua-api.com/api/pacientes

// ------------------- COMPONENTE PRINCIPAL ------------------- //

const ListaPaciente = (props) => {
  const { navigation } = props;
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false); // Novo estado para o loading do modal
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

  useEffect(() => {
    // Adiciona um listener para recarregar a lista ao voltar para a tela
    const unsubscribe = navigation?.addListener('focus', () => {
        fetchPacientes();
    });
    return unsubscribe; // Cleanup function
  }, [navigation]);

  // Função auxiliar para processar a resposta da API (como no código base)
  const processApiResponse = async (response) => {
      const text = await response.text();
      let responseData = null;
      try { responseData = text ? JSON.parse(text) : null; } catch(e) { responseData = text; }
      return responseData;
  }

  // --------- FUNÇÃO DE BUSCA/GET --------- //
  const fetchPacientes = async (searchTerm = '') => {
    setLoading(true);
    try {
      // ✅ Integração da API para busca (GET)
      const url = `${PACIENTES_ENDPOINT}?search=${searchTerm}`;
      const response = await fetch(url);
      
      const responseData = await processApiResponse(response);

      if (response.ok) {
          setPacientes(responseData || []); // Assume que a resposta de sucesso é um array de pacientes
      } else {
          console.error('Erro da API ao buscar:', response.status, responseData);
          const errMsg = (responseData && (responseData.error || responseData.message)) || `Status ${response.status}`;
          Alert.alert('Erro na Busca', String(errMsg));
          setPacientes([]);
      }
      
    } catch (error) {
      console.error('Erro de Conexão na Busca:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar-se ao servidor para buscar os pacientes.');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPacientes(search);
  };

  const openEditModal = (paciente) => {
    // Formata a data de YYYY-MM-DD para DD/MM/YYYY para o modal (se for o formato de edição)
    // Se o backend espera YYYY-MM-DD, a conversão deve ser feita antes de enviar.
    const dataNascimentoDisplay = paciente.dataNascimento 
        ? paciente.dataNascimento.split('-').reverse().join('/') 
        : '';
        
    setFormData({
      idPaciente: paciente.idPaciente.toString(),
      nome: paciente.nome,
      idade: paciente.idade ? paciente.idade.toString() : '',
      email: paciente.email || '',
      telefone: paciente.telefone || '',
      dataNascimento: paciente.dataNascimento || '', // Mantenha no formato do backend (YYYY-MM-DD)
      medicamento: paciente.medicamento || '',
      patologia: paciente.patologia || ''
    });
    setModalVisible(true);
  };

  // --------- FUNÇÃO DE EDIÇÃO/PUT --------- //
  const handleSaveEdit = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    const dataToSend = {
      ...formData,
      idPaciente: Number(formData.idPaciente), 
      idade: formData.idade ? Number(formData.idade) : null,
      // Se necessário, converta dataNascimento para o formato DD/MM/YYYY aqui, 
      // mas o ideal é manter a data em YYYY-MM-DD para o backend se esse for o formato.
    };

    setSaving(true); // Ativa o loading de salvamento
    try {
      // ✅ Integração da API para edição (PUT)
      const response = await fetch(`${PACIENTES_ENDPOINT}/${dataToSend.idPaciente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend) 
      });

      const responseData = await processApiResponse(response);

      if (response.ok) {
        Alert.alert('Sucesso', 'Paciente atualizado com sucesso!');
        setModalVisible(false);
        fetchPacientes(search); // Recarrega a lista
      } else {
        console.error('Erro da API ao editar:', response.status, responseData);
        const errMsg = (responseData && (responseData.error || responseData.message)) || `Status ${response.status}`;
        Alert.alert('Erro na Edição', String(errMsg));
      }
    } catch (error) {
      console.error('Erro de Conexão na Edição:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar-se ao servidor para atualizar o paciente.');
    } finally {
      setSaving(false); // Desativa o loading de salvamento
    }
  };

  // --------- FUNÇÃO DE EXCLUSÃO/DELETE --------- //
  const handleDelete = (idPaciente, nome) => {
    Alert.alert(
      'Tem certeza?',
      `Você não poderá reverter esta ação!\n\nPaciente: ${nome}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sim, excluir!',
          style: 'destructive',
          onPress: async () => {
            setLoading(true); // Ativa o loading principal
            try {
              // ✅ Integração da API para exclusão (DELETE)
              const response = await fetch(`${PACIENTES_ENDPOINT}/${idPaciente}`, {
                method: 'DELETE'
              });

              const responseData = await processApiResponse(response);

              if (response.ok) {
                Alert.alert('Excluído!', 'O paciente foi excluído com sucesso.');
                fetchPacientes(search); // Recarrega a lista
              } else {
                console.error('Erro da API ao excluir:', response.status, responseData);
                const errMsg = (responseData && (responseData.error || responseData.message)) || `Status ${response.status}`;
                Alert.alert('Erro na Exclusão', String(errMsg));
              }
            } catch (error) {
              console.error('Erro de Conexão na Exclusão:', error);
              Alert.alert('Erro de Conexão', 'Não foi possível conectar-se ao servidor para excluir o paciente.');
            } finally {
                setLoading(false); // Desativa o loading principal
            }
          }
        }
      ]
    );
  };
  
  // Render Item da Lista
  const renderPaciente = ({ item }) => (
    <View style={styles.pacienteCard}>
      <View style={styles.pacienteInfo}>
        <Text style={styles.pacienteTitle}>#{item.idPaciente} - {item.nome} ({item.idade} anos)</Text>
        <Text style={styles.pacienteEmail}>{item.email} | {item.telefone}</Text>
        <Text style={styles.pacienteEmail}>Medicação: {item.medicamento || 'Nenhum'}</Text>
        <Text style={styles.pacienteEmail}>Patologia: {item.patologia || 'Nenhuma'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)} activeOpacity={0.8}>
          <Text style={styles.buttonIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.idPaciente, item.nome)} activeOpacity={0.8}>
          <Text style={styles.buttonIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const handleNewPaciente = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      // Redireciona para a tela de CadastroPaciente
      navigation.navigate('CadastroPaciente');
      return;
    }
    Alert.alert('Info', 'Navegue para tela de cadastro de novo paciente');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.newButton}
            onPress={handleNewPaciente}
            activeOpacity={0.8}
          >
            <Text style={styles.newButtonText}>+ Novo Paciente</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o nome ou código do paciente"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.8}
            disabled={loading} // Desabilita durante o loading
          >
            {loading && !modalVisible ? 
              <ActivityIndicator color="#fff" size="small" /> : 
              <Text style={styles.searchButtonText}>Procurar</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Lista de Pacientes</Text>
        
        {loading && !modalVisible ? (
          <ActivityIndicator size="large" color="#667eea" style={styles.loader} />
        ) : pacientes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum paciente encontrado. Tente buscar novamente.</Text>
        ) : (
          <FlatList
            data={pacientes}
            renderItem={renderPaciente}
            keyExtractor={(item) => item.idPaciente.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Paciente #{formData.idPaciente}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Campos do Formulário de Edição */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Digite o nome completo"
                  placeholderTextColor="#999"
                />
              </View>
              {/* ... outros campos ... (mantidos para brevidade) */}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Idade</Text>
                <TextInput
                  style={styles.input}
                  value={formData.idade}
                  onChangeText={(text) => setFormData({...formData, idade: text})}
                  placeholder="Digite a idade"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="Digite o email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefone}
                  // Idealmente, use a função de formatação do código base aqui
                  onChangeText={(text) => setFormData({...formData, telefone: text})} 
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad" 
                  maxLength={15} 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Data Nascimento (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dataNascimento}
                  onChangeText={(text) => setFormData({...formData, dataNascimento: text})}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="#999"
                  maxLength={10} 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Medicamento</Text>
                <TextInput
                  style={styles.input}
                  value={formData.medicamento}
                  onChangeText={(text) => setFormData({...formData, medicamento: text})}
                  placeholder="Digite o medicamento"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Patologia</Text>
                <TextInput
                  style={styles.input}
                  value={formData.patologia}
                  onChangeText={(text) => setFormData({...formData, patologia: text})}
                  placeholder="Digite a patologia"
                  placeholderTextColor="#999"
                />
              </View>

            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && { backgroundColor: '#adb5bd' }]}
                onPress={handleSaveEdit}
                activeOpacity={0.8}
                disabled={saving} // Desabilita o botão enquanto salva
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ... (Mantenha os estilos inalterados ou ajuste se necessário)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  controls: {
    padding: 15,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  newButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginRight: 8, // substitui gap
  },
  newButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: '#333',
    marginRight: 8, // espaçamento para o botão de busca
  },
  searchButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  listContainer: {
    flex: 1,
    padding: 15
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  listContent: {
    paddingBottom: 20
  },
  pacienteCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  pacienteInfo: {
    flex: 1,
    marginRight: 10
  },
  pacienteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  pacienteEmail: {
    fontSize: 14,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#ffc107',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginLeft: 8 // substitui gap
  },
  buttonIcon: {
    fontSize: 20
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
    fontStyle: 'italic'
  },
  loader: {
    marginTop: 40
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#667eea'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  closeButton: {
    padding: 5
  },
  closeButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300'
  },
  modalBody: {
    padding: 20,
    maxHeight: 400
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: '#333'
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    marginRight: 10 // substitui gap
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ListaPaciente;