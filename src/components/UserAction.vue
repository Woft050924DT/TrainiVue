<template>
  <div>
    <!-- MainSidebar -->
    <MainSidebar :current-user="currentUser" @logout="handleLogout" />

    <!-- Action bar -->
    <div class="action-bar">
      <button @click="handleShowAddForm" class="add-btn">
        <span class="icon">+</span>
        Thêm User
      </button>
      <div class="search-box">
        <input
          type="text"
          :value="searchQuery"
          @input="handleSearchInput"
          placeholder="Tìm kiếm user..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Modal Add/Edit User -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="handleCloseModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Thêm User Mới' : 'Chỉnh sửa User' }}</h3>
          <button @click="handleCloseModal" class="close-btn">×</button>
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
            <button type="button" @click="handleCloseModal" class="cancel-btn">Hủy</button>
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
      @update:current-page="handlePageChange"
      @edit-user="handleEditUser"
      @delete-user="handleDeleteUser"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { useField, useForm } from 'vee-validate';

import MainSidebar from '../layout/MainSidebar.vue';
import UserList from '../views/User/UserList.vue';

import '../assets/UserActionmodule.css';

const store = useStore();
const router = useRouter();

// Validation schema
const schema = yup.object({
  name: yup.string().required('Tên không được để trống'),
  email: yup.string().required('Email không được để trống').email('Email không đúng định dạng'),
  phone: yup.string()
    .required('Số điện thoại không được để trống')
    .matches(/^(0[3|5|7|8|9])+([0-9]{8,9})$/, 'Số điện thoại không đúng định dạng'),
});

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: schema,
});

const { value: name } = useField('name');
const { value: email } = useField('email');
const { value: phone } = useField('phone');

// Computed properties from store
const filteredUsers = computed(() => store.getters['user/filteredUsers']);
const paginatedUsers = computed(() => store.getters['user/paginatedUsers']);
const totalPages = computed(() => store.getters['user/totalPages']);
const isLoading = computed(() => store.getters['user/isLoading']);
const isSubmitting = computed(() => store.getters['user/isSubmitting']);
const currentPage = computed(() => store.getters['user/currentPage']);
const searchQuery = computed(() => store.getters['user/searchQuery']);
const showAddForm = computed(() => store.getters['user/showAddForm']);
const showEditForm = computed(() => store.getters['user/showEditForm']);
const currentUser = computed(() => store.getters['user/currentUser']);
const isSidebarVisible = computed(() => store.getters['user/isSidebarVisible']);

// Event handlers
function handleShowAddForm() {
  store.dispatch('user/showAddForm');
  resetFormFields();
}

function handleEditUser(user) {
  store.dispatch('user/showEditForm', user);
  setValues({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
}

function handleCloseModal() {
  store.dispatch('user/closeModal');
  resetFormFields();
}

function handleSearchInput(event) {
  store.dispatch('user/setSearchQuery', event.target.value);
}

function handlePageChange(page) {
  store.dispatch('user/setCurrentPage', page);
}

function resetFormFields() {
  resetForm({
    values: {
      name: '',
      email: '',
      phone: '',
    },
  });
}

// Form submission
const onSubmit = handleSubmit(async (values) => {
  try {
    const isAdding = showAddForm.value;
    
    if (isAdding) {
      await store.dispatch('user/addUser', values);
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Thêm user thành công!',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      await store.dispatch('user/updateUser', values);
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật user thành công!',
        timer: 1500,
        showConfirmButton: false,
      });
    }
    
    scrollToTop();
  } catch (error) {
    console.error('Lỗi lưu user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi lưu dữ liệu: ' + (error.message || error),
      confirmButtonText: 'OK',
    });
  }
});

// Delete user
async function handleDeleteUser(userId) {
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
    await store.dispatch('user/deleteUser', userId);
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Xóa user thành công!',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi xóa user',
      confirmButtonText: 'OK',
    });
  }
}

// Logout
async function handleLogout() {
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
  
  if (!result.isConfirmed) return;

  try {
    await store.dispatch('user/logout');
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đăng xuất thành công!',
      timer: 1500,
      showConfirmButton: false,
    });
    router.push('/login');
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi đăng xuất',
      confirmButtonText: 'OK',
    });
  }
}

// Utility functions
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

// Load users and initialize current user on component mount
onMounted(async () => {
  try {
    // Initialize current user from localStorage
    store.dispatch('user/initializeCurrentUser');
    
    // Load users list
    await store.dispatch('user/loadUsers');
  } catch (error) {
    console.error('Lỗi khi tải danh sách user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Lỗi khi tải danh sách user',
      confirmButtonText: 'OK',
    });
  }
});
</script>