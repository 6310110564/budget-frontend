<template>
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1rem;">
    <div style="width:100%; max-width:400px;">
      <div style="text-align:center; margin-bottom:2rem;">
        <div style="font-size:2rem; margin-bottom:8px;">💰</div>
        <h1 style="font-size:22px; font-weight:600;">บันทึกรายรับรายจ่าย</h1>
        <p style="color:var(--text2); font-size:14px; margin-top:4px;">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
      </div>

      <div class="card">
        <div v-if="error" style="background:var(--expense-bg); color:var(--expense); padding:10px 12px; border-radius:var(--radius); font-size:13px; margin-bottom:1rem;">
          {{ error }}
        </div>

        <div class="form-group">
          <label>อีเมล</label>
          <input v-model="form.email" type="email" placeholder="email@example.com" @keyup.enter="submit" />
        </div>
        <div class="form-group">
          <label>รหัสผ่าน</label>
          <input v-model="form.password" type="password" placeholder="••••••" @keyup.enter="submit" />
        </div>

        <button class="btn btn-primary" style="width:100%; justify-content:center;" :disabled="loading" @click="submit">
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>

        <p style="text-align:center; margin-top:1rem; font-size:13px; color:var(--text2);">
          ยังไม่มีบัญชี?
          <NuxtLink to="/register" style="color:var(--blue); text-decoration:none;">สมัครสมาชิก</NuxtLink>
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
