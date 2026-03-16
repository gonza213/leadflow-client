import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)

  // Dark mode - check localStorage or system preference
  const savedDarkMode = localStorage.getItem('darkMode')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const darkMode = ref(savedDarkMode ? savedDarkMode === 'true' : systemPrefersDark)

  // Apply dark mode class to document
  function applyDarkMode() {
    const html = document.documentElement
    if (darkMode.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    // Force style recalculation
    html.style.colorScheme = darkMode.value ? 'dark' : 'light'
  }

  // Initialize on load
  applyDarkMode()

  // Watch for changes
  watch(darkMode, (newValue) => {
    localStorage.setItem('darkMode', newValue.toString())
    applyDarkMode()
  })

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    localStorage.setItem('darkMode', darkMode.value.toString())
    applyDarkMode()
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function openSidebar() {
    sidebarOpen.value = true
  }

  return {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    darkMode,
    toggleDarkMode
  }
})
