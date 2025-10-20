import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Necessário instalar: npm install @react-native-picker/picker
import axios from 'axios';

// URL base da sua API PHP
const API_BASE_URL = 'http://seu-servidor-local/seus-arquivos-php/api';

// Lista estática de laboratórios (pode ser carregada dinamicamente da API também)
const laboratorios = [
    { label: "Selecione um Laboratório", value: "" },
    { label: "Microbiologia", value: "microbiologia" },
    { label: "Parasitologia", value: "parasitologia" },
    { label: "Hematologia", value: "hematologia" },
    { label: "Bioquímica", value: "bioquímica" },
    { label: "Urinálise", value: "urinálise" },
];

export default function SolicitarExameScreen({ navigation }) {
    // 1. Estados do Formulário
    const [pacienteId, setPacienteId] = useState('');
    const [laboratorio, setLaboratorio] = useState('');
    const [examesDisponiveis, setExamesDisponiveis] = useState([]);
    const [exameSelecionado, setExameSelecionado] = useState(''); // O ID/Value do exame
    const [exameTexto, setExameTexto] = useState(''); // O texto do exame para salvar
    const [loading, setLoading] = useState(false);
    
    // NOTE: Em React Native, buscar paciente por ID geralmente é feito em um campo 
    // com auto-completar ou validando se o ID é válido. Aqui, simulamos o input simples.

    // 2. Função para carregar opções de exame
    const carregarOpcoesExame = useCallback(async (lab) => {
        if (!lab) {
            setExamesDisponiveis([]);
            setExameSelecionado('');
            return;
        }

        try {
            // API para buscar exames do laboratório (Você precisa criar este endpoint)
            const response = await axios.get(`${API_BASE_URL}/exames_por_laboratorio.php?laboratorio=${lab}`);
            // Exemplo de formato esperado: [{ id: 1, nome: 'Hemograma Completo' }, ...]
            setExamesDisponiveis(response.data);
            setExameSelecionado(''); // Reseta a seleção
            setExameTexto(''); // Reseta o texto
        } catch (error) {
            console.error("Erro ao carregar exames:", error);
            Alert.alert("Erro", "Não foi possível carregar os exames para este laboratório.");
            setExamesDisponiveis([]);
        }
    }, []);

    // 3. Efeito para disparar a carga de opções quando o laboratório mudar
    useEffect(() => {
        carregarOpcoesExame(laboratorio);
    }, [laboratorio, carregarOpcoesExame]);

    // 4. Função para gerenciar a seleção do exame
    const handleExameChange = (value) => {
        setExameSelecionado(value);

        // Encontra o texto correspondente ao valor selecionado para salvar no banco
        const exameObjeto = examesDisponiveis.find(e => e.id.toString() === value.toString());
        if (exameObjeto) {
            setExameTexto(exameObjeto.nome);
        } else {
            setExameTexto('');
        }
    };

    // 5. Função de Submissão do Formulário
    const handleSubmit = async () => {
        if (!pacienteId || !laboratorio || !exameSelecionado) {
            Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);

        try {
            // Os dados a serem enviados
            const dados = {
                pacienteId: pacienteId,
                laboratorio: laboratorio,
                exameTexto: exameTexto,
                // Você pode incluir o ID do exame selecionado, se necessário
                exameId: exameSelecionado, 
            };
            
            // Endpoint POST para salvar a solicitação (Você precisa criar este endpoint)
            const response = await axios.post(`${API_BASE_URL}/exameDados.php`, dados);

            Alert.alert("Sucesso", "Exame cadastrado com sucesso!");
            
            // Limpa o formulário após o sucesso
            setPacienteId('');
            setLaboratorio('');
            setExamesDisponiveis([]);
            setExameSelecionado('');
            setExameTexto('');

        } catch (error) {
            console.error("Erro ao solicitar exame:", error.response || error);
            const msgErro = error.response && error.response.data && error.response.data.error 
                            ? error.response.data.error 
                            : "Erro ao cadastrar o exame. Tente novamente.";
            Alert.alert("Erro de Cadastro", msgErro);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Sidebar (seria um componente separado ou parte da navegação) */}
            {/* <SidebarComponent /> */} 
            
            <View style={styles.formHeader}>
                <Text style={styles.title}>Solicitar Exame</Text>
            </View>

            <View style={styles.form}>
                {/* 1. Procurar Paciente (ID) */}
                <View style={styles.formControl}>
                    <Text style={styles.label}>Procurar Paciente (ID)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ID do Paciente"
                        keyboardType="numeric"
                        value={pacienteId}
                        onChangeText={setPacienteId}
                        autoCapitalize="none"
                        required
                    />
                </View>

                {/* 2. Laboratórios */}
                <View style={styles.formControl}>
                    <Text style={styles.label}>Laboratórios</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={laboratorio}
                            onValueChange={(itemValue) => setLaboratorio(itemValue)}
                            style={styles.picker}
                        >
                            {laboratorios.map(lab => (
                                <Picker.Item key={lab.value} label={lab.label} value={lab.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* 3. Opções de Exames Dinâmicas */}
                <View style={styles.formControl}>
                    <Text style={styles.label}>Exames</Text>
                    <View style={styles.pickerContainer}>
                        {laboratorio ? (
                            <Picker
                                selectedValue={exameSelecionado}
                                onValueChange={handleExameChange}
                                enabled={!loading && examesDisponiveis.length > 0}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecione o Exame" value="" />
                                {examesDisponiveis.map(exame => (
                                    <Picker.Item key={exame.id} label={exame.nome} value={exame.id.toString()} />
                                ))}
                            </Picker>
                        ) : (
                            <Text style={styles.infoText}>Selecione um laboratório primeiro.</Text>
                        )}
                    </View>
                </View>

                {/* Botão de Envio */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.btnPrimary, loading && styles.btnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.btnText}>
                            {loading ? 'Cadastrando...' : 'Cadastrar Exame'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// 6. Estilos (Simulando o CSS)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    formHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        paddingHorizontal: 10,
    },
    formControl: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '600',
        color: '#555',
    },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden', // Importante para o Picker
    },
    picker: {
        height: 45,
        width: '100%',
    },
    infoText: {
        padding: 10,
        color: '#999',
    },
    buttons: {
        marginTop: 20,
    },
    btnPrimary: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    btnDisabled: {
        backgroundColor: '#a0c7ff', // Cor mais clara para indicar desabilitado
    },
});