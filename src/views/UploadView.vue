<template>
  <div>
    <h1>{{ isEditing ? 'Edit' : 'Upload' }} Composition</h1>
    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="composition.title" required />
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" v-model="composition.description"></textarea>
      </div>
      <div>
        <label for="tags">Tags (comma-separated)</label>
        <input type="text" id="tags" v-model="tags" />
      </div>
      <div>
        <label for="public">Public</label>
        <input type="checkbox" id="public" v-model="composition.isPublic" />
      </div>
      <div>
        <label for="file">File</label>
        <input type="file" id="file" @change="onFileChange" />
      </div>
      <button type="submit">{{ isEditing ? 'Update' : 'Post' }}</button>
    </form>
    <div v-if="compositionStore.error">{{ compositionStore.error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompositionStore } from '@/stores/composition';
import { useAuthStore } from '@/stores/auth';

import { useFileStore } from '@/stores/file';

const compositionStore = useCompositionStore();
const authStore = useAuthStore();
const fileStore = useFileStore();
const route = useRoute();
const router = useRouter();

const composition = ref({
  title: '',
  description: '',
  isPublic: true,
  owner: '',
  fileId: null,
});
const tags = ref('');
const selectedFile = ref(null);

const isEditing = computed(() => route.name === 'edit-composition');

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const submitForm = async () => {
  if (selectedFile.value) {
    const fileId = await fileStore.uploadFile(selectedFile.value, composition.value.title);
    if (fileId) {
      composition.value.fileId = fileId;
    } else {
      // Handle file upload error
      console.error('File upload failed:', fileStore.error);
      return;
    }
  }

  composition.value.owner = authStore.user;

  // Parse user-entered tags
  let compositionTags = tags.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

  // Add "public" tag if composition is public
  if (composition.value.isPublic && !compositionTags.includes('public')) {
    compositionTags.push('public');
  }

  // Remove "public" tag if composition is private
  if (!composition.value.isPublic) {
    compositionTags = compositionTags.filter(tag => tag !== 'public');
  }

  const compositionData = {
    ...composition.value,
    tags: compositionTags,
  };

  if (isEditing.value) {
    await compositionStore.updateComposition({ id: route.params.id, data: compositionData });
  } else {
    await compositionStore.createComposition(compositionData);
  }

  if (!compositionStore.error) {
    router.push('/');
  }
};

onMounted(async () => {
  if (isEditing.value) {
    await compositionStore.fetchComposition(route.params.id);
    if (compositionStore.currentComposition) {
      composition.value = { ...compositionStore.currentComposition };
      // Filter out "public" tag from display and set isPublic based on its presence
      const hasPublicTag = composition.value.tags.includes('public');
      composition.value.isPublic = hasPublicTag;
      tags.value = composition.value.tags.filter(t => t !== 'public').join(', ');
    }
  }
});
</script>
