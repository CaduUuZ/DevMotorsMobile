import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert,
    ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios'; 


const API_BASE_URL = '';

// Lista estática de exames para cada laboratório
const LISTA_EXAMES_ESTATICA = {
    microbiologia: [
        { id: "micro1", nome: "Urocultura com antibiograma" },
        { id: "micro2", nome: "Swab ocular" },
        { id: "micro3", nome: "Escarro para exame de Micobacterium tuberculosis" },
    ],
    parasitologia: [
        { id: "para1", nome: "Exame parasitológico de fezes" },
        { id: "para2", nome: "Sangue oculto" },
    ],
    hematologia: [
        { id: "hemato1", nome: "Hemograma completo" },
        { id: "hemato2", nome: "Outros exames de hematologia" },
    ],
    bioquímica: [
        { id: "bio1", nome: "Ácido úrico" },
        { id: "bio2", nome: "Alfa amilase" },
        { id: "bio3", nome: "Bilirrubina Total" },
        { id: "bio4", nome: "Bilirrubina Direta" },
        { id: "bio5", nome: "Cálcio" },
        { id: "bio6", nome: "Colesterol" },
        { id: "bio7", nome: "HDL" },
        { id: "bio8", nome: "Creatinina" },
        { id: "bio9", nome: "Ferro Ferene" },
        { id: "bio10", nome: "Fosfatase Alcalina" },
        { id: "bio11", nome: "Fosfato" },
        { id: "bio12", nome: "Gama GT" },
        { id: "bio13", nome: "Glicose" },
        { id: "bio14", nome: "GOT (AST)" },
        { id: "bio15", nome: "GTP (ALT)" },
        { id: "bio16", nome: "Magnésio" },
        { id: "bio17", nome: "Proteína total" },
        { id: "bio18", nome: "Triglicerídeos" },
        { id: "bio19", nome: "Uréia" },
    ],
    urinálise: [
        { id: "urina", nome: "Urina 1" },
    ],
};

// Lista de laboratórios para o primeiro Picker
const laboratorios = [
    { label: "Selecione um Laboratório", value: "" },
    { label: "Microbiologia", value: "microbiologia" },
    { label: "Parasitologia", value: "parasitologia" },
    { label: "Hematologia", value: "hematologia" },
    { label: "Bioquímica", value: "bioquímica" },
    { label: "Urinálise", value: "urinálise" },
];


export default function SolicitarExameScreen({ navigation }) {
    // 2. Estados do Formulário
    const [pacienteId, setPacienteId] = useState('');
    const [laboratorio, setLaboratorio] = useState('');
    const [exameSelecionado, setExameSelecionado] = useState(''); // O ID/Value do exame
    const [exameTexto, setExameTexto] = useState(''); // O texto do exame (ex: 'Hemograma completo') para salvar
    const [loading, setLoading] = useState(false);
    
    // 3. Filtra os exames disponíveis com base no laboratório selecionado
    const examesDisponiveis = laboratorio 
        ? (LISTA_EXAMES_ESTATICA[laboratorio] || []) 
        : [];

    // 4. Função para gerenciar a seleção do Laboratório
    const handleLaboratorioChange = (labValue) => {
        setLaboratorio(labValue);
        // Reseta o exame selecionado e o texto ao mudar o laboratório
        setExameSelecionado(''); 
        setExameTexto('');
    };


    // 5. Função para gerenciar a seleção do Exame
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


    // 6. Função de Submissão do Formulário
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
                exameTexto: exameTexto, // Nome do exame
                exameId: exameSelecionado, // ID/Value do exame
            };
            
            // Aqui você faria a chamada real à API (Exemplo com Axios)
            // const response = await axios.post(`${API_BASE_URL}/exameDados.php`, dados);

            console.log("Dados Enviados:", dados); // Verifique os dados no console
            Alert.alert("Sucesso", `Exame "${exameTexto}" para Paciente ID ${pacienteId} cadastrado com sucesso!`);
            
            // Limpa o formulário após o sucesso
            setPacienteId('');
            setLaboratorio('');
            setExameSelecionado('');
            setExameTexto('');

        } catch (error) {
            // Tratamento de erro de API (Ajuste para seu ambiente)
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
                    />
                </View>

                {/* 2. Laboratórios (Primeiro Dropdown) */}
                <View style={styles.formControl}>
                    <Text style={styles.label}>Laboratórios</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={laboratorio}
                            onValueChange={handleLaboratorioChange} 
                            style={styles.picker}
                        >
                            {laboratorios.map(lab => (
                                <Picker.Item key={lab.value} label={lab.label} value={lab.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* 3. Opções de Exames Dinâmicas (Segundo Dropdown) */}
                <View style={styles.formControl}>
                    <Text style={styles.label}>Exames</Text>
                    <View style={styles.pickerContainer}>
                        {/* Renderiza o Picker apenas se um laboratório foi selecionado */}
                        {laboratorio && examesDisponiveis.length > 0 ? (
                            <Picker
                                selectedValue={exameSelecionado}
                                onValueChange={handleExameChange} 
                                enabled={!loading}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecione o Exame" value="" />
                                {examesDisponiveis.map(exame => (
                                    <Picker.Item key={exame.id} label={exame.nome} value={exame.id.toString()} />
                                ))}
                            </Picker>
                        ) : (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    {laboratorio ? "Nenhum exame disponível." : "Selecione um laboratório para ver os exames."}
                                </Text>
                            </View>
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
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Cadastrar Exame</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// 7. Estilos
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
        overflow: 'hidden',
    },
    picker: {
        height: 45,
        width: '100%',
    },
    infoBox: {
        height: 45,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    infoText: {
        color: '#999',
        fontSize: 16,
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
        backgroundColor: '#a0c7ff',
    },
});