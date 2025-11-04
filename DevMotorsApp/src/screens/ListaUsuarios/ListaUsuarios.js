import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { USERS_ENDPOINT } from '../../config/api';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // ===== BUSCA USUÁRIOS =====
  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const resp = await fetch(`${USERS_ENDPOINT}`);
      const data = await resp.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setCarregando(false);
    }
  };

  // ===== ALTERAR ADMIN =====
  const alternarAdmin = async (id, isAdminAtual) => {
    const novoValor = !isAdminAtual;

    try {
      const resp = await fetch(`${USERS_ENDPOINT}/${id}/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: novoValor }),
      });

      if (resp.ok) {
        Alert.alert(
          'Sucesso',
          novoValor ? 'Usuário agora é administrador.' : 'Admin removido com sucesso.'
        );
        carregarUsuarios();
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o status do usuário.');
      }
    } catch (erro) {
      console.error('Erro ao atualizar admin:', erro);
      Alert.alert('Erro', 'Falha ao se comunicar com o servidor.');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // ===== RENDER ITEM =====
  const renderUsuario = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.id}>ID: {item.id}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={[styles.status, { color: item.isAdmin ? 'green' : 'gray' }]}>
          {item.isAdmin ? 'Administrador' : 'Usuário comum'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.botao,
          { backgroundColor: item.isAdmin ? '#c0392b' : '#27ae60' },
        ]}
        onPress={() => alternarAdmin(item.id, item.isAdmin)}
      >
        <Text style={styles.textoBotao}>
          {item.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {carregando ? (
        <ActivityIndicator size="large" color="#123458" />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUsuario}
          onRefresh={carregarUsuarios}
          refreshing={carregando}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum usuário cadastrado</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFEC',
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  id: {
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 15,
    color: '#555',
  },
  status: {
    marginTop: 4,
    fontSize: 13,
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#555',
    fontSize: 15,
  },
});
