<template>
  <div class="user-management">
    <!-- Header với logout -->
    <header class="header">
      <div class="header-content">
        <h1>Quản lý User</h1>
        <div class="user-info">
          <button @click="toggleSidebar" class="toggle-sidebar-btn">
            <i :class="isSidebarVisible ? 'icon-close' : 'icon-menu'"></i>
            {{ isSidebarVisible ? 'Ẩn Dashboard' : 'Hiện Dashboard' }}
          </button>
          <span>Xin chào, {{ currentUser }}</span>
          <button @click="logout" class="logout-btn">Đăng xuất</button>
        </div>
      </div>
    </header>

    <!-- Main content: Sidebar và User List -->
    <div class="main-content">
      <!-- Sidebar menu -->
      <nav :class="['sidebar', { 'hidden': !isSidebarVisible }]">
        <ul class="menu-list">
          <li>
            <router-link to="/dashboard" class="menu-item" active-class="active" exact>
              <i class="icon-dashboard"></i>
              Dashboard
            </router-link>
          </li>
          <li class="menu-group">
            <span class="menu-group-title">MERCHANT</span>
            <ul>
              <li>
                <router-link to="/merchants" class="menu-item" active-class="active">
                  <i class="icon-merchant"></i>
                  Hồ sơ Merchants
                  <i class="icon-chevron-right"></i>
                </router-link>
              </li>
              <li>
                <router-link to="/money-fees" class="menu-item" active-class="active">
                  <i class="icon-money"></i>
                  Quản lý Tiền & Phí
                  <i class="icon-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </li>
          <li class="menu-group">
            <span class="menu-group-title">QUẢN LÝ GIAO DỊCH</span>
            <ul>
              <li>
                <router-link to="/transactions" class="menu-item" active-class="active">
                  <i class="icon-transaction"></i>
                  Danh sách giao dịch
                  <i class="icon-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </li>
          <li class="menu-group">
            <span class="menu-group-title">ĐỐI SOÁT - QUYẾT TOÁN</span>
            <ul>
              <li>
                <router-link to="/reconcile-merchant" class="menu-item" active-class="active">
                  <i class="icon-reconcile"></i> Đối soát merchant <i class="icon-chevron-right"></i>
                </router-link>
              </li>
              <li>
                <router-link to="/settle-merchant" class="menu-item" active-class="active">
                  <i class="icon-check"></i> Quyết toán merchant <i class="icon-chevron-right"></i>
                </router-link>
              </li>
              <li>
                <router-link to="/merchant-debt" class="menu-item" active-class="active">
                  <i class="icon-debt"></i> Công nợ merchant <i class="icon-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </li>
          <li class="menu-group">
            <span class="menu-group-title">QUẢN LÝ MÁY POS</span>
            <ul>
              <li>
                <router-link to="/device-import" class="menu-item" active-class="active">
                  <i class="icon-device"></i> Quản lý nhập máy <i class="icon-chevron-right"></i>
                </router-link>
              </li>
              <li>
                <router-link to="/pos-management" class="menu-item" active-class="active">
                  <i class="icon-pos"></i> Quản lý POS <i class="icon-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </li>
          <li class="menu-group">
            <span class="menu-group-title">QUẢN LÝ TÀI KHOẢN</span>
            <ul>
              <li>
                <router-link to="/gpay-account" class="menu-item" active-class="active">
                  <i class="icon-account"></i> Tài khoản Gpay <i class="icon-chevron-right"></i>
                </router-link>
              </li>
              <li>
                <router-link to="/merchant-account" class="menu-item" active-class="active">
                  <i class="icon-account"></i> Tài khoản Merchant <i class="icon-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- User List Section -->
      <div :class="['list-content', { 'full-width': !isSidebarVisible }]">
        <!-- Action buttons -->
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
                  <button @click="editUser(user)" class="edit-btn">Sửa</button>
                  <button @click="deleteUser(user.id)" class="delete-btn">Xóa</button>
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

    <!-- Modal Add/Edit User -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Thêm User Mới' : 'Chỉnh sửa User' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitForm" class="user-form">
          <div class="form-group">
            <label for="name">Tên *</label>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name" 
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
              v-model="formData.email"
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
              v-model="formData.phone"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const isSidebarVisible = ref(true);

// State Management
const users = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const currentUser = ref('');
const loginTime = ref('');

