<template>
  <div class="product-list">
    <div class="table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Mô tả</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="loading">
              <div class="loading-spinner"></div>
              Đang tải dữ liệu...
            </td>
          </tr>
          <tr v-else-if="filteredProducts.length === 0">
            <td colspan="6" class="no-data">
              <div class="no-data-icon">📦</div>
              Không có sản phẩm nào
            </td>
          </tr>
          <tr v-else v-for="product in paginatedProducts" :key="product.id" class="product-row">
            <td>{{ product.id }}</td>
            <td class="product-name">{{ product.name }}</td>
            <td class="product-price">{{ formatPrice(product.price) }}</td>
            <td class="product-description">{{ truncateText(product.description, 50) }}</td>
            <td>{{ formatDate(product.createdAt) }}</td>
            <td class="actions">
              <button @click="$emit('edit-product', product)" class="edit-btn" title="Chỉnh sửa">
                ✏️
              </button>
              <button @click="$emit('delete-product', product.id)" class="delete-btn" title="Xóa">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-btn" title="Trang đầu">
        ««
      </button>
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn" title="Trang trước">
        «
      </button>
      <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn" title="Trang sau">
        »
      </button>
      <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-btn" title="Trang cuối">
        »»
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

import '../../assets/ProductListmodule.css'; 


const props = defineProps({
  isLoading: Boolean,
  filteredProducts: Array,
  paginatedProducts: Array,
  totalPages: Number,
  currentPage: Number
});

const emit = defineEmits(['edit-product', 'delete-product', 'update:current-page']);

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function goToPage(page) {
  if (page < 1 || page > props.totalPages) return;
  emit('update:current-page', page);
}


</script>

<style scoped>

</style>