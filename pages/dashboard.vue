<template>
    <div class="space-y-6">
        <!-- Header + filter -->
        <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-slate-800">สรุปภาพรวม</h2>
            <div class="flex items-center gap-2">
                <select
                    v-model="selectedMonth"
                    class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 cursor-pointer"
                    @change="load"
                >
                    <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
                <select
                    v-model="selectedYear"
                    class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 cursor-pointer"
                    @change="load"
                >
                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                </select>
            </div>
        </div>

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

        <!-- Pie charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Expense by category -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 class="text-sm font-semibold text-slate-800 mb-4">รายจ่ายแยกตามหมวดหมู่</h3>
                <div v-if="loading" class="flex justify-center items-center h-64 text-slate-400 text-sm">
                    กำลังโหลด...
                </div>
                <div v-else-if="!hasExpense" class="flex justify-center items-center h-64 text-slate-400 text-sm">
                    ไม่มีข้อมูลรายจ่าย
                </div>
                <ClientOnly v-else>
                    <Pie :data="expenseChartData" :options="chartOptions" class="max-h-64" />
                </ClientOnly>
            </div>

            <!-- Income by category -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 class="text-sm font-semibold text-slate-800 mb-4">รายรับแยกตามหมวดหมู่</h3>
                <div v-if="loading" class="flex justify-center items-center h-64 text-slate-400 text-sm">
                    กำลังโหลด...
                </div>
                <div v-else-if="!hasIncome" class="flex justify-center items-center h-64 text-slate-400 text-sm">
                    ไม่มีข้อมูลรายรับ
                </div>
                <ClientOnly v-else>
                    <Pie :data="incomeChartData" :options="chartOptions" class="max-h-64" />
                </ClientOnly>
            </div>
        </div>

        <!-- Category breakdown table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-slate-800 mb-4">รายละเอียดแยกหมวดหมู่</h3>
            <div v-if="loading" class="text-center py-8 text-slate-400 text-sm">กำลังโหลด...</div>
            <div v-else-if="!transactions.length" class="text-center py-8 text-slate-400 text-sm">
                ไม่มีรายการในเดือนนี้
            </div>
            <table v-else class="w-full text-sm">
                <thead>
                    <tr class="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th class="pb-2 font-medium">หมวดหมู่</th>
                        <th class="pb-2 font-medium text-right">รายรับ</th>
                        <th class="pb-2 font-medium text-right">รายจ่าย</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in categoryRows"
                        :key="row.category"
                        class="border-b border-slate-50 last:border-0"
                    >
                        <td class="py-2.5 text-slate-700">{{ row.category }}</td>
                        <td class="py-2.5 text-right font-medium text-emerald-600">
                            {{ row.income ? fmt(row.income) : '—' }}
                        </td>
                        <td class="py-2.5 text-right font-medium text-rose-600">
                            {{ row.expense ? fmt(row.expense) : '—' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

definePageMeta({ layout: 'admin', middleware: ['auth'] });

const api = useApi();
const now = new Date();
const selectedMonth = ref(String(now.getMonth() + 1));
const selectedYear = ref(String(now.getFullYear()));
const loading = ref(false);
const transactions = ref([]);
const summary = ref({ total_income: 0, total_expense: 0, balance: 0 });

const months = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
];
const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

const COLORS = [
    '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16', '#f59e0b',
];

function groupByCategory(type) {
    const map = {};
    transactions.value
        .filter((tx) => tx.type === type)
        .forEach((tx) => {
            map[tx.category] = (map[tx.category] || 0) + Number(tx.amount);
        });
    return map;
}

const expenseByCategory = computed(() => groupByCategory('expense'));
const incomeByCategory = computed(() => groupByCategory('income'));

const hasExpense = computed(() => Object.keys(expenseByCategory.value).length > 0);
const hasIncome = computed(() => Object.keys(incomeByCategory.value).length > 0);

function buildChartData(map) {
    const labels = Object.keys(map);
    return {
        labels,
        datasets: [
            {
                data: Object.values(map),
                backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: 3,
                borderColor: '#f8fafc',
                hoverBorderWidth: 4,
                hoverOffset: 6,
            },
        ],
    };
}

const expenseChartData = computed(() => buildChartData(expenseByCategory.value));
const incomeChartData = computed(() => buildChartData(incomeByCategory.value));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 16 },
        },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const val = ctx.parsed;
                    return ` ฿${Number(val).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
                },
            },
        },
    },
};

const categoryRows = computed(() => {
    const cats = new Set([
        ...Object.keys(expenseByCategory.value),
        ...Object.keys(incomeByCategory.value),
    ]);
    return [...cats]
        .map((cat) => ({
            category: cat,
            income: incomeByCategory.value[cat] || 0,
            expense: expenseByCategory.value[cat] || 0,
        }))
        .sort((a, b) => b.expense + b.income - (a.expense + a.income));
});

function fmt(n) {
    return '฿' + Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

async function load() {
    loading.value = true;
    try {
        const params = new URLSearchParams({ month: selectedMonth.value, year: selectedYear.value });
        const [txs, sum] = await Promise.all([
            api.get(`/api/transactions?${params}`),
            api.get(`/api/transactions/summary?month=${selectedMonth.value}&year=${selectedYear.value}`),
        ]);
        transactions.value = txs;
        summary.value = sum;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

onMounted(load);
</script>
