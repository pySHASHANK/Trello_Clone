import axios from 'axios';

// We create an 'axios instance'. 
// This makes sure every request we send remembers the base URL of our backend API!
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', 
});

// -- API helper functions --

export const fetchBoards = async () => {
  const response = await api.get('/boards');
  return response.data;
};

export const fetchBoardDetails = async (boardId) => {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
};

export const createBoard = async (title, backgroundClass) => {
  const response = await api.post('/boards', { title, backgroundClass });
  return response.data;
};

export const deleteBoard = async (boardId) => {
  const response = await api.delete(`/boards/${boardId}`);
  return response.data;
};

export const createList = async (title, boardId) => {
  const response = await api.post('/lists', { title, boardId });
  return response.data;
};

export const deleteList = async (listId) => {
  const response = await api.delete(`/lists/${listId}`);
  return response.data;
};

export const createCard = async (title, listId) => {
  const response = await api.post('/cards', { title, listId });
  return response.data;
};

export const reorderLists = async (items) => {
  const response = await api.put('/lists/reorder', { items });
  return response.data;
};

export const reorderCards = async (items) => {
  const response = await api.put('/cards/reorder', { items });
  return response.data;
};

export const updateList = async (listId, data) => {
  const response = await api.put(`/lists/${listId}`, data);
  return response.data;
};

export const updateCard = async (cardId, data) => {
  const response = await api.patch(`/cards/${cardId}`, data);
  return response.data;
};

export const deleteCard = async (cardId) => {
  const response = await api.delete(`/cards/${cardId}`);
  return response.data;
};

export const toggleCardLabel = async (cardId, labelId) => {
  const response = await api.post(`/cards/${cardId}/labels`, { labelId });
  return response.data;
};

export const toggleCardMember = async (cardId, memberId) => {
  const response = await api.post(`/cards/${cardId}/members`, { memberId });
  return response.data;
};

export const createChecklistItem = async (cardId, title) => {
  const response = await api.post(`/cards/${cardId}/checklists`, { title });
  return response.data;
};

export const toggleChecklistItem = async (itemId, isCompleted) => {
  const response = await api.patch(`/cards/checklist-items/${itemId}`, { isCompleted });
  return response.data;
};

export const uploadAttachment = async (cardId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/uploads/cards/${cardId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export default api;
