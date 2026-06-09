<template>
    <div class="flex flex-col h-full bg-white">
        <!-- Logo -->
        <div class="h-16 flex items-center px-5 border-b border-slate-100">
            <div
                class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30 mr-3"
            >
                <span class="text-base">💰</span>
            </div>
            <span class="font-bold text-slate-800">รายรับรายจ่าย</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 py-4 px-3 space-y-1">
            <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
                :class="
                    route.path === item.to
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                "
            >
                <span class="text-lg">{{ item.icon }}</span>
                {{ item.label }}
            </NuxtLink>
        </nav>

        <!-- User info -->
        <div class="p-4 border-t border-slate-100">
            <div class="flex items-center gap-3 px-2">
                <div
                    class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0"
                >
                    {{ auth.user?.name?.[0]?.toUpperCase() ?? 'U' }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-800 truncate">{{ auth.user?.name }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ auth.user?.email }}</p>
                </div>
                <button
                    title="ออกจากระบบ"
                    class="text-slate-400 hover:text-rose-500 transition-colors"
                    @click="auth.logout()"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const auth = useAuthStore();
const route = useRoute();

const navItems = [
    { to: '/', icon: '📋', label: 'รายการ' },
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
];
</script>
