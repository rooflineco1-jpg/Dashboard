// Dashboard Application Logic & State

// Mock Data for Orders
const initialOrders = [
    { id: "ORD-9421", customer: "أحمد المنصور", email: "ahmed@example.com", item: "ماك بوك برو M3", date: "2026-08-18", amount: "$2,499.00", status: "completed" },
    { id: "ORD-9420", customer: "سارة الشمري", email: "sara@example.com", item: "آيفون 16 برو ماكس", date: "2026-08-18", amount: "$1,199.00", status: "pending" },
    { id: "ORD-9419", customer: "خالد الحربي", email: "khaled@example.com", item: "سماعات سوني WH-1000XM5", date: "2026-08-17", amount: "$399.00", status: "completed" },
    { id: "ORD-9418", customer: "نورة القحطاني", email: "noura@example.com", item: "ساعة آبل Ultra 2", date: "2026-08-17", amount: "$799.00", status: "completed" },
    { id: "ORD-9417", customer: "محمد العتيبي", email: "mohammed@example.com", item: "شاشة سامسونج OLED 34\"", date: "2026-08-16", amount: "$850.00", status: "cancelled" },
    { id: "ORD-9416", customer: "فاطمة الزهراني", email: "fatima@example.com", item: "آيباد برو 13 إنش", date: "2026-08-16", amount: "$1,299.00", status: "completed" },
    { id: "ORD-9415", customer: "عمر الدوسري", email: "omar@example.com", item: "كيبورد ميكانيكي لاسلكي", date: "2026-08-15", amount: "$180.00", status: "pending" }
];

let orders = [...initialOrders];
let currentFilter = 'all';
let searchQuery = '';
let isRTL = true;
let isDark = false;

// Translation Dictionary
const i18n = {
    ar: {
        dashboard: "الرئيسية",
        analytics: "التحليلات",
        orders: "الطلبات",
        customers: "العملاء",
        products: "المنتجات",
        settings: "الإعدادات",
        welcomeTitle: "مرحباً بك مجدداً، عبد الله 👋",
        welcomeSub: "إليك نظرة عامة شاملة على أداء مبيعاتك ونشاط متجرك اليوم.",
        exportReport: "تصدير تقرير",
        newOrder: "طلب جديد",
        revenue: "إجمالي الإيرادات",
        ordersCount: "إجمالي الطلبات",
        newCustomers: "العملاء الجدد",
        conversionRate: "معدل التحويل",
        vsLastMonth: "مقارنة بالشهر الماضي",
        revenueOverview: "تحليل الإيرادات والنمو",
        categoriesShare: "المبيعات حسب الفئة",
        weeklyActivity: "النشاط الأسبوعي",
        recentOrders: "آخر المعاملات والطلبات",
        searchPlaceholder: "ابحث برقم الطلب، اسم العميل، أو المنتج...",
        allStatus: "الكل",
        completed: "مكتمل",
        pending: "قيد المعالجة",
        cancelled: "ملغي",
        orderId: "رقم الطلب",
        customer: "العميل",
        product: "المنتج",
        date: "التاريخ",
        amount: "المبلغ",
        status: "الحالة",
        actions: "الإجراءات",
        viewDetails: "عرض التفاصيل",
        orderDetails: "تفاصيل الطلب",
        close: "إغلاق",
        notifications: "الإشعارات",
        markAllAsRead: "تعيين الكل كمقروء",
        noOrdersFound: "لا توجد طلبات مطابقة للبحث."
    },
    en: {
        dashboard: "Dashboard",
        analytics: "Analytics",
        orders: "Orders",
        customers: "Customers",
        products: "Products",
        settings: "Settings",
        welcomeTitle: "Welcome back, Abdullah 👋",
        welcomeSub: "Here's a comprehensive overview of your sales and store performance today.",
        exportReport: "Export Report",
        newOrder: "New Order",
        revenue: "Total Revenue",
        ordersCount: "Total Orders",
        newCustomers: "New Customers",
        conversionRate: "Conversion Rate",
        vsLastMonth: "vs last month",
        revenueOverview: "Revenue & Growth Overview",
        categoriesShare: "Sales by Category",
        weeklyActivity: "Weekly Activity",
        recentOrders: "Recent Transactions & Orders",
        searchPlaceholder: "Search by order ID, customer name, or product...",
        allStatus: "All",
        completed: "Completed",
        pending: "Pending",
        cancelled: "Cancelled",
        orderId: "Order ID",
        customer: "Customer",
        product: "Product",
        date: "Date",
        amount: "Amount",
        status: "Status",
        actions: "Actions",
        viewDetails: "View Details",
        orderDetails: "Order Details",
        close: "Close",
        notifications: "Notifications",
        markAllAsRead: "Mark all as read",
        noOrdersFound: "No matching orders found."
    }
};

