import axios from 'axios';

const API_PRODUCTS_URL = import.meta.env.VITE_API_PRODUCTS_URL;

// Lấy danh sách sản phẩm từ API
export async function fetchProducts() {
  try {
    const response = await axios.get(API_PRODUCTS_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch products: ' + error.message);
  }
}

// Thêm sản phẩm mới
export async function addProduct(product) {
  try {
    const response = await axios.post(API_PRODUCTS_URL, product);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add product: ' + error.message);
  }
}

// Cập nhật sản phẩm theo id
export async function updateProduct(product) {
  if (!product.id) throw new Error('Product ID is required for update');
  try {
    const response = await axios.put(`${API_PRODUCTS_URL}/${product.id}`, product);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update product: ' + error.message);
  }
}

// Xóa sản phẩm theo id
export async function deleteProduct(productId) {
  if (!productId) throw new Error('Product ID is required for delete');
  try {
    await axios.delete(`${API_PRODUCTS_URL}/${productId}`);
    return true;
  } catch (error) {
    throw new Error('Failed to delete product: ' + error.message);
  }
}
