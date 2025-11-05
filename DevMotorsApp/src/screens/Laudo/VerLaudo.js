// src/screens/Exames/VerLaudo.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import { EXAMES_ENDPOINT } from '../../config/api'; // exemplo: http://192.168.x.x:3000/exames

export default function VerLaudo() {
  const route = useRoute();
  const { idExame } = route.params; // Recebe o ID pela navegação
  const [dados, setDados] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarExame();
  }, []);

  const buscarExame = async () => {
    try {
      const response = await fetch(`${EXAMES_ENDPOINT}/${idExame}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao carregar exame');

      // data agora possui exam.paciente aninhado; informacoesAdicionais é JSON string (ou null)
      // parse informacoesAdicionais com segurança
      const infoStr = data.informacoesAdicionais || data.informacoes_adicionais || null;
      setDados(data);
      setResultados(processarResultados(infoStr));
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const processarResultados = (jsonString) => {
    if (!jsonString) return [];

    let dadosJson;
    try {
      dadosJson = JSON.parse(jsonString);
    } catch {
      return [];
    }

    const nomes = {
      agar_sangue: 'Ágar Sangue',
      agar_chocolate: 'Ágar Chocolate',
      coloracao_gram: 'Coloração de Gram',
      agar_manitol: 'Ágar Manitol',
      teste_catalase: 'Teste Catalase',
      teste_coagulase: 'Teste Coagulase',
      teste_novobiocina: 'Teste Novobiocina',
      agar_macconkey: 'Ágar MacConkey',
      teste_oxidase: 'Teste Oxidase',
      epm: 'EPM',
      citrato: 'Citrato',
      resultado_gram_positivo: 'Gram Positivo',
      resultado_gram_negativo: 'Gram Negativo',
      resultado_bgp: 'Resultado BGP',
      resultado_bgn: 'Resultado BGN',
    };

    return Object.entries(dadosJson)
      .filter(([_, valor]) => valor)
      .map(([chave, valor]) => ({
        teste: nomes[chave] || chave,
        resultado: valor,
      }));
  };

  const handleImprimir = async () => {
    if (!dados) return;
    try {
      const html = gerarHtmlParaImpressao(dados, resultados);
      await Print.printAsync({ html });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível imprimir o laudo.');
    }
  };

  const gerarHtmlParaImpressao = (dados, resultados) => `
    <html>
    <body style="font-family: Arial; padding: 20px;">
      <h2 style="text-align:center;">LABORATÓRIO DE ANÁLISES CLÍNICAS</h2>
      <h4 style="text-align:center;">${dados.laboratorio || ''}</h4>
      <hr/>
      <h3>DADOS DO PACIENTE</h3>
      <p><b>Nome:</b> ${dados.nome}</p>
      <p><b>ID Paciente:</b> ${dados.idPaciente}</p>
      <p><b>Data Nascimento:</b> ${new Date(dados.dataNascimento).toLocaleDateString()}</p>
      <p><b>Idade:</b> ${dados.idade || ''} anos</p>
      <hr/>
      <h3>DADOS DO EXAME</h3>
      <p><b>Tipo:</b> ${dados.exameTexto}</p>
      <p><b>Data:</b> ${new Date(dados.dataExame).toLocaleString()}</p>
      <p><b>Laboratório:</b> ${dados.laboratorio}</p>
      <hr/>
      <h3>RESULTADOS</h3>
      ${resultados
        .map(
          (r) =>
            `<p><b>${r.teste}:</b> <span style="color:${
              r.resultado.toLowerCase() === 'positivo' ? 'red' : 'green'
            }">${r.resultado}</span></p>`
        )
        .join('')}
      ${
        dados.resultado
          ? `<hr/><h3>RESULTADO GERAL</h3><p>${dados.resultado}</p>`
          : ''
      }
      <br/><br/>
      <p>______________________________________</p>
      <p>Responsável Técnico</p>
      <p>Laboratório de Análises Clínicas</p>
    </body>
    </html>
  `;

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!dados) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#999' }}>Exame não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>LABORATÓRIO DE ANÁLISES CLÍNICAS</Text>
        <Text>{dados.laboratorio}</Text>
        <Text style={styles.subtitulo}>LAUDO DE EXAME LABORATORIAL</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DADOS DO PACIENTE</Text>
        <Text><Text style={styles.label}>Nome:</Text> {dados.paciente?.nome || dados.nome}</Text>
        <Text><Text style={styles.label}>ID Paciente:</Text> {dados.idPaciente}</Text>
        <Text>
          <Text style={styles.label}>Data Nascimento:</Text>{' '}
          {new Date(dados.dataNascimento).toLocaleDateString()}
        </Text>
        <Text><Text style={styles.label}>Idade:</Text> {dados.idade} anos</Text>
        {dados.telefone ? (
          <Text><Text style={styles.label}>Telefone:</Text> {dados.telefone}</Text>
        ) : null}
        {dados.nomeMae ? (
          <Text><Text style={styles.label}>Nome da Mãe:</Text> {dados.nomeMae}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DADOS DO EXAME</Text>
        <Text><Text style={styles.label}>Tipo:</Text> {dados.exameTexto}</Text>
        <Text>
          <Text style={styles.label}>Data:</Text>{' '}
          {new Date(dados.dataExame).toLocaleString()}
        </Text>
        <Text><Text style={styles.label}>Laboratório:</Text> {dados.laboratorio}</Text>
        {dados.nomeMedicamento ? (
          <Text><Text style={styles.label}>Medicamento:</Text> {dados.nomeMedicamento}</Text>
        ) : null}
        {dados.nomePatologia ? (
          <Text><Text style={styles.label}>Patologia:</Text> {dados.nomePatologia}</Text>
        ) : null}
      </View>

      {resultados.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESULTADOS</Text>
          {resultados.map((r, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultLabel}>{r.teste}:</Text>
              <Text
                style={[
                  styles.resultValue,
                  r.resultado.toLowerCase() === 'positivo'
                    ? styles.positivo
                    : styles.negativo,
                ]}
              >
                {r.resultado}
              </Text>
            </View>
          ))}
        </View>
      )}

      {dados.resultado && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESULTADO GERAL</Text>
          <Text>{dados.resultado}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text>Data de emissão: {new Date().toLocaleString()}</Text>
        <Text style={{ marginTop: 40, textAlign: 'center' }}>
          _______________________________
        </Text>
        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Responsável Técnico
        </Text>
      </View>

      <TouchableOpacity style={styles.btnImprimir} onPress={handleImprimir}>
        <Text style={styles.btnText}>🖨️ Imprimir Laudo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 16,
    color: '#444',
  },
  section: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#222',
  },
  label: {
    fontWeight: 'bold',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingVertical: 4,
  },
  resultLabel: {
    fontWeight: '500',
  },
  resultValue: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  positivo: {
    color: 'red',
  },
  negativo: {
    color: 'green',
  },
  btnImprimir: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
