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
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ««
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          «
        </button>
        <span class="page-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          »
        </button>
        <button
          @click="currentPage = totalPages"
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
import { ref } from 'vue';

// Props nhận từ UserAction.vue
defineProps({
  isSidebarVisible: Boolean,
  isLoading: Boolean,
  filteredUsers: Array,
  paginatedUsers: Array,
  totalPages: Number
});

// Emits gửi sự kiện đến UserAction.vue
defineEmits(['edit-user', 'delete-user']);

// State cho phân trang
const currentPage = ref(1);

// Hàm format ngày
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}
</script>

<style scoped>
.user-management {
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
  padding-top: 10px; /* Adjusted to align with action bar */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f6fa;
}

.list-content {
  flex: 1;
  margin-left: 255px;
  padding: 10px;
  transition: margin-left 0.3s ease;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 0px; /* Removed margin-top for tight integration */
  min-height: calc(100vh - 75px);
}

.list-content.full-width {
  margin-left: 15px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
  max-width: 100%;
}

.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
}

.user-table th {
  background: #f8f9fa;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.user-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e9ecef;
  color: #555;
  font-size: 0.9rem;
}

.user-table tbody tr {
  transition: background-color 0.2s ease;
}

.user-table tbody tr:hover {
  background: #f9fafc;
}

.user-table tbody tr:last-child td {
  border-bottom: none;
}

.user-table th:nth-child(1),
.user-table td:nth-child(1) { width: 60px; }
.user-table th:nth-child(2),
.user-table td:nth-child(2) { width: 160px; }
.user-table th:nth-child(3),
.user-table td:nth-child(3) { width: 220px; }
.user-table th:nth-child(4),
.user-table td:nth-child(4) { width: 130px; }
.user-table th:nth-child(5),
.user-table td:nth-child(5) { width: 110px; }
.user-table th:nth-child(6),
.user-table td:nth-child(6) { width: 110px; }

.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.edit-btn,
.delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.edit-btn {
  background: #ffc107;
  color: #333;
}

.edit-btn:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.loading,
.no-data {
  text-align: center;
  padding: 25px;
  color: #666;
  font-style: italic;
  font-size: 0.85rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.page-btn {
  padding: 6px 10px;
  border: 1px solid #e1e5e9;
  background: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #4fc08d;
  color: white;
  border-color: #4fc08d;
  transform: translateY(-1px);
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  padding: 6px 12px;
  font-weight: 500;
  color: #666;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .user-management {
    padding: 8px;
    padding-top: 8px;
  }

  .list-content {
    margin-left: 10px;
    margin-right: 10px;
    padding: 8px;
    margin-top: 0;
  }

  .user-table {
    font-size: 0.85rem;
  }

  .user-table th,
  .user-table td {
    padding: 6px 8px;
  }

  .user-table th:nth-child(1),
  .user-table td:nth-child(1),
  .user-table th:nth-child(2),
  .user-table td:nth-child(2),
  .user-table th:nth-child(3),
  .user-table td:nth-child(3),
  .user-table th:nth-child(4),
  .user-table td:nth-child(4),
  .user-table th:nth-child(5),
  .user-table td:nth-child(5),
  .user-table th:nth-child(6),
  .user-table td:nth-child(6) {
    width: auto;
  }

  .actions {
    flex-direction: column;
    gap: 4px;
  }

  .edit-btn,
  .delete-btn {
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .pagination {
    gap: 6px;
  }

  .page-btn {
    padding: 5px 8px;
    font-size: 0.8rem;
  }

  .page-info {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
}
</style>