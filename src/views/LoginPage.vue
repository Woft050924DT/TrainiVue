<!-- src/views/LoginPage.vue -->
<template>
  <LoginForm @login-success="handleLoginSuccess" />
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLoginSuccess(payload) {
  if (payload.rememberMe) {
    localStorage.setItem('rememberMe', 'true')
  }
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem(
    'userInfo',
    JSON.stringify({
      username: payload.username,
      loginTime: new Date().toISOString()
    })
  )
  router.push({ name: 'UserList' }) // chuyển hướng đúng cách
}
</script>
