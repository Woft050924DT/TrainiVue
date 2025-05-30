import { createStore } from 'vuex';

export default createStore({
  state: {
    users: [],
    isLoading: false,
    currentUser: '',
    loginTime: '',
  },
  mutations: {
    setUsers(state, users) {
      state.users = users;
    },
    addUser(state, user) {
      state.users.unshift(user);
    },
    updateUser(state, updatedUser) {
      const index = state.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
      }
    },
    deleteUser(state, userId) {
      state.users = state.users.filter(u => u.id !== userId);
    },
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    setCurrentUser(state, username) {
      state.currentUser = username;
    },
    setLoginTime(state, loginTime) {
      state.loginTime = loginTime;
    }
  },
  actions: {
    async loadUsers({ commit }) {
      commit('setLoading', true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // giả lập delay
        const users = [
          { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0123456789', createdAt: '2024-01-15T10:30:00Z' },
          { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0987654321', createdAt: '2024-01-16T14:20:00Z' },
          { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0369258147', createdAt: '2024-01-17T09:15:00Z' },
          { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0741852963', createdAt: '2024-01-18T16:45:00Z' },
          { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0582639741', createdAt: '2024-01-19T11:30:00Z' },
          { id: 6, name: 'Hà Thành Đạt', email: 'htdat2711@gmail.com', phone: '0987654321', createdAt: '2024-01-20T12:00:00Z' },
        ];
        commit('setUsers', users);
      } catch (error) {
        console.error('Lỗi khi tải danh sách user:', error);
      } finally {
        commit('setLoading', false);
      }
    },
    async addUser({ commit }, user) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // giả lập delay
      commit('addUser', user);
    },
    async updateUser({ commit }, user) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // giả lập delay
      commit('updateUser', user);
    },
    async deleteUser({ commit }, userId) {
      await new Promise(resolve => setTimeout(resolve, 500)); // giả lập delay
      commit('deleteUser', userId);
    }
  },
  getters: {
    usersFiltered: (state) => (searchQuery) => {
      if (!searchQuery) return state.users;
      const q = searchQuery.toLowerCase();
      return state.users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }
  }
});
