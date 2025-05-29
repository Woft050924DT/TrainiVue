<template>
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
        @click="changePage(1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ««
      </button>
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        «
      </button>
      
      <span class="page-info">
        Trang {{ currentPage }} / {{ totalPages }}
      </span>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        »
      </button>
      <button 
        @click="changePage(totalPages)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        »»
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick } from 'vue';

const props = defineProps({
  users: Array,
  isLoading: Boolean,
  searchQuery: String,
  currentPage: Number,
  itemsPerPage: Number,
  isSidebarVisible: Boolean,
});

const emit = defineEmits(['edit-user', 'delete-user', 'update:currentPage']);

// Filter users by search query
const filteredUsers = computed(() => {
  if (!props.searchQuery) return props.users;

  const query = props.searchQuery.toLowerCase();
  return props.users.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.phone.includes(query)
  );
});

// Total pages after filter
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / props.itemsPerPage));

// Users to show on current page
const paginatedUsers = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}

// Change page
function changePage(page) {
  if (page < 1) page = 1;
  else if (page > totalPages.value) page = totalPages.value;
  emit('update:currentPage', page);
}

// Scroll to top (called by parent after adding user)
function scrollToTop() {
  nextTick(() => {
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Expose scrollToTop to parent
defineExpose({ scrollToTop });
</script>
<style scoped>
 /* UserList.vue */
.list-content {
  flex: 1;
  margin-left: 250px; /* Đồng bộ với sidebar rộng 250px */
  padding: 20px;
  transition: margin-left 0.3s ease;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
  min-height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.list-content.full-width {
  margin-left: 0;
}

/* Bảng */
.table-container {
  background: white;
  border-radius: 10px;
  overflow-x: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  max-height: calc(100vh - 90px - 60px);
  overflow-y: auto;
  max-width: 1200px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.user-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.95rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.user-table td {
  padding: 12px;
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

/* Độ rộng cột */
.user-table th:nth-child(1), .user-table td:nth-child(1) { width: 80px; }
.user-table th:nth-child(2), .user-table td:nth-child(2) { width: 200px; }
.user-table th:nth-child(3), .user-table td:nth-child(3) { width: 250px; }
.user-table th:nth-child(4), .user-table td:nth-child(4) { width: 150px; }
.user-table th:nth-child(5), .user-table td:nth-child(5) { width: 150px; }
.user-table th:nth-child(6), .user-table td:nth-child(6) { width: 150px; }

/* Hành động */
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
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

/* Loading & no-data */
.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
  font-size: 1rem;
}

/* Phân trang */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  max-width: 1200px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
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
  padding: 8px 16px;
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .list-content {
    margin-left: 0;
    padding: 15px;
  }

  .table-container {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
  }

  .user-table {
    font-size: 0.9rem;
    table-layout: auto;
  }

  .user-table th, .user-table td {
    padding: 8px 6px;
  }

  .user-table th:nth-child(1), .user-table td:nth-child(1),
  .user-table th:nth-child(2), .user-table td:nth-child(2),
  .user-table th:nth-child(3), .user-table td:nth-child(3),
  .user-table th:nth-child(4), .user-table td:nth-child(4),
  .user-table th:nth-child(5), .user-table td:nth-child(5),
  .user-table th:nth-child(6), .user-table td:nth-child(6) {
    width: auto;
  }

  .actions {
    flex-direction: column;
    gap: 4px;
  }

  .pagination {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>