<template>
  <div class="search-view">
    <div class="background-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    <div class="search-header">
      <h1>🎵 Search Compositions</h1>
      <div class="search-bar-container">
        <input
          type="text"
          v-model="searchQuery"
          @keyup.enter="performSearch"
          placeholder="Search by tags (comma-separated)..."
          class="search-input"
        />
        <button @click="performSearch" class="search-button">
          <span class="search-icon">🔍</span> Search
        </button>
      </div>
      <p class="search-hint" v-if="searchQuery">
        Searching for: <span class="tag-preview" v-for="tag in searchQuery.split(',')" :key="tag">{{ tag.trim() }}</span>
      </p>
    </div>

    <div v-if="searchResults.length" class="results-container">
      <div class="results-header">
        <h2>Found {{ enrichedResults.length }} composition{{ enrichedResults.length !== 1 ? 's' : '' }}</h2>
      </div>
      <div class="results-grid">
        <router-link
          v-for="composition in enrichedResults"
          :key="composition._id"
          :to="`/composition/${composition.resource}`"
          class="result-card"
        >
          <div class="result-card-header">
            <div class="result-title">{{ composition.title || 'Untitled Composition' }}</div>
            <div class="result-author">by {{ composition.ownerName || 'Loading...' }}</div>
          </div>
          <div class="result-description">{{ composition.description || 'No description' }}</div>
          <div class="result-tags">
            <span class="tag" v-for="tag in composition.tags.filter(t => t !== 'public')" :key="tag">{{ tag }}</span>
          </div>
        </router-link>
      </div>
    </div>
    <div v-else class="no-results">
      <div class="no-results-icon">🎼</div>
      <p>No compositions found for the given tags.</p>
      <p class="no-results-hint">Try different tags or create your own composition!</p>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { useCompositionStore } from '@/stores/composition';
import { useFileStore } from '@/stores/file';
import { mapActions, mapState } from 'pinia';
import { RouterLink } from 'vue-router';

export default {
  components: {
    RouterLink,
  },
  data() {
    return {
      enrichedResults: [],
      userNames: {},
      searchQuery: '',
    };
  },
  computed: {
    ...mapState(useCompositionStore, ['searchResults', 'error']),
  },
  methods: {
    ...mapActions(useCompositionStore, ['searchCompositions']),

    performSearch() {
      // Allow empty search to get all public compositions
      const tags = this.searchQuery.trim()
        ? this.searchQuery.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      // Automatically add "public" tag to filter for public compositions only
      if (!tags.includes('public')) {
        tags.push('public');
      }

      this.$router.push({ name: 'search', query: { tags: tags.join(',') } });
    },

    async enrichSearchResults() {
      const fileStore = useFileStore();
      const enriched = [];

      for (const result of this.searchResults) {
        console.log('Enriching search result:', result);
        try {
          // Fetch file details to get filename and owner
          const file = await fileStore.getFileById(result.resource);
          console.log('Fetched file data:', file);

          if (file) {
            // Fetch username for the owner
            console.log('Fetching owner name for user ID:', file.owner);
            const ownerName = await this.getUserName(file.owner);
            console.log('Fetched owner name:', ownerName);
            enriched.push({
              ...result,
              title: file.title || file.fileName,
              fileName: file.fileName,
              owner: file.owner,
              ownerName: ownerName,
            });
          } else {
            enriched.push({
              ...result,
              fileName: 'Unknown',
              ownerName: 'Unknown',
            });
          }
        } catch (error) {
          console.error('Error enriching search result:', error);
          enriched.push({
            ...result,
            fileName: 'Unknown',
            ownerName: 'Unknown',
          });
        }
      }

      this.enrichedResults = enriched;
    },

    async getUserName(userId) {
      if (this.userNames[userId]) {
        return this.userNames[userId];
      }

      try {
        const response = await fetch('http://localhost:8000/api/UserAuthentication/_getUserById', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });
        const data = await response.json();
        console.log('Fetched user data:', data);
        if (data.username) {
          this.userNames[userId] = data.username;
          return data.username;
        }
      } catch (error) {
        console.error('Failed to load username:', error);
      }

      this.userNames[userId] = 'Unknown User';
      return 'Unknown User';
    },
  },
  watch: {
    searchResults: {
      immediate: true,
      handler() {
        if (this.searchResults.length > 0) {
          this.enrichSearchResults();
        }
      },
    },
    '$route.query.tags': {
      immediate: true,
      handler(newTags) {
        if (newTags) {
          // Remove "public" from display but ensure it's in the actual search
          const tagArray = newTags.split(',');
          const displayTags = tagArray.filter(tag => tag !== 'public');
          this.searchQuery = displayTags.join(', ');

          // Ensure "public" is in the search tags
          if (!tagArray.includes('public')) {
            tagArray.push('public');
          }
          this.searchCompositions(tagArray);
        }
      },
    },
  },
  created() {
    // Initial search is now handled by the route watcher
  },
};
</script>

<style scoped>
.search-view {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  overflow: hidden;
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

/* Search Header */
.search-header {
  position: relative;
  z-index: 1;
  margin-bottom: 3rem;
  text-align: center;
}

.search-header h1 {
  margin-bottom: 1.5rem;
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

/* Results Container */
.results-container {
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #8a9eaf;
}

.results-header h2 {
  color: #3d5d7e;
  margin: 0;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.result-card {
  display: flex;
  flex-direction: column;
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 245, 232, 0.9) 100%);
  border: 2px solid #8a9eaf;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(61, 93, 126, 0.1);
  min-height: 200px;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(254, 181, 3, 0.15) 0%,
    rgba(169, 74, 102, 0.15) 30%,
    rgba(135, 104, 200, 0.15) 60%,
    rgba(61, 93, 126, 0.15) 100%
  );
  transition: left 0.5s ease;
  z-index: 0;
}

.result-card:hover::before {
  left: 0;
}

.result-card:hover {
  border-color: #8768c8;
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 12px 32px rgba(135, 104, 200, 0.25),
    0 0 0 1px rgba(254, 181, 3, 0.3);
}

.result-card > * {
  position: relative;
  z-index: 1;
}

.result-card-header {
  margin-bottom: 1rem;
}

.result-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #3d5d7e;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  transition: all 0.3s ease;
}

.result-card:hover .result-title {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 50%, #feb503 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: translateX(4px);
}

.result-author {
  color: #8768c8;
  font-style: italic;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.result-card:hover .result-author {
  color: #feb503;
  transform: translateX(4px);
}

.result-description {
  margin-bottom: 1rem;
  color: #1a1a1a;
  line-height: 1.6;
  flex-grow: 1;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.tag {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(135, 104, 200, 0.2);
  transition: all 0.3s ease;
}

.result-card:hover .tag {
  background: linear-gradient(135deg, #feb503 0%, #a94a66 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(254, 181, 3, 0.4);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  animation: fadeIn 0.5s ease;
}

.no-results-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-results p {
  font-size: 1.2rem;
  color: #3d5d7e;
  margin-bottom: 0.5rem;
}

.no-results-hint {
  color: #8a9eaf;
  font-size: 1rem;
}
</style>
