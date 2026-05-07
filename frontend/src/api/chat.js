import { apiFetch } from './config';

// User
export const getMyChat    = ()         => apiFetch('/chat/my/');
export const sendChatMsg  = (body)     => apiFetch('/chat/my/', { method:'POST', body: JSON.stringify({ body }) });

// Admin
export const getChatList  = ()         => apiFetch('/chat/');
export const getChat      = (userId)   => apiFetch(`/chat/${userId}/`);
export const adminSendMsg = (userId, body) => apiFetch(`/chat/${userId}/`, { method:'POST', body: JSON.stringify({ body }) });
