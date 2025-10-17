import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios'; 

// **CORREÇÃO 1: Definição da URL Base da API**
// Substitua pelo IP ou URL do seu servidor PHP. 
// Ex: 'http://192.168.1.100/api'
const API_BASE_URL = 'http://SEU_IP_AQUI/SEU_DIRETORIO_DA_API'; 

// Componente para renderizar uma linha na lista
const ItemExame = ({ exame, onAction, navigation }) => {
    // Verifica se o resultado do exame está preenchido
    const temResultado = exame.resultado && exame.resultado.trim() !== '';

    // Função para formatar a data, se existir
    const formatarData = (dataStr) => {
        if (!dataStr) return '-';
        // Adapte a lógica de formatação de data conforme necessário
        // Cria um objeto Date
        const data = new Date(dataStr); 
        // Verifica se a data é válida
        if (isNaN(data.getTime())) {
            return dataStr; // Retorna a string original se for inválida
        }
        return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.itemContainer}>
            <View style={styles.dataRow}>
                <Text style={styles.idText}>ID Exame: {exame.idExame}</Text>
                <Text style={styles.pacienteIdText}>ID Paciente: {exame.paciente.idPaciente}</Text>
            </View>
            <Text style={styles.pacienteText}>Paciente: {exame.paciente.nome} ({exame.paciente.idade} anos)</Text>
            <Text style={styles.exameText}>Exame: {exame.exameTexto}</Text>
            <Text style={styles.dataText}>Data: {formatarData(exame.dataExame)}</Text>
            
            <View style={styles.actionsContainer}>
                {temResultado ? (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={() => navigation.navigate('VerLaudo', { idExame: exame.idExame })}>
                            <Text style={styles.buttonText}>Visualizar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => navigation.navigate('EditarResultado', { idExame: exame.idExame })}>
                            <Text style={[styles.buttonText, { color: '#333' }]}>Editar</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={[styles.actionButton, styles.insertButton]} onPress={() => navigation.navigate('FormResultado', { idExame: exame.idExame })}>
                        <Text style={styles.buttonText}>Inserir</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => onAction(exame.idExame)}
                >
                    {/* Para o ícone de lixeira, você precisará de uma biblioteca como 'react-native-vector-icons' */}
                    <Text style={styles.buttonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function ListaExamesScreen({ navigation }) {
    const [exames, setExames] = useState([]);
    const [buscaId, setBuscaId] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    const buscarExames = useCallback(async (id = '') => {
        setLoading(true);
        setErro('');
        try {
            // Adapte o endpoint da API conforme sua implementação PHP
            const endpoint = id ? `${API_BASE_URL}/exames.php?buscaId=${id}` : `${API_BASE_URL}/exames.php`;
            const response = await axios.get(endpoint);
            
            // Supondo que a API retorne um array de objetos de exame
            setExames(response.data); 
        } catch (e) {
            console.error("Erro ao buscar exames:", e);
            // Mensagem mais amigável, indicando problema de rede ou no servidor
            setErro('Erro ao carregar exames. Verifique o API_BASE_URL e a conexão com o servidor.');
            setExames([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Carrega todos os exames na montagem inicial
        buscarExames(); 
    }, [buscarExames]);

    const handleBuscar = () => {
        // Usa o trim para remover espaços em branco
        const idBusca = buscaId.trim(); 
        // Se a busca for vazia, carrega tudo; senão, busca pelo ID
        buscarExames(idBusca); 
    };

    const handleExcluir = (idExame) => {
        Alert.alert(
            "Tem certeza?",
            "Você não poderá reverter isso!",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim, excluir!",
                    onPress: async () => {
                        try {
                            // Endpoint para excluir. Você terá que criar o arquivo excluir_exame.php como um endpoint de API
                            await axios.delete(`${API_BASE_URL}/excluir_exame.php?idExame=${idExame}`);
                            Alert.alert('Sucesso', 'Exame excluído com sucesso!');
                            // Recarrega a lista após a exclusão
                            buscarExames(buscaId.trim()); 
                        } catch (e) {
                            Alert.alert('Erro', 'Não foi possível excluir o exame. Verifique o endpoint de exclusão.');
                            console.error("Erro na exclusão:", e);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <ItemExame 
            exame={item} 
            // O onAction agora recebe o id diretamente
            onAction={handleExcluir} 
            navigation={navigation}
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Exames Solicitados</Text>
            <Text style={styles.headerSubtitle}>Veja todos os exames solicitados pelos pacientes</Text>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por ID do Paciente: Ex: 1234"
                    keyboardType="numeric"
                    value={buscaId}
                    onChangeText={setBuscaId}
                />
                <Button title="Buscar" onPress={handleBuscar} color="#007bff" />
            </View>

            {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

            {loading ? (
                <Text style={styles.loadingText}>Carregando...</Text>
            ) : exames.length > 0 ? (
                <FlatList
                    data={exames}
                    renderItem={renderItem}
                    keyExtractor={item => item.idExame.toString()}
                    style={styles.list}
                />
            ) : (
                <Text style={styles.noResultsText}>
                    Nenhum exame encontrado. Tente buscar por outro ID ou verifique a conexão.
                </Text>
            )}
        </View>
    );
}

// Estilos básicos para a tela (simulando seu CSS)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    list: {
        flex: 1,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
        // Propriedades de sombra para iOS (shadow*) e Android (elevation)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    idText: {
        fontWeight: 'bold',
        color: '#333',
    },
    pacienteIdText: {
        color: '#666',
    },
    pacienteText: {
        fontSize: 16,
        marginBottom: 3,
    },
    exameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007bff',
        marginBottom: 5,
    },
    dataText: {
        fontSize: 14,
        color: '#999',
    },
    actionsContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'flex-start',
        flexWrap: 'wrap', // Permite quebrar linha em telas menores
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        // O primeiro botão não tem marginLeft, os demais sim
        marginLeft: 5, 
        marginTop: 5,
    },
    // Ajuste para o primeiro botão (Inserir/Visualizar) não ter margem à esquerda
    viewButton: {
        backgroundColor: '#17a2b8', // Visualizar
        marginLeft: 0, 
    },
    insertButton: {
        backgroundColor: '#28a745', // Inserir
        marginLeft: 0,
    },
    editButton: {
        backgroundColor: '#ffc107', // Editar
        marginLeft: 5, // Mantém a margem para botões subsequentes
    },
    deleteButton: {
        backgroundColor: '#dc3545', // Excluir
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        marginBottom: 15,
        fontWeight: 'bold',
    },
});
