import { Platform } from 'react-native';

const HOST_IP = '201.86.43.42'; // seu IP na rede
const PORT = 3000; // porta onde seu backend HTTP responde

export const API_BASE_URL = Platform.OS === 'android'
  ? `http://201.86.43.42:${PORT}`
  : `http://${HOST_IP}:${PORT}`;

export const PACIENTES_ENDPOINT = `${API_BASE_URL}/pacientes`;
export const EXAMES_ENDPOINT = `${API_BASE_URL}/exames`;