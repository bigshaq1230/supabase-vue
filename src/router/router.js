import { createMemoryHistory, createRouter } from 'vue-router'

import Auth from '../views/Auth.vue'
import Todo from '../views/Todo.vue'

const routes = [
  { path: '/', component: Todo,props:true },
  { path: '/login', component: Auth,props:true },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
export default router