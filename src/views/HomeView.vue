<template>
  <div>
    <div v-if="authStore.user">
      <h1>Welcome, {{ authStore.username }}</h1>
      <form @submit.prevent="search">
        <input type="text" v-model="searchQuery" placeholder="Search for compositions by tags..." />
        <button type="submit">Search</button>
      </form>
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
      <h1>Welcome to Reverb</h1>
      <p>Please log in or register to continue.</p>
      <hr />
      <Register />
      <hr />
      <Login />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCompositionStore } from '@/stores/composition';
import Login from '@/components/Login.vue';
import Register from '@/components/Register.vue';
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
.compositions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
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
</style>
