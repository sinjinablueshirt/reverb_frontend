<template>
  <div class="delete-user-form">
    <p class="warning-text">Warning: This action cannot be undone</p>
    <form @submit.prevent="handleDeleteUser">
      <div class="input-group">
        <input type="password" v-model="password" placeholder="Enter your password to confirm" required />
      </div>
      <button type="submit" class="delete-button">Delete My Account</button>
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
.delete-user-form {
  width: 100%;
}

.warning-text {
  color: #c62828;
  font-weight: 600;
  margin: 0 0 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 1rem;
}

.delete-user-form input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 2px solid #d32f2f;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Baloo 2', cursive;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.delete-user-form input:focus {
  outline: none;
  border-color: #b71c1c;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.delete-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  margin-top: 0.5rem;
}

.delete-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4);
  background: linear-gradient(135deg, #b71c1c, #c62828);
}

.error {
  color: #d32f2f;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(211, 47, 47, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(211, 47, 47, 0.3);
  font-size: 0.9rem;
}
</style>
