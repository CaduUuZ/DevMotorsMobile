import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import axios from "axios";
import { PACIENTES_ENDPOINT, EXAMES_ENDPOINT } from "../../config/api";

export default function Home() {
  const [pacientesHoje, setPacientesHoje] = useState(0);
  const [examesHoje, setExamesHoje] = useState(0);
  const [tabela, setTabela] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function carregarDados() {
    try {
      const pacientesRes = await axios.get(PACIENTES_ENDPOINT);
      const examesRes = await axios.get(EXAMES_ENDPOINT);

      const pacientes = pacientesRes.data || [];
      const exames = examesRes.data || [];

      // 🔹 Contagem de hoje
      const hoje = new Date();
      const diaHoje = hoje.toISOString().split("T")[0];

      const pacientesHojeCount = pacientes.filter(p => {
        const data = new Date(p.dataCadastro);
        const dia = data.toISOString().split("T")[0];
        return dia === diaHoje;
      }).length;

      const examesHojeCount = exames.filter(e => {
        if (!e.dataExame) return false;
        const data = new Date(e.dataExame);
        const dia = data.toISOString().split("T")[0];
        return dia === diaHoje;
      }).length;

      setPacientesHoje(pacientesHojeCount);
      setExamesHoje(examesHojeCount);

      // 🔹 Agrupar estatísticas por dia
      const dias = {};
      pacientes.forEach(p => {
        const dia = new Date(p.dataCadastro).toISOString().split("T")[0];
        dias[dia] = dias[dia] || { pacientes: 0, exames: 0 };
        dias[dia].pacientes++;
      });

      exames.forEach(e => {
        if (!e.dataExame) return;
        const dia = new Date(e.dataExame).toISOString().split("T")[0];
        dias[dia] = dias[dia] || { pacientes: 0, exames: 0 };
        dias[dia].exames++;
      });

      const tabelaFinal = Object.entries(dias)
        .map(([dia, valores]) => ({
          dia,
          pacientes: valores.pacientes,
          exames: valores.exames,
        }))
        .sort((a, b) => new Date(b.dia) - new Date(a.dia));

      setTabela(tabelaFinal.slice(0, 10));
    } catch (err) {
      console.error("Erro ao carregar dados:", err.message);
    } finally {
      setLoading(false);
    }
  }

  carregarDados();
}, []);


  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>📊 Painel de Resumo do Dia</Text>

        {/* Cards */}
        <View style={styles.row}>
          <View style={[styles.card, { backgroundColor: "#0d6efd" }]}>
            <Text style={styles.cardTitle}>Pacientes Cadastrados</Text>
            <Text style={styles.cardValue}>{pacientesHoje}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: "#ffc107" }]}>
            <Text style={styles.cardTitle}>Exames Solicitados</Text>
            <Text style={styles.cardValue}>{examesHoje}</Text>
          </View>
        </View>

        {/* Tabela */}
        <Text style={styles.title}>📋 Estatísticas Diárias</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.th}>Dia</Text>
            <Text style={styles.th}>Pacientes</Text>
            <Text style={styles.th}>Exames</Text>
            <Text style={styles.th}>Total</Text>
          </View>
          {tabela.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={styles.td}>{item.dia}</Text>
              <Text style={styles.td}>{item.pacientes}</Text>
              <Text style={styles.td}>{item.exames}</Text>
              <Text style={styles.td}>{item.pacientes + item.exames}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e9ecef" },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  card: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    minHeight: 100,
  },
  cardTitle: { color: "#fff", fontSize: 14 },
  cardValue: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  table: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginVertical: 12 },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#dee2e6", padding: 6 },
  tableRow: { flexDirection: "row", padding: 6 },
  tableRowAlt: { backgroundColor: "#f8f9fa" },
  th: { flex: 1, fontWeight: "bold", textAlign: "center" },
  td: { flex: 1, textAlign: "center" },
});
