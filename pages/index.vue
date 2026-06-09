<template>
  <div>
    <!-- Navbar -->
    <nav style="background:var(--surface); border-bottom:0.5px solid var(--border); padding:0 1rem;">
      <div class="container" style="display:flex; align-items:center; justify-content:space-between; height:56px;">
        <span style="font-weight:600; font-size:16px;">💰 รายรับรายจ่าย</span>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:13px; color:var(--text2);">{{ auth.user?.name }}</span>
          <button class="btn" style="padding:6px 12px; font-size:12px;" @click="auth.logout()">ออกจากระบบ</button>
        </div>
      </div>
    </nav>

    <div class="container" style="padding-top:1.5rem; padding-bottom:2rem;">
      <!-- Month filter -->
      <div style="display:flex; gap:8px; margin-bottom:1.25rem; align-items:center;">
        <select v-model="selectedMonth" style="width:auto; font-size:13px;" @change="load">
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <select v-model="selectedYear" style="width:auto; font-size:13px;" @change="load">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- Summary cards -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:1.25rem;">
        <div class="card" style="padding:1rem;">
          <div style="font-size:12px; color:var(--text2); margin-bottom:4px;">รายรับ</div>
          <div style="font-size:20px; font-weight:600; color:var(--income);">{{ fmt(summary.total_income) }}</div>
        </div>
        <div class="card" style="padding:1rem;">
          <div style="font-size:12px; color:var(--text2); margin-bottom:4px;">รายจ่าย</div>
          <div style="font-size:20px; font-weight:600; color:var(--expense);">{{ fmt(summary.total_expense) }}</div>
        </div>
        <div class="card" style="padding:1rem;">
          <div style="font-size:12px; color:var(--text2); margin-bottom:4px;">คงเหลือ</div>
          <div style="font-size:20px; font-weight:600;" :style="{ color: summary.balance >= 0 ? 'var(--income)' : 'var(--expense)' }">
            {{ fmt(summary.balance) }}
          </div>
        </div>
      </div>

      <!-- Add transaction -->
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="font-size:14px; font-weight:600; margin-bottom:1rem;">เพิ่มรายการใหม่</div>
        <div class="form-row form-row-2" style="margin-bottom:8px;">
          <div class="form-group" style="margin:0">
            <input v-model="form.name" placeholder="ชื่อรายการ" />
          </div>
          <div class="form-group" style="margin:0">
            <input v-model.number="form.amount" type="number" placeholder="จำนวนเงิน (฿)" min="0" step="0.01" />
          </div>
        </div>
        <div class="form-row form-row-2" style="margin-bottom:10px;">
          <select v-model="form.type" @change="form.category = ''">
            <option value="income">💰 รายรับ</option>
            <option value="expense">💸 รายจ่าย</option>
          </select>
          <select v-model="form.category">
            <option value="">เลือกหมวดหมู่</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.name">{{ c.icon }} {{ c.name }}</option>
          </select>
        </div>
        <div class="form-row form-row-2" style="margin-bottom:10px;">
          <input v-model="form.date" type="date" />
          <input v-model="form.note" placeholder="หมายเหตุ (ไม่บังคับ)" />
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-income" style="flex:1; justify-content:center;" @click="addTx('income')">+ รายรับ</button>
          <button class="btn btn-expense" style="flex:1; justify-content:center;" @click="addTx('expense')">+ รายจ่าย</button>
        </div>
        <div v-if="formError" style="margin-top:8px; font-size:13px; color:var(--expense);">{{ formError }}</div>
      </div>

      <!-- Transaction list -->
      <div class="card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
          <div style="font-size:14px; font-weight:600;">รายการทั้งหมด</div>
          <select v-model="filterType" style="width:auto; font-size:12px; padding:5px 8px;" @change="load">
            <option value="">ทั้งหมด</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>

        <div v-if="loading" style="text-align:center; padding:2rem; color:var(--text3); font-size:13px;">กำลังโหลด...</div>
        <div v-else-if="!transactions.length" style="text-align:center; padding:2rem; color:var(--text3); font-size:13px;">ยังไม่มีรายการ</div>
        <div v-else>
          <div v-for="tx in transactions" :key="tx.id"
            style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:0.5px solid var(--border); font-size:13px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:8px; height:8px; border-radius:50%; flex-shrink:0;"
                :style="{ background: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }"></div>
              <div>
                <div style="font-weight:500;">{{ tx.name }}</div>
                <div style="font-size:11px; color:var(--text2);">{{ tx.category }} · {{ tx.date }}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span :style="{ color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }">
                {{ tx.type === 'income' ? '+' : '-' }}{{ fmt(tx.amount) }}
              </span>
              <button style="background:none; border:none; cursor:pointer; color:var(--text3); font-size:16px; padding:2px 6px; border-radius:6px;"
                @click="deleteTx(tx.id)">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const api = useApi()

const now = new Date()
const selectedMonth = ref(String(now.getMonth() + 1))
const selectedYear = ref(String(now.getFullYear()))
const filterType = ref('')
const loading = ref(false)
const transactions = ref([])
const summary = ref({ total_income: 0, total_expense: 0, balance: 0 })
const categories = ref([])
const formError = ref('')

const form = reactive({
  name: '', amount: '', type: 'expense', category: '', date: now.toISOString().split('T')[0], note: ''
})

const months = [
  { value: '1', label: 'มกราคม' }, { value: '2', label: 'กุมภาพันธ์' },
  { value: '3', label: 'มีนาคม' }, { value: '4', label: 'เมษายน' },
  { value: '5', label: 'พฤษภาคม' }, { value: '6', label: 'มิถุนายน' },
  { value: '7', label: 'กรกฎาคม' }, { value: '8', label: 'สิงหาคม' },
  { value: '9', label: 'กันยายน' }, { value: '10', label: 'ตุลาคม' },
  { value: '11', label: 'พฤศจิกายน' }, { value: '12', label: 'ธันวาคม' }
]
const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i))

const filteredCategories = computed(() => categories.value.filter(c => c.type === form.type))

function fmt(n) {
  return '฿' + Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

async function loadCategories() {
  try {
    categories.value = await api.get('/api/categories')
  } catch (e) {
    console.error('loadCategories:', e)
  }
}

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams({ month: selectedMonth.value, year: selectedYear.value })
    if (filterType.value) params.set('type', filterType.value)
    const [txs, sum] = await Promise.all([
      api.get(`/api/transactions?${params}`),
      api.get(`/api/summary?month=${selectedMonth.value}&year=${selectedYear.value}`)
    ])
    transactions.value = txs
    summary.value = sum
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function addTx(forceType) {
  formError.value = ''
  form.type = forceType
  if (!form.name || !form.amount || !form.category) {
    formError.value = 'กรุณากรอกชื่อรายการ จำนวนเงิน และหมวดหมู่'
    return
  }
  try {
    await api.post('/api/transactions', { ...form })
    form.name = ''; form.amount = ''; form.note = ''
    await load()
  } catch (e) {
    formError.value = e.message
  }
}

async function deleteTx(id) {
  if (!confirm('ต้องการลบรายการนี้ใช่ไหม?')) return
  try {
    await api.del(`/api/transactions/${id}`)
    await load()
  } catch (e) {
    alert(e.message)
  }
}

onMounted(async () => {
  await loadCategories()
  await load()
})
</script>
