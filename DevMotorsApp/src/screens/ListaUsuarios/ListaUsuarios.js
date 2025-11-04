import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { USERS_ENDPOINT } from '../../config/api';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const resp = await fetch(`${USERS_ENDPOINT}`);
      const data = await resp.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  };

  const alternarAdmin = async (id, isAdminAtual) => {
    try {
      const resp = await fetch(`${USERS_ENDPOINT}/${id}/admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdminAtual }),
      });

      if (resp.ok) {
        carregarUsuarios();
      } else {
        Alert.alert('Erro', 'Falha ao atualizar o usuário');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao tentar atualizar usuário');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.email?.toLowerCase().includes(busca.toLowerCase()) ||
     u.nome?.toLowerCase().includes(busca.toLowerCase()))
  );

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.isAdmin && styles.cardAdmin]}>
      <View>
        <Text style={styles.id}>ID: {item.id}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={[styles.status, item.isAdmin ? styles.statusAdmin : styles.statusUser]}>
          {item.isAdmin ? 'Administrador' : 'Usuário comum'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.botao, item.isAdmin ? styles.remover : styles.tornar]}
        onPress={() => alternarAdmin(item.id, item.isAdmin)}
      >
        <Text style={styles.textoBotao}>
          {item.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciar Usuários</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nome ou e-mail..."
        placeholderTextColor="#aaa"
        value={busca}
        onChangeText={setBusca}
      />

      {carregando ? (
        <ActivityIndicator size="large" color="#123458" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFEC',
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#123458',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardAdmin: {
    borderLeftWidth: 4,
    borderLeftColor: '#0a8754',
  },
  id: {
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  statusAdmin: {
    color: '#0a8754',
  },
  statusUser: {
    color: '#555',
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  tornar: {
    backgroundColor: '#0a8754',
  },
  remover: {
    backgroundColor: '#c0392b',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#777',
  },
});
