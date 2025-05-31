<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <img src="https://gpos-cms.dev.g-pay.vn/media/logos/logo.svg" alt="Logo" class="logo-img" />
        
      </div>
      <div class="header-content">
        <button @click="toggleSidebar" class="toggle-sidebar-btn">
          <i :class="isSidebarVisible ? 'icon-close' : 'icon-menu'"></i>
          {{ isSidebarVisible ? 'Ẩn Dashboard' : 'Hiện Dashboard' }}
        </button>

        <div class="user-info">
          <span>Xin chào, {{ currentUser }}</span>
          <button @click="logout" class="logout-btn">Đăng xuất</button>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <nav :class="['sidebar', { hidden: !isSidebarVisible }]">
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
      <router-link to="/users" class="menu-item" active-class="active">
        <i class="icon-transaction"></i>
        Người dùng
        <i class="icon-chevron-right"></i>
      </router-link>
    </li>
            <li>
              <router-link to="/money-fees" class="menu-item" active-class="active">
                <i class="icon-money"></i>
                Quản lý Tiền &amp; Phí
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
          </ul>
        </li>

        <li class="menu-group">
          <span class="menu-group-title">QUẢN LÝ GIAO DỊCH</span>
          <ul>
            <li>
             <router-link to="/product-list" class="menu-item" active-class="active">
                <i class="icon-transaction"></i>
               Danh Mục Sản Phẩm
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
                <i class="icon-reconcile"></i>
                Đối soát merchant
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
            <li>
              <router-link to="/settle-merchant" class="menu-item" active-class="active">
                <i class="icon-check"></i>
                Quyết toán merchant
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
            <li>
              <router-link to="/merchant-debt" class="menu-item" active-class="active">
                <i class="icon-debt"></i>
                Công nợ merchant
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
          </ul>
        </li>

        <li class="menu-group">
          <span class="menu-group-title">QUẢN LÝ MÁY POS</span>
          <ul>
            <li>
              <router-link to="/device-import" class="menu-item" active-class="active">
                <i class="icon-device"></i>
                Quản lý nhập máy
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
            <li>
              <router-link to="/pos-management" class="menu-item" active-class="active">
                <i class="icon-pos"></i>
                Quản lý POS
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
          </ul>
        </li>

        <li class="menu-group">
          <span class="menu-group-title">QUẢN LÝ TÀI KHOẢN</span>
          <ul>
            <li>
              <router-link to="/gpay-account" class="menu-item" active-class="active">
                <i class="icon-account"></i>
                Tài khoản Gpay
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
            <li>
              <router-link to="/merchant-account" class="menu-item" active-class="active">
                <i class="icon-account"></i>
                Tài khoản Merchant
                <i class="icon-chevron-right"></i>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const isSidebarVisible = ref(true);
const currentUser = ref('Nguyễn Văn A');

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

async function logout() {
  const result = await Swal.fire({
    title: 'Xác nhận đăng xuất',
    text: 'Bạn có chắc chắn muốn đăng xuất?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4fc08d',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Hủy'
  });

  if (result.isConfirmed) {
    // Xóa dữ liệu localStorage hoặc token đăng nhập
    localStorage.clear();

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
</script>

<style scoped>
/* MainSidebar.vue */
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

.sidebar {
  position: fixed;
  top: 70px; /* Dưới header */
  left: 0;
  width: 250px;
  height: calc(100vh - 70px);
  background: linear-gradient(180deg, #2a2a3f 0%, #1e1e2f 100%);
  color: #b0b8d1;
  padding: 20px 15px;
  overflow-y: auto;
  border-radius: 0 10px 10px 0;
  z-index: 100;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar.hidden {
  transform: translateX(-100%);
}

.menu-list, .menu-list ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

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

.icon-chevron-right::before {
  content: "›";
  font-weight: bold;
  color: #4fc08d;
}

.menu-group ul li {
  margin-left: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    height: 60px;
    padding: 0 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .user-info {
    flex-direction: column;
    gap: 10px;
  }

  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  .sidebar.hidden {
    display: none;
  }
}
</style>
