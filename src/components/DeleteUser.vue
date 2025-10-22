<template>
  <div>
    <h2>Delete Account</h2>
    <p>This action cannot be undone.</p>
    <form @submit.prevent="deleteUser(authStore.user, password)">
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Delete Account</button>
    </form>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { mapActions, mapState } from 'pinia';

export default {
  data() {
    return {
      password: '',
    };
  },
  computed: {
    ...mapState(useAuthStore, ['error']),
    authStore() {
      return useAuthStore();
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['deleteUser']),
  },
};
</script>
