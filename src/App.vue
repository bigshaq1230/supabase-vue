<template>
  <div class="container" style="padding: 50px 0 100px 0">
    <RouterLink to="/">home</RouterLink>

    <button v-if="session" @click="logout">log out</button>
    <button v-else>
      <RouterLink to="/login">log in</RouterLink>
    </button>

    <br>
    <RouterView :session="session"></RouterView>
  </div>
</template>

<script setup>

import { googleOneTap } from "vue3-google-login"
import { onMounted, ref } from 'vue';
import { supabase } from './supabase';

async function handleSignInWithGoogle(response) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.credential,
  })
  if (error) {
    console.error(error.message)
  }
  console.log(data.user.id)
}


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

onMounted( () => {
  initializeAuth()
  if (!session.value) {
    googleOneTap()
    .then((response) => {
      handleSignInWithGoogle(response)
    })
    .catch((error) => {
      console.log("Handle the error", error)
    })
  }
})


</script>
