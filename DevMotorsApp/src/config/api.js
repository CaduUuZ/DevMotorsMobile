import { Platform } from 'react-native';

const HOST_IP = '192.168.15.111'; // seu IP na rede
const PORT = 3000; // porta onde seu backend HTTP responde

export const API_BASE_URL = `http://${HOST_IP}:${PORT}/api/usuarios`;
export const REGISTER_ENDPOINT = `${API_BASE_URL}/registrar`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}/login`;
export const PACIENTES_ENDPOINT = `http://${HOST_IP}:${PORT}/api/pacientes`;
export const EXAMES_ENDPOINT = `http://${HOST_IP}:${PORT}/api/exames`;