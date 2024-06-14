import { createMemoryHistory, createRouter } from 'vue-router'

import Auth from '../views/Auth.vue'
import Todo from '../views/Todo.vue'

const routes = [
  { path: '/', component: Todo },
  { path: '/login', component: Auth },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
export default router