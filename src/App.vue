<template>
  <div id="app">
    <!-- Header với logo - chỉ hiển thị khi ở trang login -->
    <header v-if="showHeader" class="app-header">
      <img class="logo" src="https://gpos-cms.dev.g-pay.vn/media/logos/logo.svg" alt="Logo" />
    </header>

    <!-- Main content area -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Chỉ hiển thị header khi ở trang login
const showHeader = computed(() => {
  return route.name === 'Login';
});
</script>

<style >
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header styles */
.app-header {
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

/* Main content */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    padding: 15px 0;
  }
  
  .logo {
    height: 45px;
  }
  
  .main-content {
    padding: 15px;
  }
}

/* Animation cho page transitions */
.router-enter-active,
.router-leave-active {
  transition: opacity 0.3s ease;
}

.router-enter-from,
.router-leave-to {
  opacity: 0;
}
</style>