import { createRouter, createWebHistory } from 'vue-router'
import LoginForm  from '@/components/LoginForm.vue'
import UserList from '@/components/UserList.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: {
      requiresGuest: true //Chi cho phép truy cập khi chưa đăng nhập
    }
  },

  {
    path: '/users',
    name: 'UserList',
    component: UserList,
    meta: {
      requiresAuth: true //Chỉ cho phép truy cập khi đã đăng nhập
    }
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login' //Chuyển hướng về trang đăng nhập nếu không tìm thấy route
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  console.log(`Navigating to ${to.name}, isLoggedIn: ${isLoggedIn}`);
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('Redirecting to Login');
    next({ name: 'Login' });
    return;
  }
  if (to.meta.requiresGuest && isLoggedIn) {
    console.log('Redirecting to UserList');
    next({ name: 'UserList' });
    return;
  }
  next();
});

export default router
