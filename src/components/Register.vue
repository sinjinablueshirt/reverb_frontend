<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="icon-wrapper">
          <span class="music-icon">✨</span>
        </div>
        <h2>Join Reverb</h2>
        <p class="subtitle">Upload your compositions and receive valuable feedback</p>
      </div>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="input-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="username"
            placeholder="Choose a username"
            required
          />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            placeholder="Create a password"
            required
          />
        </div>
        <button type="submit" class="register-button">
          <span class="button-text">Create Account</span>
          <span class="button-icon">→</span>
        </button>
      </form>
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>
      <div class="login-link">
        <p>Already have an account? <router-link to="/login">Login here</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { mapActions, mapState } from 'pinia'

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    ...mapState(useAuthStore, ['error'])
  },
  methods: {
    ...mapActions(useAuthStore, ['register']),
    async handleRegister() {
      await this.register(this.username, this.password)
      const authStore = useAuthStore()
      if (authStore.user && !authStore.error) {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 2rem 4rem 2rem;
  z-index: 1;
}

.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 700px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 245, 232, 0.95) 100%);
  border: 2px solid transparent;
  border-radius: 24px;
  padding: 2.5rem 3rem;
  box-shadow:
    0 20px 60px rgba(254, 181, 3, 0.15),
    0 0 0 1px rgba(254, 181, 3, 0.1);
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  background-clip: padding-box;
  position: relative;
}

.register-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(135deg, #feb503, #a94a66, #8768c8);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: borderGlow 3s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-wrapper {
  margin-bottom: 0.75rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.music-icon {
  font-size: 2.5rem;
  display: inline-block;
  filter: drop-shadow(0 4px 8px rgba(254, 181, 3, 0.3));
}

.register-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  background: linear-gradient(135deg, #feb503 0%, #a94a66 50%, #8768c8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease-in-out infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.subtitle {
  color: #3d5d7e;
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  animation: fadeIn 0.8s ease 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.9;
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeIn 0.6s ease both;
}

.input-group:nth-child(1) {
  animation-delay: 0.4s;
}

.input-group:nth-child(2) {
  animation-delay: 0.5s;
}

.input-group label {
  color: #3d5d7e;
  font-weight: 600;
  font-size: 0.95rem;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.input-group input {
  width: 100%;
  padding: 12px 18px;
  border: 2px solid #8a9eaf;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.input-group input:focus {
  outline: none;
  border-color: #feb503;
  background: white;
  box-shadow: 0 0 0 4px rgba(254, 181, 3, 0.15);
  transform: translateY(-2px);
}

.input-group input:hover {
  border-color: #3d5d7e;
}

.register-button {
  margin-top: 0.5rem;
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #feb503 0%, #a94a66 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(254, 181, 3, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease 0.6s both;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.register-button:hover::before {
  left: 100%;
}

.register-button:hover {
  background: linear-gradient(135deg, #a94a66 0%, #8768c8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(169, 74, 102, 0.4);
}

.register-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.register-button:hover .button-icon {
  transform: translateX(4px);
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(211, 47, 47, 0.1);
  border: 2px solid #d32f2f;
  border-radius: 12px;
  color: #d32f2f;
  text-align: center;
  font-weight: 500;
  animation: shake 0.4s ease, fadeIn 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.2rem;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(138, 158, 175, 0.3);
  animation: fadeIn 0.6s ease 0.7s both;
}

.login-link p {
  margin: 0;
  color: #3d5d7e;
  font-size: 0.95rem;
}

.login-link a {
  color: #feb503;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.login-link a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #feb503, #a94a66);
  transition: width 0.3s ease;
}

.login-link a:hover {
  color: #a94a66;
}

.login-link a:hover::after {
  width: 100%;
}
</style>
