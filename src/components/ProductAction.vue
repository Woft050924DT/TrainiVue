<template>
  <div class="product-action">
    <MainSidebar />
    
    <div class="action-bar">
      <button @click="handleShowAddForm" class="add-btn">
        <span class="icon">+</span> Thêm Sản Phẩm
      </button>
      <div class="search-box">
        <input
          type="text"
          :value="searchQuery"
          @input="handleSearchInput"
          placeholder="Tìm kiếm sản phẩm..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="handleCloseModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Thêm Sản Phẩm Mới' : 'Chỉnh sửa Sản Phẩm' }}</h3>
          <button @click="handleCloseModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="onSubmit" class="product-form" novalidate>
          <div class="form-group">
            <label for="name">Tên sản phẩm *</label>
            <input
              type="text"
              id="name"
              v-model="name"
              :class="{ error: errors.name }"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="price">Giá *</label>
            <input
              type="number"
              id="price"
              v-model.number="price"
              :class="{ error: errors.price }"
              required
            />
            <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
          </div>

          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea id="description" v-model="description"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="handleCloseModal" class="cancel-btn">Hủy</button>
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Đang lưu...' : (showAddForm ? 'Thêm' : 'Cập nhật') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ProductList
      :is-loading="isLoading"
      :paginated-products="paginatedProducts"
      :total-pages="totalPages"
      :current-page="currentPage"
      @update:current-page="handlePageChange"
      @edit-product="handleEditProduct"
      @delete-product="handleDeleteProduct"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { useField, useForm } from 'vee-validate';

import MainSidebar from '../layout/MainSidebar.vue';
import ProductList from '../views/Product/ProducList.vue'; 

const store = useStore();

const schema = yup.object({
  name: yup.string().required('Tên sản phẩm không được để trống'),
  price: yup.number().required('Giá không được để trống').min(0, 'Giá phải là số dương'),
});

const { handleSubmit, errors, resetForm, setValues } = useForm({ validationSchema: schema });
const { value: name } = useField('name');
const { value: price } = useField('price');
const { value: description } = useField('description');

const paginatedProducts = computed(() => store.getters['product/paginatedProducts']);
const totalPages = computed(() => store.getters['product/totalPages']);
const isLoading = computed(() => store.getters['product/isLoading']);
const isSubmitting = computed(() => store.getters['product/isSubmitting']);
const currentPage = computed(() => store.getters['product/currentPage']);
const searchQuery = computed(() => store.getters['product/searchQuery']);
const showAddForm = computed(() => store.getters['product/showAddForm']);
const showEditForm = computed(() => store.getters['product/showEditForm']);

function handleShowAddForm() {
  store.dispatch('product/showAddForm');
  resetFormFields();
}

function handleEditProduct(product) {
  store.dispatch('product/showEditForm', product);
  setValues({
    name: product.name,
    price: product.price,
    description: product.description || '',
  });
}

function handleCloseModal() {
  store.dispatch('product/closeModal');
  resetFormFields();
}

function handleSearchInput(event) {
  store.dispatch('product/setSearchQuery', event.target.value);
}

function handlePageChange(page) {
  store.dispatch('product/setCurrentPage', page);
}

function resetFormFields() {
  resetForm({
    values: {
      name: '',
      price: '',
      description: '',
    },
  });
}

const onSubmit = handleSubmit(async (values) => {
  try {
    if (showAddForm.value) {
      await store.dispatch('product/addProduct', values);
      await Swal.fire('Thành công', 'Thêm sản phẩm thành công', 'success');
    } else {
      await store.dispatch('product/updateProduct', values);
      await Swal.fire('Thành công', 'Cập nhật sản phẩm thành công', 'success');
    }
    scrollToTop();
  } catch (error) {
    await Swal.fire('Lỗi', error.message || 'Có lỗi xảy ra khi lưu sản phẩm', 'error');
  }
});

async function handleDeleteProduct(productId) {
  const result = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
  });

  if (!result.isConfirmed) return;

  try {
    await store.dispatch('product/deleteProduct', productId);
    await Swal.fire('Thành công', 'Xóa sản phẩm thành công', 'success');
  } catch (error) {
    await Swal.fire('Lỗi', error.message || 'Có lỗi xảy ra khi xóa sản phẩm', 'error');
  }
}

function scrollToTop() {
  const container = document.querySelector('.table-container');
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

onMounted(() => {
  store.dispatch('product/loadProducts');
});
</script>
