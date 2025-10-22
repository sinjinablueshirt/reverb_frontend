<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login(username, password)">
      <input type="text" v-model="username" placeholder="Username" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { mapActions, mapState } from 'pinia'

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    ...mapState(useAuthStore, ['error'])
  },
  methods: {
    ...mapActions(useAuthStore, ['login'])
  }
}
</script>
