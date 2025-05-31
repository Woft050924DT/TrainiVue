<template>
  <div class="user-management">
    <!-- Main content -->
    <div :class="['list-content', { 'full-width': !isSidebarVisible }]">
      <!-- User List Table -->
      <div class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="loading">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="6" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td class="actions">
                <button @click="$emit('edit-user', user)" class="edit-btn">Sửa</button>
                <button @click="$emit('delete-user', user.id)" class="delete-btn">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ««
      </button>
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        «
      </button>
      <span class="page-info">
        Trang {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        »
      </button>
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        »»
      </button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import '@/assets/UserListmodule.css'; 
// Props nhận từ UserAction.vue
const props = defineProps({
  isSidebarVisible: Boolean,
  isLoading: Boolean,
  filteredUsers: Array,
  paginatedUsers: Array,
  totalPages: Number,
  currentPage:Number
});

// Emits gửi sự kiện đến UserAction.vue
const emit = defineEmits(['edit-user', 'delete-user','update:current-page']);



// Hàm format ngày
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}
function goToPage(page) {
  if (page < 1 || page > props.totalPages) return;
  emit('update:current-page', page);
}
</script>

