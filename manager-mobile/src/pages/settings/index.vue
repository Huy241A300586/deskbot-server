<route lang="jsonc" type="page">{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "Cài đặt",
    "navigationStyle": "custom"
  }
}</route>

<script lang="ts" setup>
import { t } from '@/i18n'
import { clearServerBaseUrlOverride, getEnvBaseUrl, getServerBaseUrlOverride, setServerBaseUrlOverride } from '@/utils'
import { isMp } from '@/utils/platform'
import { computed, onMounted, reactive, ref } from 'vue'
import { useThemeStore } from '@/store/theme'
import { useToast } from 'wot-design-uni'

defineOptions({
  name: 'SettingsPage',
})

const toast = useToast()

// 缓存信息
const cacheInfo = reactive({
  storageSize: '0MB',
  imageCache: '0MB',
  dataCache: '0MB',
})

// 服务端地址设置
const baseUrlInput = ref('')
const urlError = ref('')

// 系统信息（保留）
const systemInfo = computed(() => {
  const info = uni.getSystemInfoSync()
  return `${info.platform} ${info.system}`
})

// 读取本地覆盖地址
function loadServerBaseUrl() {
  const override = getServerBaseUrlOverride()
  baseUrlInput.value = override || getEnvBaseUrl()
}

// 获取缓存信息
function getCacheInfo() {
  try {
    const info = uni.getStorageInfoSync()
    const totalSize = (info.currentSize || 0) / 1024 // KB to MB
    cacheInfo.storageSize = `${totalSize.toFixed(2)}MB`
  }
  catch (error) {
    console.error('获取缓存信息失败:', error)
  }
}

// 验证URL格式
function validateUrl() {
  urlError.value = ''

  if (!baseUrlInput.value) {
    return
  }

  if (!/^https?:\/\/.+\/xiaozhi$/.test(baseUrlInput.value)) {
    urlError.value = t('settings.validServerUrl')
  }
}

// 测试服务端地址
async function testServerBaseUrl() {
  // 先清除错误信息
  urlError.value = ''

  if (!baseUrlInput.value || !/^https?:\/\/.+\/xiaozhi$/.test(baseUrlInput.value)) {
    return false
  }

  try {
    const response = await uni.request({
      url: `${baseUrlInput.value}/api/ping`,
      method: 'GET',
      timeout: 3000
    })

    if (response.statusCode === 200) {
      return true
    } else {
      toast.error(t('message.invalidAddress'))
      return false
    }
  } catch (error) {
    console.error('测试服务端地址失败:', error)
    toast.error(t('message.invalidAddress'))
    return false
  }
}

// 保存服务端地址
async function saveServerBaseUrl() {
  if (!baseUrlInput.value || !/^https?:\/\/.+\/xiaozhi$/.test(baseUrlInput.value)) {
    toast.warning(t('settings.validServerUrl'))
    return
  }

  // 测试地址有效性
  const isServerValid = await testServerBaseUrl()
  if (!isServerValid) {
    return
  }
  setServerBaseUrlOverride(baseUrlInput.value)

  // 切换请求地址后清空所有缓存
  clearAllCacheAfterUrlChange()

  uni.showModal({
    title: t('settings.restartApp'),
    content: t('settings.serverUrlSavedAndCacheCleared'),
    confirmText: t('settings.restartNow'),
    cancelText: t('settings.restartLater'),
    success: (res) => {
      if (res.confirm) {
        restartApp()
      }
      else {
        toast.success(t('settings.restartSuccess'))
      }
    },
  })
}

const themeStore = useThemeStore()

// 重置为 env 默认
function resetServerBaseUrl() {
  clearServerBaseUrlOverride()
  baseUrlInput.value = getEnvBaseUrl()

  // 切换请求地址后清空所有缓存
  clearAllCacheAfterUrlChange()

  uni.showModal({
    title: t('settings.restartApp'),
    content: t('settings.resetToDefaultAndCacheCleared'),
    confirmText: t('settings.restartNow'),
    cancelText: t('settings.restartLater'),
    success: (res) => {
      if (res.confirm) {
        restartApp()
      }
      else {
        toast.success(t('settings.resetSuccess'))
      }
    },
  })
}

