<template>
  <div class="container" style="padding: 50px 0 100px 0">
    <RouterLink to="/">home</RouterLink>

    <button v-if="session" @click="logout">log out</button>
    <button v-else>
      <RouterLink to="/login">log in</RouterLink>
    </button>

    <br>
    <RouterView :session="session"></RouterView>
    <button @click="logSession">a</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { supabase } from './supabase';

const session = ref(null);

const logout = async () => {
  await supabase.auth.signOut();
  session.value = null;
};
const initializeAuth = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting session:', error);
    return;
  }

  session.value = data.session;

  supabase.auth.onAuthStateChange((event, newSession) => {
    session.value = newSession;
  });
};

onMounted( () => initializeAuth() )

const logSession = () => {
  console.log(session.value);
};
</script>
