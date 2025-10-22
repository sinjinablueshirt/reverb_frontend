<template>
  <div>
    <div v-if="authStore.user">
      <h1>Welcome, {{ authStore.username }}</h1>
      <form @submit.prevent="search">
        <input type="text" v-model="searchQuery" placeholder="Search for compositions by tags..." />
        <button type="submit">Search</button>
      </form>
      <h2>My Compositions</h2>
      <div v-if="compositionStore.compositions.length > 0">
        <ul>
          <li v-for="composition in compositionStore.compositions" :key="composition.id">
            <router-link :to="{ name: 'composition-detail', params: { id: composition.id } }">
              {{ composition.fileName || 'Untitled' }}
            </router-link>
          </li>
        </ul>
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
  router.push({ name: 'search', query: { tags: searchQuery.value } });
};
</script>
