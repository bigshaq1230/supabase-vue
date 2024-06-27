<script setup>
import { supabase } from '@/supabase';


const callback = (response) => {
  handleSignInWithGoogle(response)
}
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

</script>

<template>
  <GoogleLogin :callback="callback"/>
</template>