// Modal states
const showAddForm = ref(false);
const showEditForm = ref(false);
const isSubmitting = ref(false);
const editingUserId = ref(null);

// Form data
const formData = ref({
  name: '',
  email: '',
  phone: ''
});

// Validation errors
const errors = ref({});

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.phone.includes(query)
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

// Methods
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8,9})$/;
  return phoneRegex.test(phone);
}

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    phone: ''
  };
  errors.value = {};
  editingUserId.value = null;
}

function closeModal() {
  showAddForm.value = false;
  showEditForm.value = false;
  resetForm();
}

async function submitForm() {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    if (showAddForm.value) {
      await addUser();
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Thêm user thành công!',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      await updateUser();
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật user thành công!',
        timer: 1500,
        showConfirmButton: false
      });
    }
    closeModal();
    await loadUsers();
  } catch (error) {
    console.error('Lỗi khi lưu user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi lưu dữ liệu',
      confirmButtonText: 'OK'
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function loadUsers() {
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    users.value = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0987654321',
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0369258147',
        createdAt: '2024-01-17T09:15:00Z'
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0741852963',
        createdAt: '2024-01-18T16:45:00Z'
      },
      {
        id: 5,
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0582639741',
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 6,
        name: 'Hà Thành Đạt',
        email: 'htdat2711@gmail.com',
        phone: '0987654321',
        createdAt: '2024-01-20T12:00:00Z'
      }
    ];
  } catch (error) {
    console.error('Lỗi khi tải danh sách user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Lỗi khi tải danh sách user',
      confirmButtonText: 'OK'
    });
  } finally {
    isLoading.value = false;
  }
}

async function addUser() {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newUser = {
    id: Date.now(),
    ...formData.value,
    createdAt: new Date().toISOString()
  };

  users.value.unshift(newUser); // Thêm user mới vào đầu danh sách
  console.log('Đã thêm user:', newUser);

  // Cuộn trang đến đầu bảng để đảm bảo user mới hiển thị trên màn hình
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.scrollTo({
      top: 0,
      behavior: 'smooth' // Cuộn mượt mà
    });
  }

  // Đảm bảo trang đầu tiên được hiển thị để user mới xuất hiện ngay lập tức
  currentPage.value = 1;
}

async function updateUser() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const index = users.value.findIndex(u => u.id === editingUserId.value);
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      ...formData.value,
      createdAt: users.value[index].createdAt
    };
    console.log('Đã cập nhật user:', users.value[index]);
  }
}

function editUser(user) {
  formData.value = {
    name: user.name,
    email: user.email,
    phone: user.phone
  };
  editingUserId.value = user.id;
  showEditForm.value = true;
}

async function deleteUser(userId) {
  if (!confirm('Bạn có chắc chắn muốn xóa user này?')) return;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    users.value = users.value.filter(u => u.id !== userId);
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Xóa user thành công!',
      timer: 1500,
      showConfirmButton: false
    });
    
    if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error('Lỗi khi xóa user:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Có lỗi xảy ra khi xóa user',
      confirmButtonText: 'OK'
    });
  }
}

async function logout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('rememberMe');
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đăng xuất thành công!',
      timer: 1500,
      showConfirmButton: false
    });
    router.push('/login');
  }
}

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(() => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const parsed = JSON.parse(userInfo);
    currentUser.value = parsed.username;
    loginTime.value = new Date(parsed.loginTime).toLocaleString('vi-VN');
  }
  
  loadUsers();
});
</script>

<style scoped>
/* Reset cơ bản để đảm bảo bố cục chuẩn */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Root container */
.user-management {
  min-height: 100vh; /* Đảm bảo chiều cao tối thiểu full viewport */
  max-width: 100%; /* Đảm bảo full chiều rộng */
  margin: 0 auto;
  padding: 20px;
  padding-top: 90px; /* Để tránh che khuất bởi header cố định */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f6fa; /* Màu nền nhẹ cho toàn bộ trang */
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px; /* Chiều cao header */
  background: linear-gradient(135deg, #4fc08d, #3a9d6e);
  color: #ffffff;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 200; /* Luôn nằm trên sidebar */
  border-radius: 0;
}

/* Nội dung header */
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
  letter-spacing: 0.5px;
}

/* User Info */
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

