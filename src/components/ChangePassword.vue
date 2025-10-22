<template>
  <div>
    <h2>Change Password</h2>
    <form @submit.prevent="changePassword(authStore.user, oldPassword, newPassword)">
      <input type="password" v-model="oldPassword" placeholder="Old Password" required />
      <input type="password" v-model="newPassword" placeholder="New Password" required />
      <button type="submit">Change Password</button>
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
      oldPassword: '',
      newPassword: '',
    };
  },
  computed: {
    ...mapState(useAuthStore, ['error']),
    authStore() {
      return useAuthStore();
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['changePassword']),
  },
};
</script>
