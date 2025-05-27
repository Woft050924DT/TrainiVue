<template>
    <div class="login-container">
        <header>
            <h1>{{ text }}</h1>
        </header>

        <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
                <label for="username">Email</label>
                <input type="text" id="username" v-model="username" required/>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required/>
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="remember" v-model="rememberMe"/>
                <label for="remember">Remember me</label>
            </div>
            
            <button type="submit">Login</button>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>
    </div>
</template>

<script>
export default {
    name: 'LoginForm',
    
    data() {
        return {
            text: 'Login Form',
            username: '',
            password: '',
            rememberMe: false,
            errorMessage: '',
            isLoading: false
        }
    },
    
    methods: {
        handleSubmit() {
            // Reset error message
            this.errorMessage = '';
            
            // Validation
            if (!this.username.trim()) {
                this.errorMessage = 'Please enter your email';
                return;
            }
            
            if (!this.password.trim()) {
                this.errorMessage = 'Please enter your password';
                return;
            }
            
            // Email validation
            if (!this.isValidEmail(this.username)) {
                this.errorMessage = 'Please enter a valid email address';
                return;
            }
            
            // Set loading state
            this.isLoading = true;
            
            // Simulate API call
            this.performLogin();
        },
        
        async performLogin() {
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Mock login logic - replace with actual API call
                const loginData = {
                    username: this.username,
                    password: this.password,
                    rememberMe: this.rememberMe
                };
                
                console.log('Login data:', loginData);
                
                // Mock successful login
                if (this.username === 'admin@example.com' && this.password === 'password') {
                    this.onLoginSuccess();
                } else {
                    this.errorMessage = 'Invalid email or password';
                }
                
            } catch (error) {
                this.errorMessage = 'Login failed. Please try again.';
                console.error('Login error:', error);
            } finally {
                this.isLoading = false;
            }
        },
        
        onLoginSuccess() {
            // Handle successful login
            console.log('Login successful!');
            
            // Save remember me preference
            if (this.rememberMe) {
                // Note: In real app, use secure storage
                console.log('Remember me enabled');
            }
            
            // Reset form
            this.resetForm();
            
            // Emit success event to parent component
            this.$emit('login-success', {
                username: this.username,
                rememberMe: this.rememberMe
            });
            
            // Or redirect using router
            // this.$router.push('/dashboard');
        },
        
        resetForm() {
            this.username = '';
            this.password = '';
            this.rememberMe = false;
            this.errorMessage = '';
        },
        
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        // Method để xử lý Enter key
        handleKeyPress(event) {
            if (event.key === 'Enter' && !this.isLoading) {
                this.handleSubmit();
            }
        }
    },
    
    mounted() {
        // Focus vào input đầu tiên khi component mount
        this.$nextTick(() => {
            const firstInput = this.$el.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        });
    },
    
    // Define emits for Vue 3 compatibility
    emits: ['login-success'],
    
    // Computed properties
    computed: {
        isFormValid() {
            return this.username.trim() && 
                   this.password.trim() && 
                   this.isValidEmail(this.username);
        },
        
        submitButtonText() {
            return this.isLoading ? 'Logging in...' : 'Login';
        }
    },
    
    // Watch for changes
    watch: {
        username() {
            // Clear error when user starts typing
            if (this.errorMessage) {
                this.errorMessage = '';
            }
        },
        
        password() {
            // Clear error when user starts typing
            if (this.errorMessage) {
                this.errorMessage = '';
            }
        }
    }
}

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

/* Tiêu đề */
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

/* Nhóm input chính */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem; /* Khoảng cách nhỏ giữa label và input */
}

/* Nhóm checkbox */
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
    margin-bottom: 0; /* Loại bỏ margin-bottom mặc định */
}

.checkbox-group label {
    font-weight: 500;
    font-size: 0.95rem;
    color: #666;
    cursor: pointer;
    margin: 0;
}

/* Input text và password */
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

/* Checkbox */
input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #4fc08d;
    cursor: pointer;
    margin: 0;
}

/* Nút submit */
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

/* Error message */
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
</style>