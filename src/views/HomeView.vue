<template>
  <div class="home-view">
    <div class="background-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-circle circle-4"></div>
      <div class="floating-circle circle-5"></div>
    </div>
    <div v-if="authStore.user" class="content">
      <h1>Welcome, {{ authStore.username }}</h1>
      <div class="search-section">
        <div class="search-bar-container">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="search"
            placeholder="Search by tags (comma-separated)..."
            class="search-input"
          />
          <button @click="search" class="search-button">
            <span class="search-icon">🔍</span> Search
          </button>
        </div>
        <p class="search-hint" v-if="searchQuery">
          Searching for: <span class="tag-preview" v-for="tag in searchQuery.split(',')" :key="tag">{{ tag.trim() }}</span>
        </p>
      </div>
      <h2>My Compositions</h2>
      <div v-if="compositionStore.compositions.length > 0" class="compositions-grid">
        <router-link
          v-for="composition in compositionStore.compositions"
          :key="composition.id"
          :to="{ name: 'composition-detail', params: { id: composition.id } }"
          class="composition-card"
        >
          <div class="composition-card-content">
            <h3>{{ composition.title || 'Untitled' }}</h3>
            <p class="composition-description">{{ composition.description || 'No description' }}</p>
            <div class="composition-tags" v-if="composition.tags && composition.tags.filter(t => t !== 'public').length">
              <span class="tag" v-for="tag in composition.tags.filter(t => t !== 'public')" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </router-link>
      </div>
      <div v-else>
        <p>You haven't uploaded any compositions yet.</p>
      </div>
      <hr />
      <h2>Upload New Composition</h2>
      <router-link to="/upload">
        <button>+</button>
      </router-link>
    </div>
    <div v-else>
      <div class="welcome-container">
        <div class="welcome-card">
          <div class="welcome-icon">🎵</div>
          <h1>Welcome to Reverb</h1>
          <p class="welcome-text">Upload your music compositions and get valuable feedback from the community</p>
          <div class="auth-buttons">
            <router-link to="/login" class="auth-button login-button">
              Login
            </router-link>
            <router-link to="/register" class="auth-button register-button">
              Register
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCompositionStore } from '@/stores/composition';
import { RouterLink, useRouter } from 'vue-router';

const authStore = useAuthStore();
const compositionStore = useCompositionStore();
const router = useRouter();
const searchQuery = ref('');

async function loadCompositions() {
  if (authStore.user) {
    await compositionStore.getCompositionsByUser(authStore.user);
  }
}

onMounted(loadCompositions);

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    loadCompositions();
  }
});

const search = () => {
  // Allow empty search to get all public compositions
  const tags = searchQuery.value.trim()
    ? searchQuery.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    : [];

  // Automatically add "public" tag to search for public compositions only
  if (!tags.includes('public')) {
    tags.push('public');
  }

  router.push({ name: 'search', query: { tags: tags.join(',') } });
};
</script>

<style scoped>
.home-view {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out both;
  will-change: opacity, transform;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  opacity: 0.18;
  animation: float 6s ease-in-out infinite;
  filter: blur(1px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #8768c8, #a94a66);
  top: 15%;
  left: 8%;
  animation-delay: 0s;
}

.circle-2 {
  width: 240px;
  height: 240px;
  background: linear-gradient(135deg, #feb503, #a94a66);
  bottom: 8%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 160px;
  height: 160px;
  background: linear-gradient(135deg, #3d5d7e, #8768c8);
  top: 45%;
  right: 12%;
  animation-delay: 4s;
}

.circle-4 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #feb503, #8768c8);
  top: 65%;
  left: 5%;
  animation-delay: 1s;
}

.circle-5 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #a94a66, #3d5d7e);
  top: 25%;
  right: 25%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) scale(1.1) rotate(5deg);
  }
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.search-section {
  margin-bottom: 2rem;
  text-align: center;
}

.search-bar-container {
  display: flex;
  gap: 1rem;
  max-width: 700px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 14px 20px;
  font-size: 1rem;
  border: 2px solid #8a9eaf;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #8768c8;
  box-shadow: 0 0 0 3px rgba(135, 104, 200, 0.2);
}

.search-button {
  padding: 14px 28px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(135, 104, 200, 0.3);
}

.search-button:hover {
  background: linear-gradient(135deg, #a94a66 0%, #feb503 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(169, 74, 102, 0.4);
}

.search-button:active {
  transform: translateY(0);
}

.search-icon {
  font-size: 1.2em;
}

.search-hint {
  margin-top: 1rem;
  color: #3d5d7e;
  font-size: 0.95rem;
}

.tag-preview {
  display: inline-block;
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  margin: 0 0.25rem;
  font-size: 0.9em;
}

.compositions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.composition-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border: 2px solid #8768c8;
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.5s ease, color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 180px;
  position: relative;
  overflow: hidden;
}

.composition-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #feb503 0%, #a94a66 25%, #8768c8 50%, #3d5d7e 75%, #8a9eaf 100%);
  background-size: 100% 200%;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: -1;
}

.composition-card:hover::before {
  opacity: 1;
  animation: gradientShift 8s ease-in-out infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
}

.composition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(135, 104, 200, 0.4);
  border-color: #feb503;
  color: white;
}

.composition-card:hover .composition-card-content h3 {
  color: #fff;
}

.composition-card:hover .composition-description {
  color: rgba(255, 255, 255, 0.95);
}

.composition-card-content h3 {
  margin: 0 0 12px 0;
  font-size: 1.4em;
  color: #3d5d7e;
  font-weight: 600;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.composition-description {
  margin: 0 0 12px 0;
  font-size: 0.95em;
  line-height: 1.5;
  color: #555;
  flex-grow: 1;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.composition-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.composition-tags .tag {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(135, 104, 200, 0.2);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.composition-card:hover .composition-tags .tag {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  box-shadow: 0 2px 6px rgba(255, 255, 255, 0.3);
}

.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.welcome-card {
  text-align: center;
  max-width: 500px;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 245, 232, 0.95) 100%);
  border: 2px solid #8768c8;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(135, 104, 200, 0.15);
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
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

.welcome-card h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 50%, #feb503 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  color: #3d5d7e;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.auth-button {
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.login-button {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(135, 104, 200, 0.3);
}

.login-button:hover {
  background: linear-gradient(135deg, #a94a66 0%, #8768c8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(135, 104, 200, 0.4);
}

.register-button {
  background: linear-gradient(135deg, #feb503 0%, #a94a66 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(254, 181, 3, 0.3);
}

.register-button:hover {
  background: linear-gradient(135deg, #a94a66 0%, #feb503 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(254, 181, 3, 0.4);
}
</style>
