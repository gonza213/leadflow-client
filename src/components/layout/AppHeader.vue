<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import HelpModal from './HelpModal.vue'

const { t, locale } = useI18n()

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const showHelp = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const currentLang = ref((typeof window !== 'undefined' && localStorage.getItem('user-locale')) || 'es')
const showLangMenu = ref(false)

const setLanguage = (newLocale) => {
  locale.value = newLocale
  currentLang.value = newLocale
  localStorage.setItem('user-locale', newLocale)
  document.documentElement.lang = newLocale
  showLangMenu.value = false
}

const languages = [
  { code: 'es', label: 'Castellano', flag: 'https://flagcdn.com/w40/ar.png' },
  { code: 'pt-BR', label: 'Português', flag: 'https://flagcdn.com/w40/br.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' }
]

const getLangData = (code) => languages.find(l => l.code === code) || languages[0]

const handleToggleDarkMode = () => {
  uiStore.toggleDarkMode()
}
</script>

<template>
<header id="tour-header"
  class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 transition-colors">
  <div class="flex items-center justify-between h-full px-4 lg:px-6">
    <div class="flex items-center gap-3">
      <!-- Hamburger menu (mobile) -->
      <button @click="uiStore.toggleSidebar"
        class="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <a href="/" class="flex items-center gap-2 transition-opacity hover:opacity-90">
        <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-12 dark:brightness-0 dark:invert" />
      </a>
      <span v-if="authStore.user?.tenant"
        class="hidden sm:inline-flex px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
        {{ authStore.user.tenant.name }}
      </span>
    </div>

    <div class="flex items-center gap-2 lg:gap-3">
      <!-- Language dropdown -->
      <div class="relative">
        <button 
          @click="showLangMenu = !showLangMenu"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          :title="t('ui.changeLang')"
        >
          <img :src="getLangData(currentLang).flag" :alt="getLangData(currentLang).code" class="w-5 h-auto rounded-sm shadow-sm" />
          <span class="hidden xs:inline uppercase">{{ currentLang.split('-')[0] }}</span>
          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showLangMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </button>

        <!-- Dropdown menu -->
        <div v-if="showLangMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[60] py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            @click="setLanguage(lang.code)"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': currentLang === lang.code, 'text-gray-700 dark:text-gray-300': currentLang !== lang.code }"
          >
            <img :src="lang.flag" :alt="lang.code" class="w-5 h-auto rounded-sm shadow-sm" />
            <span class="font-medium">{{ lang.label }}</span>
            <svg v-if="currentLang === lang.code" class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
        </div>

        <!-- Overlay to close menu -->
        <div v-if="showLangMenu" @click="showLangMenu = false" class="fixed inset-0 z-[-1]"></div>
      </div>

      <!-- Dark mode toggle -->
      <button id="tour-darkmode" @click="handleToggleDarkMode"
        class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        :title="uiStore.darkMode ? t('ui.lightMode') : t('ui.darkMode')">
        <svg v-if="uiStore.darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- Help button -->
      <button id="tour-help-btn" @click="showHelp = true"
        class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        :title="t('ui.help')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" stroke-width="2.5" />
        </svg>
      </button>

      <div class="hidden sm:block text-right">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.name }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ authStore.user?.role }}</p>
      </div>
      <button @click="handleLogout"
        class="px-3 lg:px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <span class="hidden sm:inline">{{ t('auth.logout') }}</span>
        <svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </div>
</header>

<!-- Help Modal -->
<HelpModal v-if="showHelp" @close="showHelp = false" />
</template>
