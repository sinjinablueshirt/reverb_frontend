<template>
  <div>
    <h1>Search Results</h1>
    <div v-if="searchResults.length">
      <ul class="search-results-list">
        <li v-for="composition in enrichedResults" :key="composition._id" class="result-item">
          <router-link :to="`/composition/${composition.resource}`" class="result-link">
            <div class="result-title">{{ composition.fileName || 'Untitled Composition' }}</div>
            <div class="result-meta">
              <span class="result-author">by {{ composition.ownerName || 'Loading...' }}</span>
            </div>
            <div class="result-description">{{ composition.description || 'No description' }}</div>
            <div class="result-tags">
              <span class="tag" v-for="tag in composition.tags" :key="tag">{{ tag }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No compositions found for the given tags.</p>
    </div>
    <div v-if="error">{{ error }}</div>
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
    };
  },
  computed: {
    ...mapState(useCompositionStore, ['searchResults', 'error']),
  },
  methods: {
    ...mapActions(useCompositionStore, ['searchCompositions']),

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
  },
  created() {
    const tags = this.$route.query.tags;
    if (tags) {
      this.searchCompositions(tags.split(','));
    }
  },
};
</script>

<style scoped>
.search-results-list {
  list-style: none;
  padding: 0;
}

.result-item {
  margin-bottom: 1.5rem;
}

.result-link {
  display: block;
  padding: 1rem;
  background-color: #f0fff0;
  border: 2px solid #98fb98;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.result-link:hover {
  background-color: #e0ffe0;
  border-color: #3cb371;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(60, 179, 113, 0.2);
}

.result-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2e8b57;
  margin-bottom: 0.5rem;
}

.result-meta {
  margin-bottom: 0.5rem;
}

.result-author {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.result-description {
  margin-bottom: 0.75rem;
  color: #2f4f4f;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #3cb371;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}
</style>
