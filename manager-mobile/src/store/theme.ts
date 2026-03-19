import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

function applyTheme(mode: ThemeMode) {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark-mode', mode === 'dark')
    document.body.classList.toggle('dark-mode', mode === 'dark')
    document.documentElement.setAttribute('data-theme', mode)
  }
  // #endif
  uni.setStorageSync('theme_mode', mode)
}

export const useThemeStore = defineStore('theme', () => {
  const saved = (uni.getStorageSync('theme_mode') || 'light') as ThemeMode
  const mode = ref<ThemeMode>(saved === 'dark' ? 'dark' : 'light')

  const isDark = computed(() => mode.value === 'dark')

  function setTheme(next: ThemeMode) {
    mode.value = next
    applyTheme(next)
  }

  function toggleTheme() {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  applyTheme(mode.value)
  watch(mode, value => applyTheme(value))

  return { mode, isDark, setTheme, toggleTheme }
}, {
  persist: {
    key: 'theme',
    serializer: {
      serialize: state => JSON.stringify(state.mode),
      deserialize: value => ({ mode: JSON.parse(value) || 'light' }),
    },
  },
})
