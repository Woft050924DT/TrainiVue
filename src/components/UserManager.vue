<template>
  <div class="user-management">
    <!-- Main Content -->
    <div class="main-content">
      <MainSidebar :visible="isSidebarVisible" />
      <div :class="['content-wrapper', { 'full-width': !isSidebarVisible }]">
        <user-action
          :showAddForm="showAddForm"
          :showEditForm="showEditForm"
          :isSubmitting="isSubmitting"
          :formData="formData"
          :errors="errors"
          @update:showAddForm="showAddForm = $event"
          @update:showEditForm="showEditForm = $event"
          @submit-form="submitForm"
          @search-change="handleSearchChange"
        />
        <user-list
          ref="userList"
          :key="users.length"
          :users="users"
          :isLoading="isLoading"
          :searchQuery="searchQuery"
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          :isSidebarVisible="isSidebarVisible"
          @edit-user="editUser"
          @delete-user="deleteUser"
          @update:currentPage="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import Swal from 'sweetalert2';
import MainSidebar from './MainSidebar.vue';
import UserList from './UserList.vue';
import UserAction from './UserAction.vue';

const users = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const showAddForm = ref(false);
const showEditForm = ref(false);
const isSubmitting = ref(false);

const editingUserId = ref(null);

const formData = ref({ name: '', email: '', phone: '' });
const errors = ref({});

async function loadUsers() {
  isLoading.value = true;
  try {
    // Giả lập API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    users.value = [
      { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0123456789', createdAt: '2024-01-15T10:30:00Z' },
      // ... các user khác
    ];
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone);
}

function validateForm() {
  errors.value = {};
  if (!formData.value.name.trim()) {
    errors.value.name = 'Tên không được để trống';
  }
  if (!formData.value.email.trim()) {
    errors.value.email = 'Email không được để trống';
  } else if (!isValidEmail(formData.value.email)) {
    errors.value.email = 'Email không đúng định dạng';
  }
  if (!formData.value.phone.trim()) {
    errors.value.phone = 'Số điện thoại không được để trống';
  } else if (!isValidPhone(formData.value.phone)) {
    errors.value.phone = 'Số điện thoại không đúng định dạng';
  }
  return Object.keys(errors.value).length === 0;
}

function resetForm() {
  formData.value = { name: '', email: '', phone: '' };
  errors.value = {};
  editingUserId.value = null;
}

function closeModal() {
  showAddForm.value = false;
  showEditForm.value = false;
  resetForm();
}

async function addUser() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newUser = {
    id: Date.now(),
    ...formData.value,
    createdAt: new Date().toISOString(),
  };
  users.value.unshift(newUser);
  currentPage.value = 1;
  searchQuery.value = '';
  await Swal.fire({
    icon: 'success',
    title: 'Thành công!',
    text: 'Thêm user thành công!',
    timer: 1500,
    showConfirmButton: false,
  });
  await nextTick();
  if (userListRef.value?.scrollToTop) {
    userListRef.value.scrollToTop();
  }
}

async function updateUser() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = users.value.findIndex(u => u.id === editingUserId.value);
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      ...formData.value,
    };
  }
  searchQuery.value = '';
  await Swal.fire({
    icon: 'success',
    title: 'Thành công!',
    text: 'Cập nhật user thành công!',
    timer: 1500,
    showConfirmButton: false,
  });
}

async function submitForm() {
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    if (showAddForm.value) {
      await addUser();
    } else if (showEditForm.value) {
      await updateUser();
    }
    closeModal();
  } catch (error) {
    console.error(error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi lưu dữ liệu',
    });
  } finally {
    isSubmitting.value = false;
  }
}

function editUser(user) {
  formData.value = { name: user.name, email: user.email, phone: user.phone };
  editingUserId.value = user.id;
  showEditForm.value = true;
}

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
    await new Promise(resolve => setTimeout(resolve, 500));
    users.value = users.value.filter(u => u.id !== userId);

    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Xóa user thành công!',
      timer: 1500,
      showConfirmButton: false,
    });

    // Điều chỉnh currentPage nếu cần
    const filteredLength = users.value.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.phone.includes(searchQuery.value)
    ).length;

    const totalPages = Math.ceil(filteredLength / itemsPerPage.value);

    if (currentPage.value > totalPages && totalPages > 0) {
      currentPage.value = totalPages;
    } else if (totalPages === 0) {
      currentPage.value = 1;
    }
  } catch (error) {
    console.error(error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi xóa user',
    });
  }
}

function handleSearchChange(value) {
  searchQuery.value = value;
  currentPage.value = 1;
}

const userListRef = ref(null);

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management {
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  padding-top: 90px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f6fa;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, #4fc08d, #3a9d6e);
  color: #ffffff;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 200;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: space-between;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.toggle-sidebar-btn {
  background: transparent;
  border: 1px solid #ffffff;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.1s ease;
}

.toggle-sidebar-btn:hover {
  background-color: #ffffff;
  color: #4fc08d;
  transform: translateY(-1px);
}

.icon-menu::before {
  content: "☰";
}

.icon-close::before {
  content: "✕";
}

.main-content {
  display: flex;
  gap: 20px;
}

.content-wrapper {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.content-wrapper.full-width {
  margin-left: 0;
}

@media (max-width: 768px) {
  .user-management {
    padding: 10px;
    padding-top: 100px;
  }

  .header {
    height: 60px;
    padding: 0 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .user-info {
    flex-direction: column;
    gap: 10px;
  }

  .content-wrapper {
    margin-left: 0;
  }
}
</style>