// Global Chart Instances
let revenueChart = null;
let categoryChart = null;
let weeklyChart = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check saved theme
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme(true);
    } else {
        setTheme(false);
    }

    // Initialize UI Components
    renderOrdersTable();
    initCharts();
    setupEventListeners();
    updateTranslations();
    lucide.createIcons();
});

// Setup event listeners
function setupEventListeners() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => setTheme(!isDark));
    }

    // Language Toggle
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }

    // Table Search
    const searchInput = document.getElementById('table-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderOrdersTable();
        });
    }

    // Filter Buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white', 'dark:bg-indigo-500');
                b.classList.add('bg-gray-100', 'text-gray-600', 'dark:bg-slate-700', 'dark:text-gray-300');
            });
            btn.classList.add('bg-indigo-600', 'text-white', 'dark:bg-indigo-500');
            btn.classList.remove('bg-gray-100', 'text-gray-600', 'dark:bg-slate-700', 'dark:text-gray-300');
            currentFilter = btn.getAttribute('data-filter');
            renderOrdersTable();
        });
    });

    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (mobileMenuBtn && sidebar && sidebarOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        });
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }

    // Notifications Dropdown Toggle
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDropdown.classList.add('hidden');
            }
        });
    }
}

// Theme handling
function setTheme(dark) {
    isDark = dark;
    const html = document.documentElement;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    if (dark) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
    } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
    }

    // Re-render charts with updated theme colors
    if (revenueChart) {
        updateChartThemes();
    }
}

// Language / Direction Toggle
function toggleLanguage() {
    isRTL = !isRTL;
    const html = document.documentElement;
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    html.setAttribute('lang', isRTL ? 'ar' : 'en');
    
    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = isRTL ? 'English' : 'عربي';
    }

    updateTranslations();
    renderOrdersTable();
    updateChartThemes();
    lucide.createIcons();
}

// Update text across UI according to active language
function updateTranslations() {
    const lang = isRTL ? 'ar' : 'en';
    const dict = i18n[lang];

    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (dict[key]) {
            elem.textContent = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            elem.setAttribute('placeholder', dict[key]);
        }
    });
}

// Render Orders Table
function renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    const filtered = orders.filter(order => {
        const matchesFilter = currentFilter === 'all' || order.status === currentFilter;
        const matchesSearch = 
            order.id.toLowerCase().includes(searchQuery) ||
            order.customer.toLowerCase().includes(searchQuery) ||
            order.item.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        const msg = isRTL ? i18n.ar.noOrdersFound : i18n.en.noOrdersFound;
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500 dark:text-gray-400">${msg}</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(order => {
        const statusBadge = getStatusBadge(order.status);
        return `
            <tr class="border-b border-gray-100 dark:border-slate-700/60 hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors">
                <td class="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                    ${order.id}
                </td>
                <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            ${order.customer.charAt(0)}
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">${order.customer}</p>
                            <p class="text-xs text-gray-400 dark:text-gray-500">${order.email}</p>
                        </div>
                    </div>
                </td>
                <td class="py-3.5 px-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    ${order.item}
                </td>
                <td class="py-3.5 px-4 text-sm text-gray-500 dark:text-gray-400">
                    ${order.date}
                </td>
                <td class="py-3.5 px-4 text-sm font-bold text-gray-900 dark:text-white">
                    ${order.amount}
                </td>
                <td class="py-3.5 px-4">
                    ${statusBadge}
                </td>
                <td class="py-3.5 px-4 text-start">
                    <button onclick="openOrderModal('${order.id}')" class="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-slate-700 transition-colors">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
}

function getStatusBadge(status) {
    const lang = isRTL ? 'ar' : 'en';
    switch (status) {
        case 'completed':
            return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                ${i18n[lang].completed}
            </span>`;
        case 'pending':
            return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                ${i18n[lang].pending}
            </span>`;
        case 'cancelled':
            return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                ${i18n[lang].cancelled}
            </span>`;
        default:
            return '';
    }
}