// 重启应用（App 原生重启；其他端回到首页）
function restartApp() {
  // #ifdef APP-PLUS
  plus.runtime.restart()
  // #endif
  // #ifndef APP-PLUS
  uni.reLaunch({ url: '/pages/index/index' })
  // #endif
}

// 切换地址后自动清空所有缓存
function clearAllCacheAfterUrlChange() {
  try {
    // 备份运行时覆盖地址，确保清理后恢复
    const preservedOverride = getServerBaseUrlOverride()

    // 完全清空所有缓存，包括token
    uni.clearStorageSync()

    // 清空localStorage（H5环境）
    // #ifdef H5
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    // #endif

    // 恢复运行时覆盖地址（如有），需要在清理完成后再写入
    if (preservedOverride) {
      setServerBaseUrlOverride(preservedOverride)
    }

    // 重新获取缓存信息
    getCacheInfo()
  } catch (error) {
    console.error('清除缓存失败:', error)
  }
}

// 清除缓存
async function clearCache() {
  try {
    uni.showModal({
      title: t('settings.confirmClear'),
      content: t('settings.confirmClearMessage'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          clearAllCacheAfterUrlChange()
          toast.success(t('settings.cacheCleared'))

          // 延迟跳转到登录页
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/index' })
          }, 1500)
        }
      },
    })
  } catch (error) {
    console.error('清除缓存失败:', error)
    toast.error(t('settings.clearCacheFailed'))
  }
}

// 关于我们
function showAbout() {
  uni.showModal({
    title: t('settings.aboutApp', { appName: import.meta.env.VITE_APP_TITLE }),
    content: t('settings.aboutContent', {
      appName: import.meta.env.VITE_APP_TITLE,
      version: '0.9.1'
    }),
    showCancel: false,
    confirmText: t('common.confirm'),
  })
}

onMounted(async () => {
  // 仅在非小程序环境加载服务端地址设置
  if (!isMp) {
    loadServerBaseUrl()
  }
  getCacheInfo()

  // 动态设置导航栏标题为国际化文本
  uni.setNavigationBarTitle({
    title: t('settings.pageTitle')
  })
})
</script>

