<template>
    <div class="flex items-center w-full px-4 h-16">
        <button
            class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            @click="$emit('update:drawer', !drawer)"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
            >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        </button>
        <h1 class="ml-3 text-base font-semibold text-slate-800">{{ pageTitle }}</h1>
    </div>
</template>

<script setup>
defineProps({ drawer: Boolean });
defineEmits(['update:drawer']);

const route = useRoute();

const titleMap = { '/': 'รายการ', '/dashboard': 'Dashboard' };
const pageTitle = computed(() => titleMap[route.path] ?? 'หน้าหลัก');
</script>
