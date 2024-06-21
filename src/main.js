import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)
app.use(router)
app.use(vue3GoogleLogin, {
    clientId: '703900486616-4o7kadp330cgd98b203luh1q3n0cnte1.apps.googleusercontent.com'
  })
app.mount('#app')
