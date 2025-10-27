<template>
  <div>
    <!-- Hamburger Button -->
    <button class="hamburger-btn" @click="isOpen = !isOpen" :class="{ active: isOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Overlay -->
    <div class="overlay" v-if="isOpen" @click="isOpen = false"></div>

    <!-- Sidebar -->
    <nav class="sidebar" :class="{ open: isOpen }">
      <ul>
        <li>
          <router-link to="/" @click="isOpen = false">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            <span>Home</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile" @click="isOpen = false">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
            </svg>
            <span>Profile</span>
          </router-link>
        </li>
        <li v-if="authStore.user">
          <button @click="handleLogout">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { RouterLink, useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  isOpen.value = false;
};
</script>

<style scoped>
/* Hamburger Button */
.hamburger-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(135, 104, 200, 0.4);
  transition: all 0.3s ease;
}

.hamburger-btn:hover {
  background: linear-gradient(135deg, #a94a66 0%, #feb503 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(169, 74, 102, 0.5);
}

.hamburger-btn span {
  display: block;
  width: 24px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 245, 232, 0.95) 100%);
  padding: 90px 1.5rem 1.5rem;
  border-right: 2px solid #8a9eaf;
  box-shadow: 4px 0 20px rgba(61, 93, 126, 0.2);
  z-index: 1000;
  transition: left 0.3s ease;
  backdrop-filter: blur(10px);
  overflow-y: auto;
}

.sidebar.open {
  left: 0;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 0.75rem;
}

a,
button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-decoration: none;
  color: #3d5d7e;
  font-weight: 600;
  padding: 14px 18px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: transparent;
  background-image: none;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  text-align: left;
  box-shadow: none;
}

.icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

a:hover,
button:hover {
  background: linear-gradient(135deg, rgba(135, 104, 200, 0.15) 0%, rgba(169, 74, 102, 0.15) 100%);
  border-color: #8768c8;
  color: #8768c8;
  transform: translateX(4px);
  box-shadow: none;
}

a.router-link-exact-active {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  border-color: #8768c8;
  box-shadow: 0 3px 10px rgba(135, 104, 200, 0.4);
}

a.router-link-exact-active:hover {
  background: linear-gradient(135deg, #a94a66 0%, #feb503 100%);
  border-color: #a94a66;
  box-shadow: 0 4px 14px rgba(169, 74, 102, 0.5);
}

button:hover {
  box-shadow: none !important;
}
</style>
