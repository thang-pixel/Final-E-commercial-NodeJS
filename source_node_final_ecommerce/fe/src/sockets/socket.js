import { io } from 'socket.io-client';
import { API_DOMAIN } from '../constants/apiDomain';

export const socket = io(API_DOMAIN || 'http://localhost:8000', {
    withCredentials: true,
    transports: ['websocket'],
})