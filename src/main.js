import { createApp } from 'vue';
import App from './App.vue';
import store from './Store';
import router from './Router';
const app = createApp(App);

app.use(router);
app.use(store);

app.mount('#app');
