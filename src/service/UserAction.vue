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
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { useField, useForm } from 'vee-validate';

import MainSidebar from '../layout/MainSidebar.vue';
import UserList from '../views/user/UserList.vue';

import * as UserAPI from '@/api/UserListAPI.js'; // import API

import '../assets/UserActionmodule.css'
const router = useRouter();

// State quản lý UI
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isSidebarVisible = ref(true);

const showAddForm = ref(false);
const showEditForm = ref(false);
const isSubmitting = ref(false);
const editingUserId = ref(null);

const users = ref([]);
const isLoading = ref(false);

const currentUser = ref(null); // Giả lập hoặc lấy từ localStorage nếu cần

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

// Computed lọc & phân trang
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.phone.includes(q)
  );
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value));

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

// Load user từ API
async function loadUsers() {
  try {
    isLoading.value = true;
    users.value = await UserAPI.fetchUsers();
  } catch (error) {
    console.error('Lỗi khi tải danh sách user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Lỗi khi tải danh sách user',
      confirmButtonText: 'OK',
    });
  } finally {
    isLoading.value = false;
  }
}

// Thêm user mới gọi API
async function addUser(values) {
  const newUser = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    createdAt: new Date().toISOString(),
  };
  try {
    isSubmitting.value = true;
    const addedUser = await UserAPI.addUser(newUser);
    users.value.unshift(addedUser);
    currentPage.value = 1;
    searchQuery.value = '';
    await nextTick();
    scrollToTop();
  } finally {
    isSubmitting.value = false;
  }
}

// Cập nhật user gọi API
async function updateUser(values) {
  const updatedUser = {
    id: editingUserId.value,
    name: values.name,
    email: values.email,
    phone: values.phone,
    createdAt: users.value.find(u => u.id === editingUserId.value)?.createdAt || new Date().toISOString(),
  };
  try {
    isSubmitting.value = true;
    const userFromAPI = await UserAPI.updateUser(updatedUser);
    // Cập nhật trong users list
    const idx = users.value.findIndex(u => u.id === editingUserId.value);
    if (idx !== -1) users.value[idx] = userFromAPI;
  } finally {
    isSubmitting.value = false;
  }
}

// Xử lý submit form
const onSubmit = handleSubmit(async (values) => {
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
  }
});

// Xóa user gọi API
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
    await UserAPI.deleteUser(userId);
    users.value = users.value.filter(u => u.id !== userId);

    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Xóa user thành công!',
      timer: 1500,
      showConfirmButton: false,
    });

    // Điều chỉnh trang nếu cần
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
    currentUser.value = parsed.username;
  }
  loadUsers();
});
</script>



