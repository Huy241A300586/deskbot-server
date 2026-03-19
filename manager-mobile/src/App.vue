<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { watch, onMounted } from 'vue'
import { usePageAuth } from '@/hooks/usePageAuth'
import { useConfigStore } from '@/store'
import { t } from '@/i18n'
import { useLangStore } from '@/store/lang'
import { useThemeStore } from '@/store/theme'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

usePageAuth()

const configStore = useConfigStore()
const langStore = useLangStore()
const themeStore = useThemeStore()

onLaunch(() => {
  console.log('App Launch')
  // 获取公共配置
  configStore.fetchPublicConfig().catch((error) => {
    console.error('获取公共配置失败:', error)
  })
})
onShow(() => {
  console.log('App Show')
  // 使用setTimeout延迟执行，确保tabBar已经初始化
  setTimeout(() => {
    updateTabBarText()
  }, 100)
})

// 动态更新tabBar文本
function updateTabBarText() {
  try {
    // 设置首页tabBar文本
    uni.setTabBarItem({
      index: 0,
      text: t('tabBar.home'),
      success: () => {},
      fail: (err) => {
        console.log('设置首页tabBar文本失败:', err)
      }
    })
    
    // 设置配网tabBar文本
    uni.setTabBarItem({
      index: 1,
      text: t('tabBar.deviceConfig'),
      success: () => {},
      fail: (err) => {
        console.log('设置配网tabBar文本失败:', err)
      }
    })
    
    // 设置系统tabBar文本
    uni.setTabBarItem({
      index: 2,
      text: t('tabBar.settings'),
      success: () => {},
      fail: (err) => {
        console.log('设置系统tabBar文本失败:', err)
      }
    })
  } catch (error) {
    console.log('更新tabBar文本时出错:', error)
  }
}
// 监听语言切换事件
onMounted(() => {
  watch(() => langStore.currentLang, () => {
    updateTabBarText()
  })
  watch(() => themeStore.mode, (mode) => {
    try {
      uni.setTabBarStyle({
        color: mode === 'dark' ? '#94a3b8' : '#9d9ea3',
        selectedColor: '#667dea',
        backgroundColor: mode === 'dark' ? '#111827' : '#ffffff',
        borderStyle: mode === 'dark' ? 'white' : 'black',
      })
    }
    catch (error) {
      console.log('Cập nhật giao diện tabbar thất bại:', error)
    }
  }, { immediate: true })
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
page, body {
  background: var(--page-bg);
  color: var(--text-primary);
}

:root, page {
  --page-bg: #f5f7fb;
  --card-bg: #fbfbfb;
  --surface-bg: #f5f7fb;
  --border-color: #eeeeee;
  --text-primary: #232338;
  --text-secondary: #9d9ea3;
}

html.dark-mode, body.dark-mode {
  --page-bg: #0f172a;
  --card-bg: #111827;
  --surface-bg: #1f2937;
  --border-color: #334155;
  --text-primary: #f3f4f6;
  --text-secondary: #94a3b8;
}
swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}
</style>
