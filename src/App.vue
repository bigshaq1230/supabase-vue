<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>


      <nav>
        <RouterLink to="/" class="link">Home</RouterLink>
        <RouterLink to="/about" class="link">About</RouterLink>
      </nav>
  </header>
  <br><br><br><br><br>
  <RouterView />
</template>
<style>
  .link {
    margin: 1%
  }
</style>