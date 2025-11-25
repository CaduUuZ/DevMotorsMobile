import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Alert, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native';

// Importa endpoint dos pacientes (caminho relativo corrigido)
import { PACIENTES_ENDPOINT } from '../../../config/api';

/*
  processApiResponse: lê o corpo da resposta HTTP como texto e tenta
  parsear para JSON. Se falhar (resposta não-JSON) retorna o texto cru.
  Evita falhas quando a API retorna string ou vazio.
*/
const processApiResponse = async (response) => {
  const text = await response.text();
  let responseData = null;
  try {
    responseData = text ? JSON.parse(text) : null;
  } catch (e) {
    responseData = text;
  }
  return responseData;
};

/*
  ListaPacienteAdmin: componente principal que exibe, busca e edita pacientes.
  - navigation: prop do react-navigation para navegar entre telas.
*/
const ListaPacienteAdmin = ({ navigation }) => {
  // estados locais do componente
  const [pacientes, setPacientes] = useState([]); // lista carregada da API
  const [search, setSearch] = useState(''); // texto de busca
  const [loading, setLoading] = useState(false); // indicador de carregamento
  const [editingId, setEditingId] = useState(null); // id do paciente atualmente em edição
  const [editingData, setEditingData] = useState({ nome: '', email: '', telefone: '' }); // dados temporários do formulário de edição

  /*
    useEffect: adiciona listener para recarregar a lista quando a tela receber foco.
    Isso mantém a lista atualizada ao voltar de outras telas (ex: cadastro).
  */
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      fetchPacientes();
    });
    return unsubscribe;
  }, [navigation]);

  /*
    fetchPacientes: busca pacientes no backend.
    - searchTerm opcional para filtrar por nome/código.
    - atualiza estados loading e pacientes.
  */
  const fetchPacientes = async (searchTerm = "") => {
    setLoading(true);
    try {
      let url = PACIENTES_ENDPOINT;
      if (searchTerm !== "") {
        const s = encodeURIComponent(searchTerm);
        url = `${PACIENTES_ENDPOINT}?search=${s}`;
      }

      const response = await fetch(url);
      const data = await processApiResponse(response);

      if (!response.ok) {
        // se a API retornou erro, mostra alerta e limpa lista
        Alert.alert("Erro", "Falha ao buscar pacientes.");
        setPacientes([]);
        return;
      }

      // garante que o estado receba um array (ou vazio)
      setPacientes(Array.isArray(data) ? data : []);
    } catch (error) {
      // erro de rede / conexão
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // wrapper para buscar com o texto atual do input
  const handleSearch = () => {
    fetchPacientes(search.trim());
  };

  // navega para a tela de cadastro de pacientes
  const handleNewPaciente = () => navigation?.navigate('CadastroPaciente');

  /*
    startEditing: inicia a edição de um paciente preeenchendo o formulário local
    com os dados do item clicado.
  */
  const startEditing = (item) => {
    setEditingId(item.idPaciente || item.id);
    setEditingData({
      nome: item.nome || item.name || '',
      email: item.email || '',
      telefone: item.telefone || ''
    });
  };

  /*
    saveEdits: envia PUT para atualizar paciente no backend e atualiza a lista local
    - Se a atualização for bem-sucedida atualiza o estado 'pacientes' para refletir as mudanças
    - Trata erros e exibe alertas ao usuário
  */
  const saveEdits = async (id) => {
    try {
      const response = await fetch(`${PACIENTES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Erro PUT:', errorData);
        throw new Error('Falha ao atualizar paciente');
      }

      // atualiza localmente o paciente editado para evitar novo fetch
      setPacientes(pacientes.map(p => 
        (p.idPaciente || p.id) === id ? { ...p, ...editingData } : p
      ));

      setEditingId(null);
      Alert.alert('Sucesso', 'Paciente atualizado!');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível atualizar o paciente.');
    }
  };

  /*
    renderPaciente: componente de item para o FlatList.
    - Mostra campos estáticos quando não está editando
    - Mostra inputs e botão Salvar quando o item está em edição
  */
  const renderPaciente = ({ item }) => {
    const id = item.idPaciente || item.id;
    const isEditing = editingId === id;

    return (
      <TouchableOpacity
        style={styles.pacienteCard}
        onPress={() => !isEditing && startEditing(item)} // ao tocar inicia edição (se não estiver editando)
      >
        {isEditing ? (
          <>
            {/* Inputs controlados para edição */}
            <TextInput
              style={styles.inputEdit}
              value={editingData.nome}
              onChangeText={(text) => setEditingData({ ...editingData, nome: text })}
            />
            <TextInput
              style={styles.inputEdit}
              value={editingData.email}
              onChangeText={(text) => setEditingData({ ...editingData, email: text })}
            />
            <TextInput
              style={styles.inputEdit}
              value={editingData.telefone}
              onChangeText={(text) => setEditingData({ ...editingData, telefone: text })}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => saveEdits(id)}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Visão de leitura: nome, id e detalhes básicos */}
            <Text style={styles.pacienteTitle}>{item.nome || item.name}</Text>
            {item.id || item.idPaciente ? (
              <Text style={styles.pacienteDetail}>ID: {id}</Text>
            ) : null}
            {item.email ? <Text style={styles.pacienteDetail}>E-mail: {item.email}</Text> : null}
            {item.telefone ? <Text style={styles.pacienteDetail}>Telefone: {item.telefone}</Text> : null}
            {item.idade ? <Text style={styles.pacienteDetail}>Idade: {item.idade} anos</Text> : null}
          </>
        )}
      </TouchableOpacity>
    );
  };

  // UI principal do componente
  return (
    <SafeAreaView style={styles.container}>
      {/* barra de status com cor */}
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* controles superiores: botão novo, input de busca e botão procurar */}
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.newButton} onPress={handleNewPaciente}>
            <Text style={styles.newButtonText}>+ Novo Paciente</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Nome ou código do paciente"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch} // busca ao enviar no teclado
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.searchButtonText}>Procurar</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* lista de pacientes / estados vazios / loader */}
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

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  controls: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  newButton: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  newButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  searchInput: { flex: 1, minWidth: 200, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, marginBottom: 8, fontSize: 14 },
  searchButton: { backgroundColor: '#667eea', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginBottom: 8 },
  searchButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  listContainer: { flex: 1, padding: 15 },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  pacienteCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  pacienteTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pacienteDetail: { fontSize: 13, color: '#444', marginBottom: 2 },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 40, fontSize: 16 },
  loader: { marginTop: 40 },
  inputEdit: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 6 },
  saveButton: { backgroundColor: '#667eea', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});

export default ListaPacienteAdmin;
