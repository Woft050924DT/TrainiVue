<template>
  <div>
    <!-- MainSidebar -->
    <MainSidebar :current-user="currentUser" @logout="logout" />

    <!-- Action bar -->
    <div class="action-bar">
      <button @click="showAddForm = true" class="add-btn">
        <span class="icon">+</span>
        Thêm User
      </button>
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm user..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Modal Add/Edit User -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Thêm User Mới' : 'Chỉnh sửa User' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="onSubmit" class="user-form" novalidate>
          <div class="form-group">
            <label for="name">Tên *</label>
            <input
              type="text"
              id="name"
              v-model="name"
              :class="{ error: errors.name }"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              v-model="email"
              :class="{ error: errors.email }"
              required
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label for="phone">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              v-model="phone"
              :class="{ error: errors.phone }"
              required
            />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Hủy</button>
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Đang lưu...' : (showAddForm ? 'Thêm' : 'Cập nhật') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- UserList -->
    <UserList
      :is-sidebar-visible="isSidebarVisible"
      :is-loading="isLoading"
      :filtered-users="filteredUsers"
      :paginated-users="paginatedUsers"
      :total-pages="totalPages"
      :current-page="currentPage"
      @update:current-page="currentPage = $event"
      @edit-user="editUser"
      @delete-user="deleteUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { useField, useForm } from 'vee-validate';
import axios from 'axios';

import MainSidebar from '../components/MainSidebar.vue';
import UserList from '../components/UserList.vue';

const router = useRouter();
const store = useStore();
const user= ref([])
// State quản lý UI
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isSidebarVisible = ref(true);

const showAddForm = ref(false);
const showEditForm = ref(false);
const isSubmitting = ref(false);
const editingUserId = ref(null);

// Computed properties lấy data từ Vuex store
const users = computed(() => store.state.users);
const isLoading = computed(() => store.state.isLoading);
const currentUser = computed(() => store.state.currentUser);

// Định nghĩa schema validation yup
const schema = yup.object({
  name: yup.string().required('Tên không được để trống'),
  email: yup.string().required('Email không được để trống').email('Email không đúng định dạng'),
  phone: yup.string()
    .required('Số điện thoại không được để trống')
    .matches(/^(0[3|5|7|8|9])+([0-9]{8,9})$/, 'Số điện thoại không đúng định dạng'),
});

// Khởi tạo vee-validate useForm
const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: schema,
});

const { value: name } = useField('name');
const { value: email } = useField('email');
const { value: phone } = useField('phone');

// Computed properties lọc và phân trang sử dụng Vuex getter
const filteredUsers = computed(() => {
  return store.getters.usersFiltered(searchQuery.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

function editUser(user) {
  showAddForm.value = false;
  showEditForm.value = true;
  editingUserId.value = user.id;
  setValues({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
}

function resetAll() {
  resetForm({
    values: {
      name: '',
      email: '',
      phone: '',
    },
  });
  editingUserId.value = null;
}

function closeModal() {
  showAddForm.value = false;
  showEditForm.value = false;
  resetAll();
}

// Thêm user mới sử dụng Vuex action
async function addUser(values) {
  const newUser = {
    id: Date.now(),
    name: values.name,
    email: values.email,
    phone: values.phone,
    createdAt: new Date().toISOString(),
  };

  await store.dispatch('addUser', newUser);
  currentPage.value = 1;
  searchQuery.value = '';
  await nextTick();
  scrollToTop();
}

// Cập nhật user hiện tại sử dụng Vuex action
async function updateUser(values) {
  const updatedUser = {
    id: editingUserId.value,
    name: values.name,
    email: values.email,
    phone: values.phone,
    createdAt: users.value.find(u => u.id === editingUserId.value)?.createdAt || new Date().toISOString(),
  };

  await store.dispatch('updateUser', updatedUser);
}

// Xử lý submit form, chỉ chạy khi form hợp lệ
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    if (showAddForm.value) {
      await addUser(values);
    } else {
      await updateUser(values);
    }
    closeModal();
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: showAddForm.value ? 'Thêm user thành công!' : 'Cập nhật user thành công!',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error('Lỗi khi lưu user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi lưu dữ liệu: ' + (error.message || error),
      confirmButtonText: 'OK',
    });
  } finally {
    isSubmitting.value = false;
  }
});

// Load danh sách user sử dụng Vuex action
async function loadUsers() {
  try {
    await store.dispatch('loadUsers');
  } catch (error) {
    console.error('Lỗi khi tải danh sách user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Lỗi khi tải danh sách user',
      confirmButtonText: 'OK',
    });
  }
}

// Xóa user sử dụng Vuex action
async function deleteUser(userId) {
  const result = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc chắn muốn xóa user này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
  });
  if (!result.isConfirmed) return;

  try {
    await store.dispatch('deleteUser', userId);
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Xóa user thành công!',
      timer: 1500,
      showConfirmButton: false,
    });
    // Điều chỉnh trang hiện tại nếu cần
    if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error('Lỗi khi xóa user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi xóa user',
      confirmButtonText: 'OK',
    });
  }
}

// Đăng xuất
async function logout() {
  const result = await Swal.fire({
    title: 'Xác nhận đăng xuất',
    text: 'Bạn có chắc chắn muốn đăng xuất?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4fc08d',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Hủy',
  });
  if (result.isConfirmed) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('rememberMe');
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đăng xuất thành công!',
      timer: 1500,
      showConfirmButton: false,
    });
    router.push('/login');
  }
}

// Cuộn trang lên đầu bảng khi thêm/sửa xong
function scrollToTop() {
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// Watch search query reset trang
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Lifecycle load data + lấy user info
onMounted(() => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const parsed = JSON.parse(userInfo);
    store.commit('setCurrentUser', parsed.username);
    store.commit('setLoginTime', new Date(parsed.loginTime).toLocaleString('vi-VN'));
  }
  loadUsers();
});
</script>


<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 20px;
  margin-left: 270px;
  margin-right: 20px;
  margin-top: 90px;
}

.add-btn {
  background: #4fc08d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #3a9d6e;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-btn .icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.search-box {
  flex: 1;
  max-width: 300px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: #f9fafc;
}

.search-input:focus {
  outline: none;
  border-color: #4fc08d;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(79, 192, 141, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.user-form {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: #f9fafc;
}

.form-group input:focus {
  outline: none;
  border-color: #4fc08d;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(79, 192, 141, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.submit-btn {
  background: #4fc08d;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #3a9d6e;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    margin-left: 20px;
  }

  .search-box {
    max-width: none;
  }

  .modal {
    width: 95%;
    margin: 10px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>