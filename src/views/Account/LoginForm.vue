<template>
  <div class="login-container">
    <header>
      <h1>{{ text }}</h1>
    </header>

    <form @submit.prevent="onSubmit" class="login-form">
      <div class="form-group">
        <label for="username">Email</label>
        <input
          type="text"
          id="username"
          v-model="username"
          :class="{ error: usernameError }"
          autocomplete="username"
        />
        <span v-if="usernameError" class="error-message">{{ usernameError }}</span>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          :class="{ error: passwordError }"
          autocomplete="current-password"
        />
        <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
      </div>

      <div class="checkbox-group">
        <input type="checkbox" id="remember" v-model="rememberMe" />
        <label for="remember">Remember me</label>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Đang đăng nhập...' : 'Login' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { defineEmits } from 'vue';

import '../../assets/Login.css'; 
const emit = defineEmits(['login-success']);

const text = ref('Login Form');
const errorMessage = ref('');

// Use Vee-Validate for form handling
const schema = yup.object({
  username: yup.string().required('Vui lòng nhập email').email('Vui lòng nhập đúng định dạng email'),
  password: yup.string().required('Vui lòng nhập mật khẩu'),
  rememberMe: yup.boolean(),
});

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
});

const { value: username, errorMessage: usernameError } = useField('username');
const { value: password, errorMessage: passwordError } = useField('password');
const { value: rememberMe } = useField('rememberMe');

function onLoginSuccess() {
  emit('login-success', {
    username: username.value,
    rememberMe: rememberMe.value,
  });
  resetForm();
  errorMessage.value = '';
}

async function performLogin(values) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const validCredentials = [
      { username: 'admin@example.com', password: 'password' },
      { username: 'htdat2711@gmail.com', password: '2711dt.com' },
      { username: 'adminexample@gmail.com', password: 'password' },
    ];

    const isValid = validCredentials.some(
      (cred) => cred.username === values.username && cred.password === values.password
    );

    if (isValid) {
      onLoginSuccess();
    } else {
      errorMessage.value = 'Email hoặc mật khẩu không đúng';
    }
  } catch {
    errorMessage.value = 'Đăng nhập thất bại. Vui lòng thử lại.';
  }
}

const onSubmit = handleSubmit(performLogin);
</script>

