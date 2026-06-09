<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Navbar -->
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div
        class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30"
          >
            <span class="text-base">💰</span>
          </div>
          <span class="font-bold text-slate-800 text-base">รายรับรายจ่าย</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500 hidden sm:block">{{
            auth.user?.name
          }}</span>
          <button
            class="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            @click="auth.logout()"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>

    <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <!-- Month / Year filter -->
      <!-- <div class="flex items-center gap-2">
        <select v-model="selectedMonth" @change="load"
          class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all cursor-pointer"
        >
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <select v-model="selectedYear" @change="load"
          class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all cursor-pointer"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div> -->

      <!-- Summary cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">↑</span>
            <p class="text-xs font-medium text-slate-500">รายรับ</p>
          </div>
          <p class="text-base font-bold text-emerald-600">{{ fmt(summary.total_income) }}</p>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-sm">↓</span>
            <p class="text-xs font-medium text-slate-500">รายจ่าย</p>
          </div>
          <p class="text-base font-bold text-rose-600">{{ fmt(summary.total_expense) }}</p>
        </div>

        <div class="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              :class="summary.balance >= 0 ? 'bg-indigo-100' : 'bg-orange-100'"
            >=</span>
            <p class="text-xs font-medium text-slate-500">คงเหลือ</p>
          </div>
          <p
            class="text-base font-bold"
            :class="summary.balance >= 0 ? 'text-indigo-600' : 'text-orange-600'"
          >{{ fmt(summary.balance) }}</p>
        </div>
      </div>

      <!-- Add transaction form -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 class="text-sm font-semibold text-slate-800 mb-4">
          เพิ่มรายการใหม่
        </h2>

        <div class="grid grid-cols-2 gap-3 mb-3">
          <input
            v-model="form.name"
            placeholder="ชื่อรายการ"
            class="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
          <input
            v-model.number="form.amount"
            type="number"
            placeholder="จำนวนเงิน (฿)"
            min="0"
            step="0.01"
            class="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3">
          <select
            v-model="form.type"
            @change="form.category = ''"
            class="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all cursor-pointer"
          >
            <option value="income">💰 รายรับ</option>
            <option value="expense">💸 รายจ่าย</option>
          </select>
          <select
            v-model="form.category"
            class="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all cursor-pointer"
          >
            <option value="">เลือกหมวดหมู่</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.name">
              {{ c.icon }} {{ c.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <input
            v-model="form.date"
            type="date"
            class="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
          <input
            v-model="form.note"
            placeholder="หมายเหตุ (ไม่บังคับ)"
            class="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>

        <div class="flex gap-2">
          <button
            @click="addTx('income')"
            class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[.98] text-white transition-all shadow-md shadow-emerald-500/25"
          >
            + รายรับ
          </button>
          <button
            @click="addTx('expense')"
            class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[.98] text-white transition-all shadow-md shadow-rose-500/25"
          >
            + รายจ่าย
          </button>
        </div>

        <p
          v-if="formError"
          class="mt-3 text-sm text-rose-500 flex items-center gap-1.5"
        >
          ⚠️ {{ formError }}
        </p>
      </div>

      <!-- Transaction list -->
      <div
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 pb-2"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-slate-800">รายการทั้งหมด</h2>
          <select
            v-model="filterType"
            @change="load"
            class="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option value="">ทั้งหมด</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>

        <div v-if="loading" class="py-12 text-center text-sm text-slate-400">
          <div
            class="inline-block w-5 h-5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-2"
          ></div>
          <p>กำลังโหลด...</p>
        </div>

        <div v-else-if="!transactions.length" class="py-12 text-center">
          <p class="text-3xl mb-2">📭</p>
          <p class="text-sm text-slate-400">ยังไม่มีรายการในเดือนนี้</p>
        </div>

        <div v-else class="-mx-1 mb-2">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center text-base font-semibold flex-shrink-0"
              :class="
                tx.type === 'income'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-rose-100 text-rose-600'
              "
            >
              {{ tx.type === "income" ? "↑" : "↓" }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">
                {{ tx.name }}
              </p>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ tx.category }} · {{ tx.date }}
              </p>
            </div>

            <div class="flex items-center gap-1.5">
              <span
                class="text-sm font-semibold"
                :class="
                  tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                "
              >
                {{ tx.type === "income" ? "+" : "-" }}{{ fmt(tx.amount) }}
              </span>
              <button
                @click="deleteTx(tx.id)"
                class="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });

const auth = useAuthStore();
const api = useApi();

const now = new Date();
const selectedMonth = ref(String(now.getMonth() + 1));
const selectedYear = ref(String(now.getFullYear()));
const filterType = ref("");
const loading = ref(false);
const transactions = ref([]);
const summary = ref({ total_income: 0, total_expense: 0, balance: 0 });
const categories = ref([]);
const formError = ref("");

const form = reactive({
  name: "",
  amount: "",
  type: "expense",
  category: "",
  date: now.toISOString().split("T")[0],
  note: "",
});

const months = [
  { value: "1", label: "มกราคม" },
  { value: "2", label: "กุมภาพันธ์" },
  { value: "3", label: "มีนาคม" },
  { value: "4", label: "เมษายน" },
  { value: "5", label: "พฤษภาคม" },
  { value: "6", label: "มิถุนายน" },
  { value: "7", label: "กรกฎาคม" },
  { value: "8", label: "สิงหาคม" },
  { value: "9", label: "กันยายน" },
  { value: "10", label: "ตุลาคม" },
  { value: "11", label: "พฤศจิกายน" },
  { value: "12", label: "ธันวาคม" },
];
const years = Array.from({ length: 5 }, (_, i) =>
  String(now.getFullYear() - i),
);

const filteredCategories = computed(() =>
  categories.value.filter((c) => c.type === form.type),
);

function fmt(n) {
  return (
    "฿" +
    Number(n || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

async function loadCategories() {
  try {
    categories.value = await api.get("/api/categories");
  } catch (e) {
    console.error("loadCategories:", e);
  }
}

async function load() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      month: selectedMonth.value,
      year: selectedYear.value,
    });
    if (filterType.value) params.set("type", filterType.value);
    const [txs, sum] = await Promise.all([
      api.get(`/api/transactions?${params}`),
      api.get(
        `/api/transactions/summary?month=${selectedMonth.value}&year=${selectedYear.value}`,
      ),
    ]);
    transactions.value = txs;
    summary.value = sum;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function addTx(forceType) {
  formError.value = "";
  form.type = forceType;
  if (!form.name || !form.amount || !form.category) {
    formError.value = "กรุณากรอกชื่อรายการ จำนวนเงิน และหมวดหมู่";
    return;
  }
  try {
    await api.post("/api/transactions", { ...form });
    form.name = "";
    form.amount = "";
    form.note = "";
    await load();
  } catch (e) {
    formError.value = e.message;
  }
}

async function deleteTx(id) {
  if (!confirm("ต้องการลบรายการนี้ใช่ไหม?")) return;
  try {
    await api.del(`/api/transactions/${id}`);
    await load();
  } catch (e) {
    alert(e.message);
  }
}

onMounted(async () => {
  await loadCategories();
  await load();
});
</script>