<template>
  <view class="min-h-screen settings-page">
    <wd-navbar :title="t('settings.title')" placeholder safe-area-inset-top fixed />

    <view class="p-[24rpx]">
      <!-- Cài đặt mạng -->
      <view v-if="!isMp" class="mb-[32rpx]">
        <view class="mb-[24rpx] flex items-center">
          <text class="text-[32rpx] section-title">
            {{ t('settings.networkSettings') }}
          </text>
        </view>

        <view class="section-card overflow-hidden"">
          <view class="mb-[24rpx]">
            <text class="text-[28rpx] row-title">
              {{ t('settings.serverApiUrl') }}
            </text>
            <text class="mt-[8rpx] block text-[24rpx] row-subtitle">
              {{ t('settings.modifyWillClearCache') }}
            </text>
          </view>

          <view class="mb-[24rpx]">
            <view class="w-full field-shell overflow-hidden">
              <wd-input v-model="baseUrlInput" type="text" clearable :maxlength="200"
                :placeholder="t('settings.enterServerUrl')"
                custom-class="!border-none !bg-transparent h-[64rpx] px-[24rpx] items-center"
                input-class="settings-input" @input="validateUrl" @blur="validateUrl" />
            </view>
            <text v-if="urlError" class="mt-[8rpx] block text-[24rpx] text-[#ff4d4f]">
              {{ urlError }}
            </text>
          </view>

          <view class="flex gap-[16rpx]">
            <wd-button type="primary"
              custom-class="flex-1 h-[88rpx] rounded-[20rpx] text-[28rpx] font-semibold bg-[#336cff] border-none shadow-[0_4rpx_16rpx_rgba(51,108,255,0.3)] active:shadow-[0_2rpx_8rpx_rgba(51,108,255,0.4)] active:scale-98"
              @click="saveServerBaseUrl">
              {{ t('settings.saveSettings') }}
            </wd-button>
            <wd-button type="default"
              custom-class="btn-secondary flex-1 h-[88rpx] rounded-[20rpx] text-[28rpx] font-semibold"
              @click="resetServerBaseUrl">
              {{ t('settings.resetDefault') }}
            </wd-button>
          </view>
        </view>
      </view>

      <!-- Quản lý bộ nhớ đệm -->
      <view class="mb-[32rpx]">
        <view class="mb-[24rpx] flex items-center">
          <text class="text-[32rpx] section-title">
            {{ t('settings.cacheManagement') }}
          </text>
        </view>

        <view class="section-card"">
          <view class="space-y-[16rpx]">
            <!-- 缓存信息展示，参考插件样式 -->
            <view
              class="setting-row transition-all active:bg-[#eef3ff]">
              <view>
                <text class="text-[28rpx] row-title">
                  {{ t('settings.totalCacheSize') }}
                </text>
                <text class="mt-[4rpx] block text-[24rpx] row-subtitle">
                  {{ t('settings.appDataSize') }}
                </text>
              </view>
              <text class="text-[28rpx] row-subtitle font-semibold">
                {{ cacheInfo.storageSize }}
              </text>
            </view>

            <!-- 清除缓存按钮，参考插件编辑按钮样式 -->
            <view
              class="setting-row">
              <view>
                <text class="text-[28rpx] row-title">
                  {{ t('settings.cacheClear') }}
                </text>
                <text class="mt-[4rpx] block text-[24rpx] row-subtitle">
                  {{ t('settings.clearAllCache') }}
                </text>
              </view>
              <view
                class="danger-chip cursor-pointer rounded-[24rpx] px-[28rpx] py-[16rpx] text-[24rpx] font-semibold transition-all duration-300 active:scale-95 active:bg-[#ff6b6b] active:text-white"
                @click="clearCache">
                {{ t('settings.clearCache') }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Thông tin ứng dụng -->
      <view class="mb-[32rpx]">
        <view class="mb-[24rpx] flex items-center">
          <text class="text-[32rpx] section-title">
            {{ t('settings.appInfo') }}
          </text>
        </view>

        <view class="section-card"">
          <view
            class="setting-row cursor-pointer transition-all active:bg-[#eef3ff]"
            @click="showAbout">
            <view>
              <text class="text-[28rpx] row-title">
                {{ t('settings.aboutUs') }}
              </text>
              <text class="mt-[4rpx] block text-[24rpx] row-subtitle">
                {{ t('settings.appVersion') }}
              </text>
            </view>
            <wd-icon name="arrow-right" custom-class="text-[32rpx] row-subtitle" />
          </view>
        </view>
      </view>

      <!-- Giao diện -->
      <view class="mb-[32rpx]">
        <view class="mb-[24rpx] flex items-center">
          <text class="section-title">Giao diện</text>
        </view>

        <view class="section-card">
          <view class="setting-row">
            <view>
              <text class="row-title">Chế độ tối</text>
              <text class="row-subtitle">Bật giao diện tối cho bản mobile</text>
            </view>
            <wd-switch :model-value="themeStore.isDark" @change="themeStore.toggleTheme()" />
          </view>
        </view>
      </view>

      <!-- Khoảng đệm an toàn phía dưới -->
      <!-- Khoảng đệm an toàn phía dưới -->
      <view style="height: env(safe-area-inset-bottom);" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.settings-page {
  background: var(--page-bg);
  color: var(--text-primary);
}

.section-title { color: var(--text-primary); font-size: 32rpx; font-weight: 700; }
.section-card { border: 1rpx solid var(--border-color); border-radius: 24rpx; background: var(--card-bg); padding: 32rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,.06); }
.setting-row { display:flex; align-items:center; justify-content:space-between; border:1rpx solid var(--border-color); border-radius:16rpx; background: var(--surface-bg); padding:24rpx; gap:24rpx; }
.row-title { display:block; font-size: 28rpx; color: var(--text-primary); font-weight: 600; }
.row-subtitle { display:block; margin-top: 4rpx; font-size:24rpx; color: var(--text-secondary); }


.field-shell { border: 1rpx solid var(--border-color); border-radius: 16rpx; background: var(--surface-bg); }
:deep(.settings-input) { color: var(--text-primary) !important; font-size: 28rpx; }
:deep(.settings-input::placeholder) { color: var(--text-secondary) !important; }
.btn-secondary { background: var(--surface-bg) !important; border-color: var(--border-color) !important; color: var(--text-secondary) !important; }
.danger-chip { background: rgba(255,107,107,.12); color: #ff6b6b; }
</style>
