<template>
  <nav class="sidebar">
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="/profile">Profile</router-link>
      </li>
      <li v-if="authStore.user">
        <button @click="authStore.logout()">Logout</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  padding: 1rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 1rem;
}

a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

a.router-link-exact-active {
  color: #42b983;
}

button {
  background: none;
  border: none;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
}
</style>
