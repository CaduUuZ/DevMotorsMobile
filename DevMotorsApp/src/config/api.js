import { Platform } from 'react-native';

const HOST_IP = '10.136.130.193'; // seu IP na rede
const PORT = 3000; // porta onde seu backend HTTP responde

export const API_BASE_URL = Platform.OS === 'android'
  ? `http://10.136.130.193:${PORT}`
  : `http://${HOST_IP}:${PORT}`;

export const PACIENTES_ENDPOINT = `${API_BASE_URL}/pacientes`;
export const EXAMES_ENDPOINT = `${API_BASE_URL}/exames`;
export const REGISTER_ENDPOINT = `${API_BASE_URL}/users/register`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}/users/login`;
