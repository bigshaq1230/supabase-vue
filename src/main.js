import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import vue3GoogleLogin from 'vue3-google-login'
const google_api_key = import.meta.env.VITE_GOOGLE_API_KEY
const app = createApp(App)
app.use(router)
app.use(vue3GoogleLogin, {
    clientId: google_api_key
  })
app.mount('#app')
