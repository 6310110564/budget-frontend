<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-sm relative z-10">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 ring-1 ring-white/30 shadow-xl">
          <span class="text-3xl">💰</span>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">บันทึกรายรับรายจ่าย</h1>
        <p class="text-indigo-200 text-sm mt-1">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <div v-if="error" class="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl px-4 py-3 text-sm mb-5">
          ⚠️ {{ error }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">อีเมล</label>
            <input
              v-model="form.email" type="email" placeholder="email@example.com"
              class="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
              @keyup.enter="submit"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
            <input
              v-model="form.password" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
              @keyup.enter="submit"
            />
          </div>
        </div>

        <button
          @click="submit" :disabled="loading"
          class="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[.98] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>

        <p class="text-center mt-5 text-sm text-slate-500">
          ยังไม่มีบัญชี?
          <NuxtLink to="/register" class="text-indigo-600 font-semibold hover:underline ml-1">สมัครสมาชิก</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!form.email || !form.password) { error.value = 'กรุณากรอกข้อมูลให้ครบ'; return }
  loading.value = true; error.value = ''
  try {
    await auth.login(form.email, form.password)
    navigateTo('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
