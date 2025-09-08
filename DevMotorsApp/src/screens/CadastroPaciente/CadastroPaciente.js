import React from 'react';
import { View, Text, TextInput, Picker, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';

export default function CadastroPaciente() {
  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.formHeader}>
        <Text style={styles.title}>Cadastro de Paciente</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo para realizar o cadastro</Text>
      </View>

      {/* Nome Completo */}
      <View style={[styles.formRow, screenWidth < 600 && { flexDirection: 'column' }]}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput style={styles.input} placeholder="Digite o nome completo" />
        </View>
      </View>

      {/* Data de Nascimento e Telefone */}
      <View style={[styles.formRow, screenWidth < 600 && { flexDirection: 'column' }]}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput style={styles.input} placeholder="DD/MM/AAAA" />
        </View>
        <View style={styles.formControl}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
          <Text style={styles.helpText}>Formato: (00) 00000-0000</Text>
        </View>
      </View>

      {/* Email */}
      <View style={[styles.formRow, screenWidth < 600 && { flexDirection: 'column' }]}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Digite o email" keyboardType="email-address" />
        </View>
      </View>

      {/* Nome da Mãe */}
      <View style={[styles.formRow, screenWidth < 600 && { flexDirection: 'column' }]}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Nome da Mãe</Text>
          <TextInput style={styles.input} placeholder="Digite o nome da mãe" />
        </View>
      </View>

      {/* Medicamento Contínuo */}
      <View style={[styles.formRow, screenWidth < 600 && { flexDirection: 'column' }]}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Toma algum medicamento contínuo?</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.select}>
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Sim" value="sim" />
              <Picker.Item label="Não" value="nao" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Patologia */}
      <View style={[styles.formRow, screenWidth < 600 && { flexDirection: 'column' }]}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Paciente tem alguma patologia que trata?</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.select}>
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Sim" value="sim" />
              <Picker.Item label="Não" value="nao" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Botão */}
      <TouchableOpacity style={styles.btnPrimary}>
        <Text style={styles.btnText}>Cadastrar Paciente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F1EFEC',
    alignItems: 'center',
  },
  formHeader: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: '#123458',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
    width: '100%',
  },
  formControl: {
    flex: 1,
  },
  label: {
    marginBottom: 6,
    color: '#030303',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  select: {
    height: 50,
    width: '100%',
  },
  btnPrimary: {
    marginTop: 25,
    backgroundColor: '#123458',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
