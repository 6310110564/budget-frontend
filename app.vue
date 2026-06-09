<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const auth = useAuthStore()
onMounted(() => auth.fetchMe())
</script>
