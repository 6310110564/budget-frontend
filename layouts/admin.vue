<template>
    <v-app>
        <v-navigation-drawer
            v-model="drawer"
            app
            :width="260"
            class="!fixed left-0 top-0 h-screen z-[100] shadow-sm"
        >
            <AppSidebar />
        </v-navigation-drawer>

        <v-app-bar app elevation="1" class="!fixed z-[101]">
            <AppHeader v-model:drawer="drawer" />
        </v-app-bar>

        <v-main class="bg-slate-50">
            <v-container fluid class="p-6">
                <slot />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import AppHeader from '~/components/layout/AppHeader.vue';
import AppSidebar from '~/components/layout/AppSidebar.vue';

const drawer = ref(true);
const auth = useAuthStore();

onMounted(async () => {
    await auth.fetchMe();
});
</script>
