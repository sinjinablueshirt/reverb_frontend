<template>
  <div>
    <h2>Delete Account</h2>
    <p>This action cannot be undone.</p>
    <form @submit.prevent="handleDeleteUser">
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit" class="delete-button">Delete Account</button>
    </form>
    <div v-if="authStore.error" class="error">{{ authStore.error }}</div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      password: '',
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    }
  },
  methods: {
    async handleDeleteUser() {
      const authStore = useAuthStore();

      if (!authStore.username) {
        authStore.error = 'You must be logged in to delete your account';
        return;
      }

      const confirmed = confirm(
        'Are you sure you want to delete your account?\n\n' +
        'This will permanently delete:\n' +
        '• Your account\n' +
        '• All your compositions\n' +
        '• All your comments\n\n' +
        'This action cannot be undone.'
      );

      if (!confirmed) return;

      await authStore.deleteUser(authStore.username, this.password);

      if (!authStore.error) {
        // Redirect to home page after successful deletion
        this.router.push('/');
      }
    },
  },
};
</script>

<style scoped>
.error {
  color: #d32f2f;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #ffe6f0;
  border-radius: 8px;
}

.delete-button {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
}

.delete-button:hover {
  background: linear-gradient(135deg, #b71c1c 0%, #c62828 100%);
}
</style>
