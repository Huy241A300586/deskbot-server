import { ref } from 'vue'

const messages = {
  vi,
}

import vi from './vi'

export type Language = 'vi'

const currentLang = ref<Language>('vi')

export function initI18n() {
  currentLang.value = 'vi'
  try {
    uni.setStorageSync('app_language', 'vi')
  }
  catch (e) {}
}

export function changeLanguage(_lang: Language) {
  currentLang.value = 'vi'
  try {
    uni.setStorageSync('app_language', 'vi')
  }
  catch (e) {}
}

export function t(key: string, params?: Record<string, string | number>): string {
  const langMessages = messages[currentLang.value]
  if (langMessages && typeof langMessages === 'object' && key in langMessages) {
    let value = langMessages[key]
    if (typeof value === 'string') {
      if (params) {
        let result = value
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const regex = new RegExp(`\{${paramKey}\}`, 'g')
          result = result.replace(regex, String(paramValue))
        })
        return result
      }
      return value
    }
  }
  return key
}

export function getCurrentLanguage(): Language {
  return 'vi'
}

export function getSupportedLanguages(): { code: Language, name: string }[] {
  return [{ code: 'vi', name: 'Tiếng Việt' }]
}
