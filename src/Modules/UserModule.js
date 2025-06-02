// store/modules/UserModule.js
import * as UserAPI from '@/api/UserListAPI.js';

const state = {
  users: [],
  isLoading: false,
  isSubmitting: false,
  currentPage: 1,
  itemsPerPage: 5,
  searchQuery: '',
  showAddForm: false,
  showEditForm: false,
  editingUserId: null,
  errors: {},
  currentUser: null,
  isSidebarVisible: true
};

const getters = {
  // Get all users
  allUsers: (state) => state.users,
  
  // Get filtered users based on search query
  filteredUsers: (state) => {
    if (!state.searchQuery) return state.users;
    const query = state.searchQuery.toLowerCase();
    return state.users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
  },
  
  // Get paginated users
  paginatedUsers: (state, getters) => {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    return getters.filteredUsers.slice(start, end);
  },
  
  // Get total pages
  totalPages: (state, getters) => {
    return Math.ceil(getters.filteredUsers.length / state.itemsPerPage);
  },
  
  // Get loading state
  isLoading: (state) => state.isLoading,
  
  // Get submitting state
  isSubmitting: (state) => state.isSubmitting,
  
  // Get current page
  currentPage: (state) => state.currentPage,
  
  // Get search query
  searchQuery: (state) => state.searchQuery,
  
  // Get form states
  showAddForm: (state) => state.showAddForm,
  showEditForm: (state) => state.showEditForm,
  
  // Get editing user
  editingUser: (state) => {
    if (!state.editingUserId) return null;
    return state.users.find(user => user.id === state.editingUserId);
  },
  
  // Get errors
  errors: (state) => state.errors,
  
  // Get current user
  currentUser: (state) => state.currentUser,
  
  // Get sidebar visibility
  isSidebarVisible: (state) => state.isSidebarVisible
};

const mutations = {
  // Set users
  SET_USERS(state, users) {
    state.users = users;
  },
  
  // Add user
  ADD_USER(state, user) {
    state.users.unshift(user);
  },
  
  // Update user
  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser);
    }
  },
  
  // Remove user
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(user => user.id !== userId);
  },
  
  // Set loading state
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  
  // Set submitting state
  SET_SUBMITTING(state, isSubmitting) {
    state.isSubmitting = isSubmitting;
  },
  
  // Set current page
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },
  
  // Set search query
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query;
    state.currentPage = 1; // Reset to first page when searching
  },
  
  // Set form states
  SET_SHOW_ADD_FORM(state, show) {
    state.showAddForm = show;
  },
  
  SET_SHOW_EDIT_FORM(state, show) {
    state.showEditForm = show;
  },
  
  // Set editing user ID
  SET_EDITING_USER_ID(state, userId) {
    state.editingUserId = userId;
  },
  
  // Set errors
  SET_ERRORS(state, errors) {
    state.errors = errors;
  },
  
  // Clear errors
  CLEAR_ERRORS(state) {
    state.errors = {};
  },
  
  // Reset form state
  RESET_FORM_STATE(state) {
    state.showAddForm = false;
    state.showEditForm = false;
    state.editingUserId = null;
    state.errors = {};
  },
  
  // Set current user
  SET_CURRENT_USER(state, user) {
    state.currentUser = user;
  },
  
  // Set sidebar visibility
  SET_SIDEBAR_VISIBILITY(state, isVisible) {
    state.isSidebarVisible = isVisible;
  }
};

const actions = {
  // Load all users
  async loadUsers({ commit }) {
    commit('SET_LOADING', true);
    try {
      const users = await UserAPI.fetchUsers();
      commit('SET_USERS', users);
      return users;
    } catch (error) {
      console.error('Error loading users:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Add new user
  async addUser({ commit }, userData) {
    commit('SET_SUBMITTING', true);
    commit('CLEAR_ERRORS');
    
    try {
      const newUser = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
      };
      
      const addedUser = await UserAPI.addUser(newUser);
      
      if (!addedUser || !addedUser.id) {
        throw new Error('API did not return valid data');
      }
      
      commit('ADD_USER', addedUser);
      commit('SET_CURRENT_PAGE', 1);
      commit('SET_SEARCH_QUERY', '');
      commit('RESET_FORM_STATE');
      
      return addedUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    } finally {
      commit('SET_SUBMITTING', false);
    }
  },
  
  // Update existing user
  async updateUser({ commit, state }, userData) {
    commit('SET_SUBMITTING', true);
    commit('CLEAR_ERRORS');
    
    try {
      const existingUser = state.users.find(u => u.id === state.editingUserId);
      const updatedUser = {
        id: state.editingUserId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        createdAt: existingUser?.createdAt || new Date().toISOString(),
      };
      
      const result = await UserAPI.updateUser(updatedUser);
      commit('UPDATE_USER', result);
      commit('RESET_FORM_STATE');
      
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      commit('SET_SUBMITTING', false);
    }
  },
  
  // Delete user
  async deleteUser({ commit, getters }, userId) {
    try {
      await UserAPI.deleteUser(userId);
      commit('REMOVE_USER', userId);
      
      // Adjust current page if needed
      const currentPaginatedUsers = getters.paginatedUsers;
      if (currentPaginatedUsers.length === 0 && getters.currentPage > 1) {
        commit('SET_CURRENT_PAGE', getters.currentPage - 1);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  
  // Set search query
  setSearchQuery({ commit }, query) {
    commit('SET_SEARCH_QUERY', query);
  },
  
  // Set current page
  setCurrentPage({ commit }, page) {
    commit('SET_CURRENT_PAGE', page);
  },
  
  // Show add form
  showAddForm({ commit }) {
    commit('RESET_FORM_STATE');
    commit('SET_SHOW_ADD_FORM', true);
  },
  
  // Show edit form
  showEditForm({ commit }, user) {
    commit('RESET_FORM_STATE');
    commit('SET_SHOW_EDIT_FORM', true);
    commit('SET_EDITING_USER_ID', user.id);
  },
  
  // Close modal
  closeModal({ commit }) {
    commit('RESET_FORM_STATE');
  },
  
  // Set validation errors
  setErrors({ commit }, errors) {
    commit('SET_ERRORS', errors);
  },
  
  // Clear validation errors
  clearErrors({ commit }) {
    commit('CLEAR_ERRORS');
  },
  
  // Set current user (from localStorage or login)
  setCurrentUser({ commit }, user) {
    commit('SET_CURRENT_USER', user);
  },
  
  // Initialize current user from localStorage
  initCurrentUser({ commit }) {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        commit('SET_CURRENT_USER', parsed.username);
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
      }
    }
  },
  
  // Logout user
  async logout({ commit }) {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('rememberMe');
      commit('SET_CURRENT_USER', null);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },
  
  // Toggle sidebar visibility
  toggleSidebar({ commit, state }) {
    commit('SET_SIDEBAR_VISIBILITY', !state.isSidebarVisible);
  },
  
  // Set sidebar visibility
  setSidebarVisibility({ commit }, isVisible) {
    commit('SET_SIDEBAR_VISIBILITY', isVisible);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};