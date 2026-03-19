<script lang="ts" setup>
import type { ConfigProviderThemeVars } from 'wot-design-uni'
import { computed } from 'vue'
import { useThemeStore } from '@/store/theme'
import FgTabbar from './fg-tabbar/fg-tabbar.vue'

const themeStore = useThemeStore()
const themeVars = computed<ConfigProviderThemeVars>(() => ({
  colorTheme: '#4d80f0',
  navbarBackground: themeStore.isDark ? '#111827' : '#ffffff',
  navbarColor: themeStore.isDark ? '#f3f4f6' : '#232338',
  cellBackground: themeStore.isDark ? '#111827' : '#ffffff',
  cellTitleColor: themeStore.isDark ? '#f3f4f6' : '#232338',
  cellLabelColor: themeStore.isDark ? '#94a3b8' : '#9d9ea3',
}))
</script>

<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
    <FgTabbar />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>