// Open Order Details Modal
window.openOrderModal = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('order-modal');
    const modalContent = document.getElementById('modal-body');
    const lang = isRTL ? 'ar' : 'en';

    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">${i18n[lang].orderId}</span>
                <span class="font-bold text-indigo-600 dark:text-indigo-400">${order.id}</span>
            </div>
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">${i18n[lang].customer}</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">${order.customer} (${order.email})</span>
            </div>
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">${i18n[lang].product}</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">${order.item}</span>
            </div>
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">${i18n[lang].date}</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">${order.date}</span>
            </div>
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">${i18n[lang].status}</span>
                <span>${getStatusBadge(order.status)}</span>
            </div>
            <div class="flex items-center justify-between pt-2">
                <span class="text-base font-bold text-gray-800 dark:text-gray-200">${i18n[lang].amount}</span>
                <span class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">${order.amount}</span>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeOrderModal = function() {
    const modal = document.getElementById('order-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

// Initialize Chart.js
function initCharts() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';

    // 1. Revenue Line / Area Chart
    const revCtx = document.getElementById('revenueChart');
    if (revCtx) {
        const ctx = revCtx.getContext('2d');
        const gradientRevenue = ctx.createLinearGradient(0, 0, 0, 300);
        gradientRevenue.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
        gradientRevenue.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        const gradientExpenses = ctx.createLinearGradient(0, 0, 0, 300);
        gradientExpenses.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
        gradientExpenses.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'],
                datasets: [
                    {
                        label: isRTL ? 'الإيرادات ($)' : 'Revenue ($)',
                        data: [18500, 22400, 28000, 24500, 35000, 39000, 44000, 52000],
                        borderColor: '#6366f1',
                        backgroundColor: gradientRevenue,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6366f1',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: isRTL ? 'المصروفات ($)' : 'Expenses ($)',
                        data: [11000, 13200, 15000, 14000, 19000, 21000, 22500, 26000],
                        borderColor: '#f43f5e',
                        backgroundColor: gradientExpenses,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#f43f5e',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor, font: { family: isRTL ? 'Cairo' : 'Inter', size: 12 } }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: isRTL ? 'Cairo' : 'Inter' } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: isRTL ? 'Cairo' : 'Inter' },
                            callback: value => '$' + (value / 1000) + 'k'
                        }
                    }
                }
            }
        });
    }

    // 2. Category Doughnut Chart
    const catCtx = document.getElementById('categoryChart');
    if (catCtx) {
        categoryChart = new Chart(catCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: isRTL ? ['إلكترونيات', 'أزياء', 'منزل ومطبخ', 'رياضة', 'أخرى'] : ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Other'],
                datasets: [{
                    data: [42, 26, 15, 11, 6],
                    backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { family: isRTL ? 'Cairo' : 'Inter', size: 11 }, boxWidth: 12, padding: 12 }
                    }
                },
                cutout: '72%'
            }
        });
    }

    // 3. Weekly Activity Bar Chart
    const weekCtx = document.getElementById('weeklyChart');
    if (weekCtx) {
        weeklyChart = new Chart(weekCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: isRTL ? ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: isRTL ? 'الطلبات اليومية' : 'Daily Orders',
                    data: [65, 82, 90, 75, 110, 130, 95],
                    backgroundColor: '#6366f1',
                    borderRadius: 6,
                    hoverBackgroundColor: '#4f46e5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: isRTL ? 'Cairo' : 'Inter', size: 11 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: isRTL ? 'Cairo' : 'Inter', size: 11 } }
                    }
                }
            }
        });
    }
}

// Update chart theme colors when toggling dark mode or language
function updateChartThemes() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const font = isRTL ? 'Cairo' : 'Inter';

    if (revenueChart) {
        revenueChart.options.plugins.legend.labels.color = textColor;
        revenueChart.options.plugins.legend.labels.font.family = font;
        revenueChart.options.scales.x.ticks.color = textColor;
        revenueChart.options.scales.x.ticks.font.family = font;
        revenueChart.options.scales.y.ticks.color = textColor;
        revenueChart.options.scales.y.ticks.font.family = font;
        revenueChart.options.scales.y.grid.color = gridColor;
        revenueChart.data.labels = isRTL 
            ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
        revenueChart.data.datasets[0].label = isRTL ? 'الإيرادات ($)' : 'Revenue ($)';
        revenueChart.data.datasets[1].label = isRTL ? 'المصروفات ($)' : 'Expenses ($)';
        revenueChart.update();
    }

    if (categoryChart) {
        categoryChart.options.plugins.legend.labels.color = textColor;
        categoryChart.options.plugins.legend.labels.font.family = font;
        categoryChart.data.labels = isRTL 
            ? ['إلكترونيات', 'أزياء', 'منزل ومطبخ', 'رياضة', 'أخرى'] 
            : ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Other'];
        categoryChart.update();
    }

    if (weeklyChart) {
        weeklyChart.options.scales.x.ticks.color = textColor;
        weeklyChart.options.scales.x.ticks.font.family = font;
        weeklyChart.options.scales.y.ticks.color = textColor;
        weeklyChart.options.scales.y.ticks.font.family = font;
        weeklyChart.options.scales.y.grid.color = gridColor;
        weeklyChart.data.labels = isRTL 
            ? ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
            : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        weeklyChart.data.datasets[0].label = isRTL ? 'الطلبات اليومية' : 'Daily Orders';
        weeklyChart.update();
    }
}
