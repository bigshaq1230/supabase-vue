<script setup>
import { onMounted, ref } from 'vue'

import { supabase } from './supabase'

const session = ref()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})

</script>

<template>
  <div class="container" style="padding: 50px 0 100px 0">
    <RouterLink to="/">home</RouterLink>
    <button v-if="session"><a >log out</a></button>
    <button v-else><RouterLink to="/login" >log in</RouterLink></button>
    <br>
  <RouterView :session="session"></RouterView>
  </div>
</template>