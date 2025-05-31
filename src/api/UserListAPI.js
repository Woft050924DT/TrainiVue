// UserListAPI.js
import axios from 'axios';
import { createUserDTO } from '../models/dto/UserDTO.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Chuẩn hóa dữ liệu user từ API thành DTO
function normalizeUser(data) {
  return createUserDTO({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    createdAt: data.createdAt,
  });
}

// Lấy danh sách users
export async function fetchUsers() {
  try {
    const res = await axios.get(API_BASE_URL);
    return res.data.map(normalizeUser);
  } catch (error) {
    throw new Error('Failed to fetch users: ' + error.message);
  }
}

// Thêm user mới
export async function addUser(userData) {
  try {
    const res = await axios.post(API_BASE_URL, userData);
    return normalizeUser(res.data);
  } catch (error) {
    throw new Error('Failed to add user: ' + error.message);
  }
}

// Cập nhật user
export async function updateUser(userData) {
  if (!userData.id) throw new Error('User ID is required for update');
  try {
    const res = await axios.put(`${API_BASE_URL}/${userData.id}`, userData);
    return normalizeUser(res.data);
  } catch (error) {
    throw new Error('Failed to update user: ' + error.message);
  }
}

// Xóa user
export async function deleteUser(userId) {
  if (!userId) throw new Error('User ID is required for delete');
  try {
    await axios.delete(`${API_BASE_URL}/${userId}`);
    return true;
  } catch (error) {
    throw new Error('Failed to delete user: ' + error.message);
  }
}
