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

<style scoped>
.login-container {
    width: 400px;
    padding: 2.5rem 3rem;
    margin: 50px auto;
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
}

.login-container header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
    color: #2c3e50;
}

/* Form */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.checkbox-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
}

/* Label */
.form-group label {
    font-weight: 600;
    font-size: 1rem;
    color: #555;
    margin-bottom: 0;
}

.checkbox-group label {
    font-weight: 500;
    font-size: 0.95rem;
    color: #666;
    cursor: pointer;
    margin: 0;
}

input[type="text"],
input[type="password"] {
    padding: 14px 16px;
    font-size: 1rem;
    border-radius: 8px;
    border: 2px solid #e1e5e9;
    transition: all 0.3s ease;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    background-color: #fafbfc;
}

input[type="text"]:focus,
input[type="password"]:focus {
    border-color: #4fc08d;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(79, 192, 141, 0.1);
}

input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #4fc08d;
    cursor: pointer;
    margin: 0;
}

button[type="submit"] {
    margin-top: 1rem;
    padding: 14px 0;
    background-color: #4fc08d;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

button[type="submit"]:hover {
    background-color: #3a9d6e;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 192, 141, 0.3);
}

button[type="submit"]:active {
    transform: translateY(0);
}

.error {
    color: #e74c3c;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 0.5rem;
    font-weight: 500;
}

/* Responsive */
@media (max-width: 480px) {
    .login-container {
        width: 90vw;
        padding: 2rem 1.5rem;
        margin: 30px auto;
    }
   
    .form-group {
        gap: 0.4rem;
    }
   
    input[type="text"],
    input[type="password"] {
        padding: 12px 14px;
        font-size: 0.95rem;
    }
   
    button[type="submit"] {
        padding: 12px 0;
        font-size: 1rem;
    }
}

/* Hover effects cho inputs */
input[type="text"]:hover,
input[type="password"]:hover {
    border-color: #c8d6e5;
}

/* Animation cho form khi load */
.login-container {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
input.error {
    border-color: #e74c3c;
}

.error-message {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 0.3rem;
    display: block;
}
</style>