/* Sidebar (Dashboard) */
.sidebar {
  position: fixed;
  top: 0; /* Kéo dài từ mép trên cùng */
  left: 0;
  width: 250px;
  height: 100vh; /* Chiếm toàn bộ chiều cao */
  background: linear-gradient(180deg, #2a2a3f 0%, #1e1e2f 100%); /* Gradient nhẹ */
  color: #b0b8d1;
  padding: 20px 15px;
  overflow-y: auto;
  border-radius: 0 10px 10px 0;
  z-index: 100; /* Nằm dưới header */
  transition: transform 0.3s ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar.hidden {
  transform: translateX(-100%); /* Ẩn sidebar bằng cách dịch chuyển ra ngoài */
}

/* Logo */
.logo {
  height: 50px;
  width: auto;
  object-fit: contain;
  margin-bottom: 20px;
  display: block;
}

/* Menu List */
.menu-list,
.menu-list ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

/* Menu Group Title */
.menu-group-title {
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 1px;
  color: #e0f2f1;
  margin: 15px 0 10px 8px;
  display: block;
  opacity: 0.7;
}

/* Menu Item */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e0f2f1;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-weight: 500;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #3a3f5a;
  color: #4fc08d;
}

.menu-item.active {
  background-color: #4fc08d;
  color: white;
}

/* Icon mũi tên ở cuối menu item */
.icon-chevron-right::before {
  content: "›";
  font-weight: bold;
  color: #4fc08d;
}

/* Danh sách con menu cách lề trái */
.menu-group ul li {
  margin-left: 10px;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
}

/* User List Section */
.list-content {
  flex: 1;
  margin-left: 250px; /* Căn lề trái để tránh che khuất sidebar */
  padding: 20px;
  transition: margin-left 0.3s ease; /* Hiệu ứng chuyển đổi mượt mà */
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
  min-height: calc(100vh - 90px); /* Đảm bảo chiều cao tối thiểu */
}

.list-content.full-width {
  margin-left: 0; /* Khi sidebar ẩn, căn lề trái về 0 */
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
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

/* Table */
.table-container {
  background: white;
  border-radius: 10px;
  overflow-x: auto; /* Đảm bảo bảng có thể cuộn ngang nếu cần */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
}

.user-table {
  width: 100%;
  border-collapse: separate; /* Để hỗ trợ border-spacing */
  border-spacing: 0;
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
  border-bottom: none; /* Bỏ đường viền dưới cho hàng cuối */
}

/* Cải thiện hiển thị các cột */
.user-table th:nth-child(1),
.user-table td:nth-child(1) {
  width: 80px; /* Cột ID */
}

.user-table th:nth-child(2),
.user-table td:nth-child(2) {
  width: 200px; /* Cột Tên */
}

.user-table th:nth-child(3),
.user-table td:nth-child(3) {
  width: 250px; /* Cột Email */
}

.user-table th:nth-child(4),
.user-table td:nth-child(4) {
  width: 150px; /* Cột Số điện thoại */
}

.user-table th:nth-child(5),
.user-table td:nth-child(5) {
  width: 150px; /* Cột Ngày tạo */
}

.user-table th:nth-child(6),
.user-table td:nth-child(6) {
  width: 150px; /* Cột Thao tác */
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn,
.delete-btn {
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

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
  font-size: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
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

/* Modal */
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

/* Form */
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

/* Form Actions */
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

/* Responsive */
@media (max-width: 768px) {
  .user-management {
    padding: 10px;
    padding-top: 100px; /* Tăng padding-top trên mobile để tránh header */
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

  .sidebar {
    position: static; /* Bỏ fixed trên mobile */
    width: 100%;
    height: auto;
    border-radius: 10px;
    margin-bottom: 20px;
    top: 0; /* Không cần top trên mobile */
  }

  .sidebar.hidden {
    display: none; /* Ẩn hoàn toàn trên mobile */
  }

  .list-content {
    margin-left: 0; /* Không cần margin trên mobile */
    padding: 15px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .search-box {
    max-width: none;
  }

  .user-table {
    font-size: 0.9rem;
  }

  .user-table th,
  .user-table td {
    padding: 8px 6px;
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
    width: auto; /* Bỏ chiều rộng cố định trên mobile */
  }

  .actions {
    flex-direction: column;
    gap: 4px;
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