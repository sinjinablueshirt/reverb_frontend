<template>
  <div>
    <h2>Change Password</h2>
    <form @submit.prevent="handleChangePassword">
      <input type="password" v-model="oldPassword" placeholder="Old Password" required />
      <input type="password" v-model="newPassword" placeholder="New Password" required />
      <button type="submit">Change Password</button>
    </form>
    <div v-if="authStore.error" class="error">{{ authStore.error }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      successMessage: '',
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    }
  },
  methods: {
    async handleChangePassword() {
      this.successMessage = '';
      const authStore = useAuthStore();

      if (!authStore.username) {
        authStore.error = 'You must be logged in to change password';
        return;
      }

      await authStore.changePassword(authStore.username, this.oldPassword, this.newPassword);

      if (!authStore.error) {
        this.successMessage = 'Password changed successfully!';
        this.oldPassword = '';
        this.newPassword = '';
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

.success {
  color: #2e7d32;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #e8f5e9;
  border-radius: 8px;
}
</style>
