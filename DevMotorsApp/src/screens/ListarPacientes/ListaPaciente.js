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

// Configure a URL da sua API aqui
const API_BASE_URL = 'https://sua-api.com/api';

const ListaPaciente = (props) => {
  const { navigation } = props;
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
    fetchPacientes();
  }, []);

  const fetchPacientes = async (searchTerm = '') => {
    setLoading(true);
    try {
      // Descomente para usar sua API real:
      // const response = await fetch(`${API_BASE_URL}/pacientes?search=${searchTerm}`);
      // const data = await response.json();
      // setPacientes(data);

      // Dados mockados (remova em produção)
      const mockData = [
        {
          idPaciente: 1,
          nome: 'João Silva',
          idade: 45,
          email: 'joao@email.com',
          telefone: '(11) 98765-4321',
          dataNascimento: '1979-05-15',
          medicamento: 'Losartana',
          patologia: 'Hipertensão'
        },
        {
          idPaciente: 2,
          nome: 'Maria Santos',
          idade: 32,
          email: 'maria@email.com',
          telefone: '(11) 91234-5678',
          dataNascimento: '1992-08-20',
          medicamento: 'Metformina',
          patologia: 'Diabetes'
        },
        {
          idPaciente: 3,
          nome: 'Pedro Oliveira',
          idade: 58,
          email: 'pedro@email.com',
          telefone: '(11) 99876-5432',
          dataNascimento: '1966-03-10',
          medicamento: 'Sinvastatina',
          patologia: 'Colesterol Alto'
        },
        {
          idPaciente: 4,
          nome: 'Ana Costa',
          idade: 28,
          email: 'ana@email.com',
          telefone: '(11) 97654-3210',
          dataNascimento: '1996-11-22',
          medicamento: 'Levotiroxina',
          patologia: 'Hipotireoidismo'
        }
      ];

      // Filtro local (em produção, faça no backend)
      let filtered = mockData;
      if (searchTerm) {
        filtered = mockData.filter(p => 
          p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.idPaciente.toString() === searchTerm
        );
      }
      
      setPacientes(filtered);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPacientes(search);
  };

  const openEditModal = (paciente) => {
    setFormData({
      idPaciente: paciente.idPaciente.toString(),
      nome: paciente.nome,
      idade: paciente.idade.toString(),
      email: paciente.email || '',
      telefone: paciente.telefone || '',
      dataNascimento: paciente.dataNascimento || '',
      medicamento: paciente.medicamento || '',
      patologia: paciente.patologia || ''
    });
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    const dataToSend = {
      ...formData,
      // Garante que a idade seja enviada como um número para o backend
      idade: Number(formData.idade), 
    };

    try {
      // Descomente para usar sua API real:
      // await fetch(`${API_BASE_URL}/pacientes/${dataToSend.idPaciente}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSend) 
      // });

      Alert.alert('Sucesso', 'Paciente atualizado com sucesso');
      setModalVisible(false);
      fetchPacientes(search);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o paciente');
    }
  };

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
            try {
              // Descomente para usar sua API real:
              // await fetch(`${API_BASE_URL}/pacientes/${idPaciente}`, {
              //   method: 'DELETE'
              // });

              Alert.alert('Excluído!', 'O paciente foi excluído com sucesso.');
              fetchPacientes(search);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o paciente');
            }
          }
        }
      ]
    );
  };

  const handleNewPaciente = () => {
    // Navegue para a tela de cadastro
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('CadastroPaciente');
      return;
    }
    Alert.alert('Info', 'Navegue para tela de cadastro de novo paciente');
  };

  const renderPaciente = ({ item }) => (
    <View style={styles.pacienteCard}>
      <View style={styles.pacienteInfo}>
        <Text style={styles.pacienteTitle}>
          {item.idPaciente} - {item.nome}
        </Text>
        <Text style={styles.pacienteEmail}>{item.email}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.idPaciente, item.nome)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          >
            <Text style={styles.searchButtonText}>Procurar</Text>
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
              <Text style={styles.modalTitle}>Editar Paciente</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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
                  onChangeText={(text) => setFormData({...formData, telefone: text})}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#999"
                  // 🚀 Melhoria de UX: Teclado otimizado para telefone e limite de caracteres
                  keyboardType="phone-pad" 
                  maxLength={15} 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Data Nascimento</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dataNascimento}
                  onChangeText={(text) => setFormData({...formData, dataNascimento: text})}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="#999"
                  // 🚀 Melhoria de UX: Limite de caracteres
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
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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