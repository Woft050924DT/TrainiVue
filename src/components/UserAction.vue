<template>
  <div class="action-bar">
    <button @click="showAddFormLocal" class="add-btn">
      <span class="icon">+</span>
      Thêm User
    </button>
    <div class="search-box">
      <input
        type="text"
        v-model="localSearchQuery"
        placeholder="Tìm kiếm user..."
        class="search-input"
      />
    </div>

    <!-- Modal Add/Edit User -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Thêm User Mới' : 'Chỉnh sửa User' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitForm" class="user-form" novalidate>
          <div class="form-group">
            <label for="name">Tên *</label>
            <input
              id="name"
              type="text"
              v-model="formData.name"
              :class="{ error: errors.name }"
              required
              autocomplete="off"
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              type="email"
              v-model="formData.email"
              :class="{ error: errors.email }"
              required
              autocomplete="off"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="phone">Số điện thoại *</label>
            <input
              id="phone"
              type="tel"
              v-model="formData.phone"
              :class="{ error: errors.phone }"
              required
              autocomplete="off"
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
import { ref, watch } from 'vue';

const props = defineProps({
  showAddForm: Boolean,
  showEditForm: Boolean,
  isSubmitting: Boolean,
  formData: Object,
  errors: Object,
});

const emit = defineEmits([
  'update:showAddForm',
  'update:showEditForm',
  'submit-form',
  'update:formData',
  'update:errors',
  'search-change',
]);

const localSearchQuery = ref('');

// Đồng bộ v-model:formData (dùng trực tiếp prop formData)
// Không cần localFormData nữa, đồng bộ trực tiếp.
// Vue 3 tự xử lý binding 2 chiều.

// Watch localSearchQuery gửi event search-change
watch(localSearchQuery, (val) => {
  emit('search-change', val);
});

function showAddFormLocal() {
  emit('update:showAddForm', true);
}

function closeModal() {
  emit('update:showAddForm', false);
  emit('update:showEditForm', false);
  emit('update:formData', { name: '', email: '', phone: '' });
  emit('update:errors', {});
}

function submitForm() {
  emit('submit-form');
}
</script>

<style scoped>
/* UserAction.vue */
.action-bar {
  position: sticky;
  top: 90px; /* Dưới header 70px + 20px padding */
  z-index: 150;
  background-color: white;
  padding: 12px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.cancel-btn, .submit-btn {
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
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .search-box {
    max-width: none;
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
