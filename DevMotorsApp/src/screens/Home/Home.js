// Home.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

export default function Home() {
  const [pacientesHoje, setPacientesHoje] = useState(0);
  const [examesHoje, setExamesHoje] = useState(0);
  const [tabela, setTabela] = useState([]);

  useEffect(() => {
    // valores fake
    setPacientesHoje(Math.floor(Math.random() * 10));
    setExamesHoje(Math.floor(Math.random() * 10));

    const dias = Array.from({ length: 10 }, (_, i) => i + 1);
    setTabela(
      dias.map((dia) => {
        const pacientes = Math.floor(Math.random() * 10);
        const exames = Math.floor(Math.random() * 10);
        return { dia, pacientes, exames };
      })
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* SIDEBAR */}
      <View style={styles.sidebar}>
        <Text style={styles.logo}>☰</Text>
        <ScrollView>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="home" size={16} color="#fff" />
            <Text style={styles.menuText}> Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="pen-square" size={16} color="#fff" />
            <Text style={styles.menuText}> Cadastro de Pacientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="list" size={16} color="#fff" />
            <Text style={styles.menuText}> Lista de Pacientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="file-alt" size={16} color="#fff" />
            <Text style={styles.menuText}> Solicitar Exame</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="clipboard-list" size={16} color="#fff" />
            <Text style={styles.menuText}> Lista de Exames</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]}>
            <Icon name="sign-out-alt" size={16} color="#fff" />
            <Text style={styles.menuText}> Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="user" size={16} color="#fff" />
            <Text style={styles.menuText}> Perfil</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* CONTEÚDO */}
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
  container: { flex: 1, flexDirection: "row", backgroundColor: "#e9ecef" },

  // Sidebar
  sidebar: {
    width: 220,
    backgroundColor: "#343a40",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  logo: { color: "#fff", fontSize: 22, marginBottom: 20, textAlign: "center" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  menuText: { color: "#fff", fontSize: 14, marginLeft: 10 },

  // Conteúdo
  content: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },

  // Cards
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

  // Tabela
  table: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginVertical: 12 },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#dee2e6", padding: 6 },
  tableRow: { flexDirection: "row", padding: 6 },
  tableRowAlt: { backgroundColor: "#f8f9fa" },
  th: { flex: 1, fontWeight: "bold", textAlign: "center" },
  td: { flex: 1, textAlign: "center" },
});
