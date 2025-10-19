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

const PacientesApp = () => {
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