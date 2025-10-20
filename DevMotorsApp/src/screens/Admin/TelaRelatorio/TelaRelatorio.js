import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TelaRelatorio({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.closeText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Tela de relatório básica. Aqui você pode adicionar filtros, gráficos ou listas conforme precisar.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFEC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#123458',
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#123458',
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});