<template>
  <div class="change-password-form">
    <form @submit.prevent="handleChangePassword">
      <div class="input-group">
        <input type="password" v-model="oldPassword" placeholder="Current Password" required />
      </div>
      <div class="input-group">
        <input type="password" v-model="newPassword" placeholder="New Password" required />
      </div>
      <button type="submit" class="submit-button">Update Password</button>
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
.change-password-form {
  width: 100%;
}

.input-group {
  margin-bottom: 1rem;
}

.change-password-form input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 2px solid #8a9eaf;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Baloo 2', cursive;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.change-password-form input:focus {
  outline: none;
  border-color: #8768c8;
  box-shadow: 0 0 0 3px rgba(135, 104, 200, 0.1);
}

.submit-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #8768c8, #3d5d7e);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(135, 104, 200, 0.3);
  margin-top: 0.5rem;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(135, 104, 200, 0.4);
  background: linear-gradient(135deg, #9b7fd8, #4a6d8e);
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

.success {
  color: #2e7d32;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(46, 125, 50, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(46, 125, 50, 0.3);
  font-size: 0.9rem;
}
</style>
