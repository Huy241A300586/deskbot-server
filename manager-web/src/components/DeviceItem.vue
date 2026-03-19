<template>
  <div class="device-item">
    <div class="device-item__top">
      <div>
        <div class="device-item__title">{{ device.agentName }}</div>
        <div class="device-item__meta">Agent ID: {{ device.agentId }}</div>
      </div>
      <div class="device-item__tools">
        <button class="icon-btn" @click.stop="handleDelete">
          <img src="@/assets/home/delete.png" alt="" />
        </button>
        <el-tooltip class="item" effect="dark" :content="device.systemPrompt" placement="top" popper-class="custom-tooltip">
          <button class="icon-btn">
            <img src="@/assets/home/info.png" alt="" />
          </button>
        </el-tooltip>
      </div>
    </div>

    <div class="device-summary-grid">
      <div class="device-summary-card">
        <div class="device-summary-card__label">{{ $t('home.languageModel') }}</div>
        <div class="device-summary-card__value">{{ device.llmModelName }}</div>
      </div>
      <div class="device-summary-card">
        <div class="device-summary-card__label">{{ $t('home.voiceModel') }}</div>
        <div class="device-summary-card__value">{{ device.ttsModelName }} ({{ device.ttsVoiceName }})</div>
      </div>
    </div>

    <div class="device-actions">
      <div class="settings-btn" @click="handleConfigure">
        {{ $t('home.configureRole') }}
      </div>
      <div v-if="featureStatus.voiceprintRecognition" class="settings-btn" @click="handleVoicePrint">
        {{ $t('home.voiceprintRecognition') }}
      </div>
      <div class="settings-btn" @click="handleDeviceManage">
        {{ $t('home.deviceManagement') }} ({{ device.deviceCount }})
      </div>
      <div :class="['settings-btn', { 'disabled-btn': device.memModelId === 'Memory_nomem' }]" @click="handleChatHistory">
        <el-tooltip v-if="device.memModelId === 'Memory_nomem'" :content="$t('home.enableMemory')" placement="top">
          <span>{{ $t('home.chatHistory') }}</span>
        </el-tooltip>
        <span v-else>{{ $t('home.chatHistory') }}</span>
      </div>
    </div>

    <div class="version-info">
      <div>{{ $t('home.lastConversation') }}</div>
      <div class="version-info__value">{{ formattedLastConnectedTime }}</div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n';

export default {
  name: 'DeviceItem',
  props: {
    device: { type: Object, required: true },
    featureStatus: { 
      type: Object, 
      default: () => ({
        voiceprintRecognition: false,
        voiceClone: false,
        knowledgeBase: false
      })
    }
  },
  data() {
    return { switchValue: false }
  },
  computed: {
    formattedLastConnectedTime() {
      if (!this.device.lastConnectedAt) return this.$t('home.noConversation');

      const lastTime = new Date(this.device.lastConnectedAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));

      if (diffMinutes <= 1) {
        return this.$t('home.justNow');
      } else if (diffMinutes < 60) {
        return this.$t('home.minutesAgo', { minutes: diffMinutes });
      } else if (diffMinutes < 24 * 60) {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return this.$t('home.hoursAgo', { hours, minutes });
      } else {
        return this.device.lastConnectedAt;
      }
    }
  },
  methods: {
    handleDelete() {
      this.$emit('delete', this.device.agentId)
    },
    handleConfigure() {
      this.$router.push({ path: '/role-config', query: { agentId: this.device.agentId } });
    },
    handleVoicePrint() {
      this.$router.push({ path: '/voice-print', query: { agentId: this.device.agentId } });
    },
    handleDeviceManage() {
      this.$router.push({ path: '/device-management', query: { agentId: this.device.agentId } });
    },
    handleChatHistory() {
      if (this.device.memModelId === 'Memory_nomem') {
        return
      }
      this.$emit('chat-history', { agentId: this.device.agentId, agentName: this.device.agentName })
    }
  }
}
</script>
<style scoped>
.device-item {
  width: 100%;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  padding: 22px;
  box-sizing: border-box;
  border: 1px solid #e7edf8;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.device-item__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.device-item__title {
  font-weight: 800;
  font-size: 20px;
  text-align: left;
  color: #162033;
}

.device-item__meta {
  margin-top: 6px;
  font-size: 12px;
  color: #7b88a8;
  text-align: left;
}

.device-item__tools {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid #e7edf8;
  background: #f8fbff;
  cursor: pointer;
}

.icon-btn img {
  width: 16px;
  height: 16px;
}

.device-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.device-summary-card {
  border-radius: 18px;
  padding: 14px;
  background: #eff4ff;
  text-align: left;
}

.device-summary-card__label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7aa5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.device-summary-card__value {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: #22304a;
  word-break: break-word;
}

.device-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
}

.settings-btn {
  font-weight: 700;
  font-size: 12px;
  color: #365acb;
  background: #e8efff;
  width: auto;
  padding: 0 14px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 999px;
}

.version-info {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #eef2f8;
  font-size: 12px;
  color: #7b88a8;
  font-weight: 500;
}

.version-info__value {
  color: #22304a;
  font-weight: 700;
}

.disabled-btn {
  background: #edf0f5;
  color: #99a3b8;
  cursor: not-allowed;
}
</style>

<style>
.custom-tooltip {
  max-width: 400px;
  word-break: break-word;
}

html.dark-mode .device-item {
  background: linear-gradient(180deg, #101a32 0%, #16213e 100%);
  border-color: #22304a;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
}

html.dark-mode .device-item__title,
html.dark-mode .version-info__value,
html.dark-mode .device-summary-card__value {
  color: #e5ecf6;
}

html.dark-mode .device-item__meta,
html.dark-mode .version-info,
html.dark-mode .device-summary-card__label {
  color: #9fb0d3;
}

html.dark-mode .device-summary-card,
html.dark-mode .icon-btn {
  background: rgba(87, 120, 255, 0.12);
  border-color: rgba(148, 163, 184, 0.18);
}

html.dark-mode .settings-btn {
  background: rgba(87, 120, 255, 0.18);
  color: #dce6ff;
}

html.dark-mode .disabled-btn {
  background: rgba(148, 163, 184, 0.14);
  color: #8fa0c2;
}

html.dark-mode .version-info {
  border-top-color: #22304a;
}
</style>