<template>
  
  

  <div class="product-action">

    <MainSidebar />
    <!-- Action bar -->
    <div class="action-bar">
      <button @click="showAddForm = true" class="add-btn">
        <span class="icon">+</span> Thêm Sản Phẩm
      </button>
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm sản phẩm..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Thêm Sản Phẩm Mới' : 'Chỉnh sửa Sản Phẩm' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
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
            <button type="button" @click="closeModal" class="cancel-btn">Hủy</button>
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Đang lưu...' : (showAddForm ? 'Thêm' : 'Cập nhật') }}
            </button>
          </div>
        </form>
      </div>
    </div>


    <ProductList
      :is-loading="isLoading"
      :filtered-products="filteredProducts"
      :paginated-products="paginatedProducts"
      :total-pages="totalPages"
      :current-page="currentPage"
      @update:current-page="currentPage = $event"
      @edit-product="editProduct"
      @delete-product="deleteProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { useField, useForm } from 'vee-validate';

import MainSidebar from '@/layout/MainSidebar.vue';

import ProductList from '../views/Product/ProducList.vue';
import * as ProductAPI from '@/api/ProductAPI.js';

const showAddForm = ref(false);
const showEditForm = ref(false);
const isSubmitting = ref(false);
const editingProductId = ref(null);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const products = ref([]);
const isLoading = ref(false);

// Validation schema
const schema = yup.object({
  name: yup.string().required('Tên sản phẩm không được để trống'),
  price: yup.number().required('Giá không được để trống').min(0, 'Giá phải là số dương'),
});

const { handleSubmit, errors, resetForm, setValues } = useForm({ validationSchema: schema });
const { value: name } = useField('name');
const { value: price } = useField('price');
const { value: description } = useField('description');

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const q = searchQuery.value.toLowerCase();
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

function editProduct(product) {
  showAddForm.value = false;
  showEditForm.value = true;
  editingProductId.value = product.id;
  setValues({
    name: product.name,
    price: product.price,
    description: product.description || '',
  });
}

function resetAll() {
  resetForm({
    values: {
      name: '',
      price: '',
      description: '',
    },
  });
  editingProductId.value = null;
}

function closeModal() {
  showAddForm.value = false;
  showEditForm.value = false;
  resetAll();
}

async function loadProducts() {
  isLoading.value = true;
  try {
    products.value = await ProductAPI.fetchProducts();
  } catch (error) {
    console.error('Lỗi khi tải danh sách sản phẩm:', error);
    await Swal.fire('Lỗi', 'Lỗi khi tải danh sách sản phẩm', 'error');
  } finally {
    isLoading.value = false;
  }
}

async function addProduct(values) {
  isSubmitting.value = true;
  try {
    const newProduct = {
      name: values.name,
      price: values.price,
      description: values.description,
      createdAt: new Date().toISOString(),
    };
    const added = await ProductAPI.addProduct(newProduct);
    
    if (!added || !added.id) {
      throw new Error('API không trả về dữ liệu hợp lệ');
    }
    
    products.value.unshift(added);
    currentPage.value = 1;
    searchQuery.value = '';
    await nextTick();
    scrollToTop();
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    await Swal.fire('Lỗi', 'Thêm sản phẩm thất bại', 'error');
    throw error;
  } finally {
    isSubmitting.value = false;
  }
}

async function updateProduct(values) {
  isSubmitting.value = true;
  try {
    const updatedProduct = {
      id: editingProductId.value,
      name: values.name,
      price: values.price,
      description: values.description,
      createdAt: products.value.find(p => p.id === editingProductId.value)?.createdAt || new Date().toISOString(),
    };
    const updated = await ProductAPI.updateProduct(updatedProduct);
    const idx = products.value.findIndex(p => p.id === editingProductId.value);
    if (idx !== -1) products.value[idx] = updated;
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    await Swal.fire('Lỗi', 'Cập nhật sản phẩm thất bại', 'error');
    throw error;
  } finally {
    isSubmitting.value = false;
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const isAdding = showAddForm.value;
    if (isAdding) {
      await addProduct(values);
    } else {
      await updateProduct(values);
    }
    closeModal();
    await Swal.fire('Thành công', isAdding ? 'Thêm sản phẩm thành công' : 'Cập nhật sản phẩm thành công', 'success');
  } catch (error) {
    console.error('Lỗi lưu sản phẩm:', error);
  }
});

async function deleteProduct(productId) {
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
    await ProductAPI.deleteProduct(productId);
    products.value = products.value.filter(p => p.id !== productId);
    await Swal.fire('Thành công', 'Xóa sản phẩm thành công', 'success');

    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    await Swal.fire('Lỗi', 'Có lỗi xảy ra khi xóa sản phẩm', 'error');
  }
}

function scrollToTop() {
  const container = document.querySelector('.table-container');
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(() => {
  loadProducts();
});
</script>

