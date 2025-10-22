<template>
  <div>
    <h2>User</h2>
    <div v-if="user">
      <p>Welcome, {{ user }}</p>
      <button @click="logout">Logout</button>
      <hr />
      <h3>Change Password</h3>
      <form @submit.prevent="changePassword(user, oldPassword, newPassword)">
        <input type="password" v-model="oldPassword" placeholder="Old Password" required />
        <input type="password" v-model="newPassword" placeholder="New Password" required />
        <button type="submit">Change Password</button>
      </form>
      <hr />
      <h3>Delete Account</h3>
      <form @submit.prevent="deleteAccount(user, deletePassword)">
        <input type="password" v-model="deletePassword" placeholder="Password" required />
        <button type="submit">Delete Account</button>
      </form>
      <div v-if="error">{{ error }}</div>
    </div>
    <div v-else>
      <p>You are not logged in.</p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { mapActions, mapState } from 'pinia'

export default {
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      deletePassword: ''
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user', 'error'])
  },
  methods: {
    ...mapActions(useAuthStore, ['logout', 'changePassword', 'deleteUser']),
    deleteAccount() {
      this.deleteUser(this.user, this.deletePassword)
    }
  }
}
</script>
