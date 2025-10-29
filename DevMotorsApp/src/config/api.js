import { Platform } from 'react-native';

const HOST_IP = '10.136.130.200'; // seu IP na rede
const PORT = 3000; // porta onde seu backend HTTP responde

export const API_BASE_URL = Platform.OS === 'android'
  ? `http://10.0.2.2:${PORT}`
  : `http://${HOST_IP}:${PORT}`;

export const PACIENTES_ENDPOINT = `${API_BASE_URL}/pacientes`;
export const EXAMES_ENDPOINT = `${API_BASE_URL}/exames`;