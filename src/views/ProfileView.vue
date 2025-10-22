<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="authStore.user">
      <ChangePassword />
      <hr />
      <DeleteUser />
    </div>
    <div v-else>
      <p>You must be logged in to view this page.</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import ChangePassword from '@/components/ChangePassword.vue';
import DeleteUser from '@/components/DeleteUser.vue';

const authStore = useAuthStore();
</script>
