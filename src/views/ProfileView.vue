<template>
  <div class="profile-view">
    <div class="background-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    <div class="content">
      <div v-if="authStore.user" class="profile-container">
        <!-- Settings Cards -->
        <div class="settings-grid">
          <!-- Change Password Card -->
          <div class="settings-card">
            <h2>Change Password</h2>
            <p class="card-description">Update your password to keep your account secure</p>
            <ChangePassword />
          </div>

          <!-- Delete Account Card -->
          <div class="settings-card danger-card">
            <h2>Delete Account</h2>
            <p class="card-description">Permanently remove your account and all data</p>
            <DeleteUser />
          </div>
        </div>
      </div>
      <div v-else class="login-prompt">
        <h2>Access Restricted</h2>
        <p>You must be logged in to view your profile.</p>
        <button @click="$router.push('/login')" class="login-button">Log In</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import ChangePassword from '@/components/ChangePassword.vue';
import DeleteUser from '@/components/DeleteUser.vue';

const authStore = useAuthStore();

const getInitials = (username) => {
  if (!username) return '?';
  return username.substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.profile-view {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.background-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #8768c8, #a94a66);
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, #feb503, #a94a66);
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #3d5d7e, #8768c8);
  top: 45%;
  right: 12%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.settings-card {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid transparent;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)),
    linear-gradient(135deg, #8768c8, #3d5d7e);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: 0 4px 16px rgba(61, 93, 126, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(61, 93, 126, 0.2);
}

.danger-card {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)),
    linear-gradient(135deg, #a94a66, #d32f2f);
}

.settings-card h2 {
  margin: 0 0 0.75rem;
  color: #3d5d7e;
  font-size: 1.75rem;
}

.card-description {
  color: #5a6c7d;
  margin: 0 0 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

.login-prompt {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 2px solid transparent;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)),
    linear-gradient(135deg, #feb503, #8768c8);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: 0 8px 32px rgba(61, 93, 126, 0.15);
}

.login-prompt h2 {
  color: #3d5d7e;
  margin: 0 0 1rem;
  font-size: 1.75rem;
}

.login-prompt p {
  color: #5a6c7d;
  margin: 0 0 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

.login-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #8768c8, #a94a66);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(135, 104, 200, 0.3);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(135, 104, 200, 0.4);
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
