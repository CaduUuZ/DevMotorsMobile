import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { EXAMES_ENDPOINT } from '../../config/api';

// ---------- FUNÇÃO AUXILIAR ----------
const processApiResponse = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

// ---------- ITEM DE LISTA ----------
const ItemExame = ({ exame, onDelete, navigation }) => {
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return isNaN(data.getTime())
      ? dataStr
      : data.toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
  };

  const temResultado = exame.resultado && exame.resultado.trim() !== '';

  // 🔹 Função para gerar e salvar o PDF
  const gerarPdf = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { color: #123458; }
              p { font-size: 14px; line-height: 1.4; }
              .resultado { background: #f4f4f4; padding: 10px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>Laudo do Exame</h1>
            <p><b>Exame:</b> ${exame.exameTexto}</p>
            <p><b>Paciente:</b> ${exame.paciente?.nome} (${exame.paciente?.idade} anos)</p>
            <p><b>Data:</b> ${formatarData(exame.dataExame)}</p>
            <div class="resultado">
              <h3>Resultado:</h3>
              <p>${exame.resultado || 'Sem resultado disponível.'}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.titleItem}>Exame: {exame.exameTexto}</Text>
      <Text style={styles.subText}>Paciente: {exame.paciente?.nome} ({exame.paciente?.idade} anos)</Text>
      <Text style={styles.subText}>Data: {formatarData(exame.dataExame)}</Text>

      <View style={styles.actions}>
        {temResultado ? (
          <>
            {/* Visualizar (PDF) */}
            <TouchableOpacity
              style={[styles.btn, styles.viewBtn]}
              onPress={gerarPdf}
            >
              <Text style={styles.btnText}>Visualizar</Text>
            </TouchableOpacity>

            {/* Editar */}
            <TouchableOpacity
              style={[styles.btn, styles.editBtn]}
              onPress={() => navigation.navigate('EditarResultado', { idExame: exame.idExame })}
            >
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
          </>
        ) : (<TouchableOpacity
  style={[styles.btn, styles.insertBtn]}
  onPress={() => navigation.navigate('VerLaudo', { idExame: exame.idExame })}
>
  <Text style={styles.btnText}>Visualizar PDF</Text>
</TouchableOpacity> )}


        {/* Excluir */}
        <TouchableOpacity
          style={[styles.btn, styles.deleteBtn]}
          onPress={() => onDelete(exame.idExame)}
        >
          <Text style={styles.btnText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------- COMPONENTE PRINCIPAL ----------
export default function ListaExamesScreen({ navigation }) {
  const [exames, setExames] = useState([]);
  const [buscaId, setBuscaId] = useState('');
  const [loading, setLoading] = useState(false);

  const buscarExames = useCallback(async (id = '') => {
    setLoading(true);
    try {
      const url = id ? `${EXAMES_ENDPOINT}?buscaId=${id}` : EXAMES_ENDPOINT;
      console.log('[ListaExame] GET', url);
      const response = await fetch(url);
      const data = await processApiResponse(response);

      if (response.ok) {
        setExames(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro da API:', response.status, data);
        Alert.alert('Erro', 'Falha ao buscar exames.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarExames();
  }, [buscarExames]);

  // Recarrega quando a tela recebe foco
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      buscarExames(buscaId);
    });
    return unsubscribe;
  }, [navigation, buscarExames, buscaId]);

  const handleExcluir = async (idExame) => {
    Alert.alert('Confirmação', 'Deseja realmente excluir este exame?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const response = await fetch(`${EXAMES_ENDPOINT}/${idExame}`, { method: 'DELETE' });
            const data = await processApiResponse(response);

            if (response.ok) {
              Alert.alert('Sucesso', 'Exame excluído com sucesso!');
              buscarExames(buscaId);
            } else {
              console.error('Erro API ao excluir:', data);
              Alert.alert('Erro', 'Falha ao excluir exame.');
            }
          } catch (err) {
            console.error('Erro conexão exclusão:', err);
            Alert.alert('Erro de Conexão', 'Falha ao conectar ao servidor.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#123458" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exames Solicitados</Text>
      </View>

      <View style={styles.search}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID do Paciente"
          value={buscaId}
          onChangeText={setBuscaId}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => buscarExames(buscaId)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchText}>Buscar</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#123458" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={exames}
          renderItem={({ item }) => (
            <ItemExame exame={item} onDelete={handleExcluir} navigation={navigation} />
          )}
          keyExtractor={(item) => item.idExame.toString()}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EFEC' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#123458' },
  search: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    paddingHorizontal: 12, marginRight: 8, backgroundColor: '#f9f9f9',
  },
  searchBtn: { backgroundColor: '#123458', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10 },
  searchText: { color: '#fff', fontWeight: '700' },
  itemContainer: {
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12,
    borderLeftColor: '#123458', borderLeftWidth: 4,
  },
  titleItem: { fontSize: 16, fontWeight: '700', color: '#123458' },
  subText: { fontSize: 14, color: '#555', marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  btn: { padding: 8, borderRadius: 8, marginRight: 6, marginTop: 4 },
  viewBtn: { backgroundColor: '#17a2b8' },
  insertBtn: { backgroundColor: '#28a745' },
  editBtn: { backgroundColor: '#ffc107' },
  deleteBtn: { backgroundColor: '#dc3545' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
