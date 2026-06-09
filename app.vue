<template>
  <NuxtPage />
</template>

<script setup>
const auth = useAuthStore()
onMounted(() => auth.fetchMe())
</script>
