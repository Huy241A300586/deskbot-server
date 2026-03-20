<template>
  <div class="device-item">
    <div class="device-item__top">
      <div class="device-item__identity">
        <div class="device-item__avatar">{{ ((device.agentName || 'DeskBot').slice(0, 2)).toUpperCase() }}</div>
        <div class="device-item__copy">
          <div class="device-item__eyebrow">DeskBot Agent</div>
          <div class="device-item__title">{{ device.agentName || 'DeskBot Agent' }}</div>
          <div class="device-item__meta-row">
            <span class="device-item__meta-chip">Agent ID: {{ device.agentId }}</span>
            <span class="device-item__meta-chip">Thiết bị: {{ device.deviceCount }}</span>
          </div>
        </div>
      </div>

      <div class="device-item__tools">
        <button type="button" class="icon-btn icon-btn--danger" @click.stop="handleDelete">
          <img src="@/assets/home/delete.png" alt="" />
        </button>
        <el-tooltip class="item" effect="dark" :content="device.systemPrompt" placement="top" popper-class="custom-tooltip">
          <button type="button" class="icon-btn">
            <img src="@/assets/home/info.png" alt="" />
          </button>
        </el-tooltip>
      </div>
    </div>

    <div class="device-summary-grid">
      <div class="device-summary-card">
        <div class="device-summary-card__label">{{ $t('home.languageModel') }}</div>
        <div class="device-summary-card__value">{{ device.llmModelName || 'Chưa cấu hình' }}</div>
        <div class="device-summary-card__foot">Điều phối suy luận chính</div>
      </div>
      <div class="device-summary-card">
        <div class="device-summary-card__label">{{ $t('home.voiceModel') }}</div>
        <div class="device-summary-card__value">{{ device.ttsModelName || 'Chưa cấu hình' }}</div>
        <div class="device-summary-card__foot">{{ device.ttsVoiceName || 'Chưa chọn voice' }}</div>
      </div>
    </div>

    <div class="device-insights">
      <div class="device-insight">
        <span class="device-insight__label">Memory</span>
        <span class="device-insight__value">{{ device.memModelId === 'Memory_nomem' ? 'Tắt' : 'Bật' }}</span>
      </div>
      <div class="device-insight">
        <span class="device-insight__label">{{ $t('home.lastConversation') }}</span>
        <span class="device-insight__value">{{ formattedLastConnectedTime }}</span>
      </div>
    </div>

    <div class="device-prompt-preview">
      <div class="device-prompt-preview__label">System Prompt</div>
      <div class="device-prompt-preview__text">{{ device.systemPrompt || 'Chưa có prompt hệ thống' }}</div>
    </div>

    <div class="device-actions">
      <div class="settings-btn settings-btn--primary" @click="handleConfigure">
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
  </div>
</template>

<script>
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
  padding: 22px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 249, 255, 0.98) 100%);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.device-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.device-item__identity {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
}

.device-item__avatar {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--deskbot-accent) 0%, #2a88f1 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 14px 24px rgba(28, 109, 242, 0.24);
}

.device-item__copy {
  min-width: 0;
}

.device-item__eyebrow {
  color: var(--deskbot-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.device-item__title {
  margin-top: 6px;
  color: var(--deskbot-text-strong);
  font-family: var(--deskbot-font-display);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.12;
  word-break: break-word;
}

.device-item__meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.device-item__meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--deskbot-surface-muted);
  color: var(--deskbot-text);
  font-size: 12px;
  font-weight: 700;
}

.device-item__tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.78);
  cursor: pointer;
}

.icon-btn img {
  width: 16px;
  height: 16px;
}

.icon-btn--danger:hover {
  background: rgba(214, 69, 69, 0.08);
}

.device-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.device-summary-card {
  padding: 16px;
  border-radius: 20px;
  background: var(--deskbot-surface-muted);
  text-align: left;
}

.device-summary-card__label,
.device-insight__label,
.device-prompt-preview__label {
  color: var(--deskbot-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.device-summary-card__value {
  margin-top: 10px;
  color: var(--deskbot-text-strong);
  font-size: 14px;
  line-height: 1.55;
  font-weight: 700;
  word-break: break-word;
}

.device-summary-card__foot {
  margin-top: 10px;
  color: var(--deskbot-text);
  font-size: 12px;
  line-height: 1.5;
}

.device-insights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.device-insight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.device-insight__value {
  color: var(--deskbot-text-strong);
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

.device-prompt-preview {
  margin-top: 14px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(28, 109, 242, 0.06) 0%, rgba(255, 255, 255, 0.74) 100%);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.device-prompt-preview__text {
  margin-top: 10px;
  color: var(--deskbot-text);
  font-size: 13px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.device-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.settings-btn {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border-radius: 16px;
  background: rgba(28, 109, 242, 0.08);
  color: var(--deskbot-accent-strong);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
}

.settings-btn--primary {
  background: linear-gradient(135deg, var(--deskbot-accent) 0%, #2a88f1 100%);
  color: #ffffff;
  box-shadow: 0 14px 24px rgba(28, 109, 242, 0.22);
}

.disabled-btn {
  background: #edf1f6;
  color: #97a6bd;
  cursor: not-allowed;
}

html.dark-mode .device-item {
  background: linear-gradient(180deg, rgba(12, 23, 40, 0.96) 0%, rgba(15, 27, 49, 0.94) 100%);
  border-color: rgba(130, 152, 187, 0.16);
}

html.dark-mode .device-item__meta-chip,
html.dark-mode .device-summary-card,
html.dark-mode .icon-btn,
html.dark-mode .device-insight,
html.dark-mode .device-prompt-preview {
  background: rgba(19, 35, 61, 0.76);
  border-color: rgba(130, 152, 187, 0.14);
}

html.dark-mode .settings-btn {
  background: rgba(62, 131, 255, 0.16);
  color: #dceaff;
}

html.dark-mode .settings-btn--primary {
  background: linear-gradient(135deg, var(--deskbot-accent) 0%, #2a88f1 100%);
  color: #ffffff;
}

html.dark-mode .disabled-btn {
  background: rgba(130, 152, 187, 0.12);
  color: #8fa3c6;
}

@media (max-width: 560px) {
  .device-summary-grid,
  .device-insights,
  .device-actions {
    grid-template-columns: 1fr;
  }

  .device-item__top {
    flex-direction: column;
  }

  .device-item__tools {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

<style>
.custom-tooltip {
  max-width: 400px;
  word-break: break-word;
}
</style>
