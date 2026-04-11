import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/landing',
    name: 'Landing',
    component: () => import('../views/LandingView.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sellers',
    name: 'Sellers',
    component: () => import('../views/SellersView.vue'),
    meta: { requiresAuth: true, denyRoles: ['seller'] }
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('../views/ConfigView.vue'),
    meta: { requiresAuth: true, requiresManager: true }
  },
  {
    path: '/summaries',
    name: 'Summaries',
    component: () => import('../views/SummariesView.vue'),
    meta: { requiresAuth: true, requiresManager: true }
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: () => import('../views/IntegrationsView.vue'),
    meta: { requiresAuth: true, requiresManager: true }
  },
  {
    path: '/leads',
    name: 'Leads',
    component: () => import('../views/LeadsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true, requiresManager: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    redirect: '/admin/tenants',
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/admin/tenants',
    name: 'AdminTenants',
    component: () => import('../views/admin/TenantsView.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/admin/tenants/:id',
    name: 'AdminTenantDetail',
    component: () => import('../views/admin/TenantDetailView.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/landing'
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
