// store/modules/ProductModule.js
import * as ProductAPI from '@/api/ProductAPI.js';

const ITEMS_PER_PAGE = 5;

const state = () => ({
  products: [],
  isLoading: false,
  isSubmitting: false,
  currentPage: 1,
  itemsPerPage: ITEMS_PER_PAGE,
  searchQuery: '',
  showAddForm: false,
  showEditForm: false,
  editingProductId: null,
  formErrors: {},
});

const getters = {
  allProducts: (state) => state.products,
  filteredProducts: (state) => {
    if (!state.searchQuery) return state.products;
    const q = state.searchQuery.toLowerCase();
    return state.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  },
  paginatedProducts: (state, getters) => {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    return getters.filteredProducts.slice(start, start + state.itemsPerPage);
  },
  totalPages: (state, getters) =>
    Math.ceil(getters.filteredProducts.length / state.itemsPerPage),
  isLoading: (state) => state.isLoading,
  isSubmitting: (state) => state.isSubmitting,
  currentPage: (state) => state.currentPage,
  searchQuery: (state) => state.searchQuery,
  showAddForm: (state) => state.showAddForm,
  showEditForm: (state) => state.showEditForm,
  editingProduct: (state) => {
    if (!state.editingProductId) return null;
    return state.products.find((p) => p.id === state.editingProductId) || null;
  },
  formErrors: (state) => state.formErrors,
};

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products;
  },
  ADD_PRODUCT(state, product) {
    state.products.unshift(product);
  },
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex((p) => p.id === updatedProduct.id);
    if (index !== -1) state.products.splice(index, 1, updatedProduct);
  },
  REMOVE_PRODUCT(state, productId) {
    state.products = state.products.filter((p) => p.id !== productId);
  },
  SET_LOADING(state, val) {
    state.isLoading = val;
  },
  SET_SUBMITTING(state, val) {
    state.isSubmitting = val;
  },
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query;
    state.currentPage = 1;
  },
  SET_SHOW_ADD_FORM(state, val) {
    state.showAddForm = val;
  },
  SET_SHOW_EDIT_FORM(state, val) {
    state.showEditForm = val;
  },
  SET_EDITING_PRODUCT_ID(state, id) {
    state.editingProductId = id;
  },
  SET_FORM_ERRORS(state, errors) {
    state.formErrors = errors;
  },
  CLEAR_FORM_ERRORS(state) {
    state.formErrors = {};
  },
  RESET_FORM_STATE(state) {
    state.showAddForm = false;
    state.showEditForm = false;
    state.editingProductId = null;
    state.formErrors = {};
  },
};

const actions = {
  async loadProducts({ commit }, apiUrl) {
    commit('SET_LOADING', true);
    try {
      const products = await ProductAPI.fetchProducts(apiUrl);
      commit('SET_PRODUCTS', products);
      return products;
    } catch (error) {
      throw new Error('Không thể tải danh sách sản phẩm: ' + error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addProduct({ commit }, productData) {
    commit('SET_SUBMITTING', true);
    commit('CLEAR_FORM_ERRORS');
    try {
      const newProduct = {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        createdAt: new Date().toISOString(),
      };
      const addedProduct = await ProductAPI.addProduct(newProduct);
      if (!addedProduct || !addedProduct.id)
        throw new Error('API không trả về dữ liệu hợp lệ');
      commit('ADD_PRODUCT', addedProduct);
      commit('SET_CURRENT_PAGE', 1);
      commit('SET_SEARCH_QUERY', '');
      commit('RESET_FORM_STATE');
      return addedProduct;
    } catch (error) {
      commit('SET_FORM_ERRORS', { api: error.message || 'Lỗi thêm sản phẩm' });
      throw error;
    } finally {
      commit('SET_SUBMITTING', false);
    }
  },
  async updateProduct({ commit, state }, productData) {
    if (!state.editingProductId)
      throw new Error('Không xác định được sản phẩm cần cập nhật');
    commit('SET_SUBMITTING', true);
    commit('CLEAR_FORM_ERRORS');
    try {
      const existingProduct = state.products.find(
        (p) => p.id === state.editingProductId
      );
      const updatedProduct = {
        id: state.editingProductId,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        createdAt: existingProduct?.createdAt || new Date().toISOString(),
      };
      const result = await ProductAPI.updateProduct(updatedProduct);
      commit('UPDATE_PRODUCT', result);
      commit('SET_CURRENT_PAGE', 1);
      commit('SET_SEARCH_QUERY', '');
      commit('RESET_FORM_STATE');
      return result;
    } catch (error) {
      commit(
        'SET_FORM_ERRORS',
        { api: error.message || 'Lỗi cập nhật sản phẩm' }
      );
      throw error;
    } finally {
      commit('SET_SUBMITTING', false);
    }
  },
  async deleteProduct({ commit, getters }, productId) {
    try {
      await ProductAPI.deleteProduct(productId);
      commit('REMOVE_PRODUCT', productId);
      const currentPaginatedProducts = getters.paginatedProducts;
      if (currentPaginatedProducts.length === 0 && getters.currentPage > 1) {
        commit('SET_CURRENT_PAGE', getters.currentPage - 1);
      }
      return true;
    } catch (error) {
      throw new Error('Lỗi khi xóa sản phẩm: ' + error.message);
    }
  },
  setSearchQuery({ commit }, query) {
    commit('SET_SEARCH_QUERY', query);
  },
  setCurrentPage({ commit }, page) {
    commit('SET_CURRENT_PAGE', page);
  },
  showAddForm({ commit }) {
    commit('RESET_FORM_STATE');
    commit('SET_SHOW_ADD_FORM', true);
  },
  showEditForm({ commit }, product) {
    commit('RESET_FORM_STATE');
    commit('SET_SHOW_EDIT_FORM', true);
    commit('SET_EDITING_PRODUCT_ID', product.id);
  },
  closeModal({ commit }) {
    commit('RESET_FORM_STATE');
  },
  setFormErrors({ commit }, errors) {
    commit('SET_FORM_ERRORS', errors);
  },
  clearFormErrors({ commit }) {
    commit('CLEAR_FORM_ERRORS');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
