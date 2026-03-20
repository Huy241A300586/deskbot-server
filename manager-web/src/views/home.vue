<template>
  <div class="welcome">
    <HeaderBar :devices="devices" @search="handleSearch" @search-reset="handleSearchReset" />
    <el-main class="home-main">
      <div class="home-shell">
        <section class="dashboard-hero">
          <div class="dashboard-hero__main">
            <div class="dashboard-hero__topline">
              <div class="dashboard-pill">
                <img loading="lazy" alt="" src="@/assets/deskbot-mark.svg" class="dashboard-pill__icon" />
                <span>DeskBot Console</span>
              </div>
              <div class="dashboard-state-pill">
                <span class="dashboard-state-pill__dot"></span>
                {{ isLoading ? 'Đang đồng bộ dữ liệu' : 'Sẵn sàng điều phối' }}
              </div>
            </div>
            <h1 class="dashboard-title">Bảng điều phối vận hành DeskBot</h1>
            <p class="dashboard-subtitle">
              Giữ nguyên toàn bộ hành vi hiện có, nhưng nâng shell quản trị lên một bề mặt desktop rõ ràng hơn cho
              giám sát agent, thiết bị và trạng thái hệ thống.
            </p>
            <div class="dashboard-actions">
              <button type="button" class="primary-action" @click="showAddDialog">{{ $t('home.addAgent') }}</button>
              <button type="button" class="secondary-action" @click="fetchAgentList">Làm mới danh sách</button>
            </div>
          </div>

          <div class="dashboard-hero__aside">
            <div class="hero-spotlight">
              <div class="hero-spotlight__label">Fleet Snapshot</div>
              <div class="hero-spotlight__value">{{ devices.length }}</div>
              <div class="hero-spotlight__copy">agent đang hiển thị trên dashboard</div>
            </div>
            <div class="hero-mini-grid">
              <div class="hero-mini-card">
                <div class="hero-mini-card__label">Nguồn dữ liệu</div>
                <div class="hero-mini-card__value">{{ isSearching ? 'Kết quả lọc' : 'Danh sách đầy đủ' }}</div>
              </div>
              <div class="hero-mini-card">
                <div class="hero-mini-card__label">Danh sách gốc</div>
                <div class="hero-mini-card__value">{{ originalDevices.length }}</div>
              </div>
              <div class="hero-mini-card">
                <div class="hero-mini-card__label">Module bật</div>
                <div class="hero-mini-card__value">
                  {{ Number(featureStatus.voiceprintRecognition) + Number(featureStatus.voiceClone) + Number(featureStatus.knowledgeBase) }}
                </div>
              </div>
              <div class="hero-mini-card">
                <div class="hero-mini-card__label">Knowledge Base</div>
                <div class="hero-mini-card__value">{{ featureStatus.knowledgeBase ? 'Bật' : 'Tắt' }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="fleet-panel">
          <div class="fleet-panel__header">
            <div class="fleet-panel__copy">
              <div class="fleet-panel__eyebrow">Agent Fleet</div>
              <div class="fleet-panel__title-row">
                <div class="fleet-panel__title">Danh sách agent và thiết bị</div>
                <div class="fleet-panel__summary">{{ devices.length }} mục</div>
              </div>
              <p class="fleet-panel__description">
                Tất cả thao tác cấu hình, quản lý thiết bị, xóa agent và lịch sử chat vẫn giữ nguyên như hiện tại.
              </p>
            </div>
            <div class="fleet-panel__badges">
              <div class="fleet-badge">Voice Clone: {{ featureStatus.voiceClone ? 'Bật' : 'Tắt' }}</div>
              <div class="fleet-badge">Voiceprint: {{ featureStatus.voiceprintRecognition ? 'Bật' : 'Tắt' }}</div>
              <div class="fleet-badge">Search: {{ isSearching ? 'Đang lọc' : 'Toàn bộ' }}</div>
            </div>
          </div>

          <div class="device-list-container">
            <template v-if="isLoading">
              <div v-for="i in skeletonCount" :key="'skeleton-' + i" class="skeleton-item">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line-short"></div>
                </div>
              </div>
            </template>

            <template v-else-if="devices.length">
              <DeviceItem
                v-for="(item, index) in devices"
                :key="index"
                :device="item"
                :feature-status="featureStatus"
                @configure="goToRoleConfig"
                @deviceManage="handleDeviceManage"
                @delete="handleDeleteAgent"
                @chat-history="handleShowChatHistory"
              />
            </template>

            <div v-else class="empty-state">
              <div class="empty-state__eyebrow">DeskBot Console</div>
              <div class="empty-state__title">Chưa có agent nào để hiển thị</div>
              <p class="empty-state__copy">
                Dữ liệu hiện tại đang trống hoặc bộ lọc chưa khớp. Bạn vẫn có thể giữ nguyên flow hiện tại và tải lại danh sách.
              </p>
              <button type="button" class="empty-state__action" @click="fetchAgentList">Tải lại dữ liệu</button>
            </div>
          </div>
        </section>
      </div>
      <AddWisdomBodyDialog :visible.sync="addDeviceDialogVisible" @confirm="handleWisdomBodyAdded" />
    </el-main>
    <el-footer>
      <version-footer />
    </el-footer>
    <chat-history-dialog :visible.sync="showChatHistory" :agent-id="currentAgentId" :agent-name="currentAgentName" />
  </div>
</template>

<script>
import Api from '@/apis/api';
import AddWisdomBodyDialog from '@/components/AddWisdomBodyDialog.vue';
import ChatHistoryDialog from '@/components/ChatHistoryDialog.vue';
import DeviceItem from '@/components/DeviceItem.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import VersionFooter from '@/components/VersionFooter.vue';
import featureManager from '@/utils/featureManager';

export default {
  name: 'HomePage',
  components: { DeviceItem, AddWisdomBodyDialog, HeaderBar, VersionFooter, ChatHistoryDialog },
  data() {
    return {
      addDeviceDialogVisible: false,
      devices: [],
      originalDevices: [],
      isSearching: false,
      searchRegex: null,
      isLoading: true,
      skeletonCount: localStorage.getItem('skeletonCount') || 8,
      showChatHistory: false,
      currentAgentId: '',
      currentAgentName: '',
      featureStatus: {
        voiceprintRecognition: false,
        voiceClone: false,
        knowledgeBase: false
      }
    }
  },

  async mounted() {
    this.fetchAgentList();
    await this.loadFeatureStatus();
  },

  methods: {
    async loadFeatureStatus() {
      await featureManager.waitForInitialization();
      const config = featureManager.getConfig();
      this.featureStatus = {
        voiceprintRecognition: config.voiceprintRecognition,
        voiceClone: config.voiceClone,
        knowledgeBase: config.knowledgeBase
      };
    },

    showAddDialog() {
      this.addDeviceDialogVisible = true
    },
    goToRoleConfig() {
      this.$router.push('/role-config')
    },
    handleWisdomBodyAdded(res) {
      this.fetchAgentList();
      this.addDeviceDialogVisible = false;
    },
    handleDeviceManage() {
      this.$router.push('/device-management');
    },
    handleSearch(keyword) {
      this.isSearching = true;
      this.isLoading = true;
      const isMac = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(keyword)
      const searchType = isMac ? 'mac' : 'name';
      Api.agent.searchAgent(keyword, searchType, ({ data }) => {
        if (data?.data) {
          this.devices = data.data.map(item => ({
            ...item,
            agentId: item.id
          }));
        }
        this.isLoading = false;
      }, (error) => {
        console.error('搜索智能体失败:', error);
        this.isLoading = false;
        this.$message.error(this.$t('message.searchFailed'));
      });
    },
    handleSearchReset() {
      this.isSearching = false;
      this.devices = [...this.originalDevices];
    },

    handleSearchResult(filteredList) {
      this.devices = filteredList;
    },
    fetchAgentList() {
      this.isLoading = true;
      Api.agent.getAgentList(({ data }) => {
        if (data?.data) {
          this.originalDevices = data.data.map(item => ({
            ...item,
            agentId: item.id
          }));

          this.skeletonCount = Math.min(
            Math.max(this.originalDevices.length, 3),
            10
          );

          this.handleSearchReset();
        }
        this.isLoading = false;
      }, (error) => {
        console.error('Failed to fetch agent list:', error);
        this.isLoading = false;
      });
    },
    handleDeleteAgent(agentId) {
      this.$confirm(this.$t('home.confirmDeleteAgent'), '提示', {
        confirmButtonText: this.$t('button.ok'),
        cancelButtonText: this.$t('button.cancel'),
        type: 'warning'
      }).then(() => {
        Api.agent.deleteAgent(agentId, (res) => {
          if (res.data.code === 0) {
            this.$message.success({
              message: this.$t('home.deleteSuccess'),
              showClose: true
            });
            this.fetchAgentList();
          } else {
            this.$message.error({
              message: res.data.msg || this.$t('home.deleteFailed'),
              showClose: true
            });
          }
        });
      }).catch(() => { });
    },
    handleShowChatHistory({ agentId, agentName }) {
      this.currentAgentId = agentId;
      this.currentAgentName = agentName;
      this.showChatHistory = true;
    }
  }
}
</script>

<style scoped>
.welcome {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.home-main {
  padding: 24px 24px 30px;
  display: flex;
  flex-direction: column;
}

.home-shell {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
  gap: 20px;
  padding: 30px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(133, 187, 255, 0.28), transparent 32%),
    linear-gradient(135deg, #0b1938 0%, #10306a 48%, #0a5f9a 100%);
  box-shadow: var(--deskbot-shadow-lg);
}

.dashboard-hero__main,
.dashboard-hero__aside {
  position: relative;
  z-index: 1;
}

.dashboard-hero__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard-pill,
.dashboard-state-pill {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.dashboard-pill {
  gap: 10px;
  background: rgba(255, 255, 255, 0.12);
  color: #edf4ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-pill__icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.dashboard-state-pill {
  gap: 10px;
  background: rgba(8, 25, 56, 0.34);
  color: rgba(236, 243, 255, 0.88);
  font-size: 13px;
  font-weight: 600;
}

.dashboard-state-pill__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #30d19c;
  box-shadow: 0 0 0 6px rgba(48, 209, 156, 0.16);
}

.dashboard-title {
  margin: 22px 0 14px;
  font-family: var(--deskbot-font-display);
  font-size: clamp(34px, 4vw, 54px);
  line-height: 1.04;
  letter-spacing: -0.03em;
  color: #ffffff;
}

.dashboard-subtitle {
  max-width: 680px;
  margin: 0;
  color: rgba(229, 238, 255, 0.82);
  font-size: 15px;
  line-height: 1.72;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.primary-action,
.secondary-action,
.empty-state__action {
  min-height: 46px;
  padding: 0 20px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.primary-action,
.empty-state__action {
  background: #ffffff;
  color: #14356d;
  box-shadow: 0 12px 24px rgba(8, 25, 56, 0.16);
}

.secondary-action {
  background: rgba(255, 255, 255, 0.12);
  color: #edf4ff;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.primary-action:hover,
.secondary-action:hover,
.empty-state__action:hover {
  transform: translateY(-1px);
}

.dashboard-hero__aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-spotlight {
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(16px);
}

.hero-spotlight__label,
.hero-mini-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(220, 231, 252, 0.7);
}

.hero-spotlight__value {
  margin-top: 14px;
  font-size: 44px;
  line-height: 1;
  font-weight: 800;
  color: #ffffff;
}

.hero-spotlight__copy {
  margin-top: 10px;
  color: rgba(229, 238, 255, 0.78);
  font-size: 13px;
  line-height: 1.6;
}

.hero-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hero-mini-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-mini-card__value {
  margin-top: 10px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.fleet-panel {
  padding: 26px;
  border-radius: 30px;
  background: var(--deskbot-surface);
  border: 1px solid var(--deskbot-border);
  box-shadow: var(--deskbot-shadow-md);
  backdrop-filter: blur(16px);
}

.fleet-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}

.fleet-panel__copy {
  min-width: 0;
}

.fleet-panel__eyebrow,
.empty-state__eyebrow {
  color: var(--deskbot-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.fleet-panel__title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.fleet-panel__title {
  color: var(--deskbot-text-strong);
  font-family: var(--deskbot-font-display);
  font-size: 28px;
  font-weight: 700;
}

.fleet-panel__summary {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--deskbot-accent-soft);
  color: var(--deskbot-accent-strong);
  font-size: 13px;
  font-weight: 700;
}

.fleet-panel__description {
  max-width: 760px;
  margin: 12px 0 0;
  color: var(--deskbot-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.fleet-panel__badges {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.fleet-badge {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--deskbot-surface-muted);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: var(--deskbot-text);
  font-size: 12px;
  font-weight: 700;
}

.device-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 22px;
  padding-top: 24px;
}

.device-item {
  margin: 0 !important;
  width: auto !important;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-item {
  position: relative;
  overflow: hidden;
  min-height: 180px;
  padding: 24px;
  border-radius: 24px;
  background: var(--deskbot-surface-strong);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.skeleton-image {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: var(--deskbot-surface-muted);
  float: left;
}

.skeleton-content {
  margin-left: 94px;
}

.skeleton-line,
.skeleton-line-short {
  border-radius: 999px;
  background: var(--deskbot-surface-muted);
}

.skeleton-line {
  width: 72%;
  height: 16px;
  margin-bottom: 14px;
}

.skeleton-line-short {
  width: 48%;
  height: 12px;
}

.skeleton-item::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 42%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.44), rgba(255, 255, 255, 0));
  animation: shimmer 1.5s infinite;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 42px 28px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(28, 109, 242, 0.06) 0%, rgba(255, 255, 255, 0.78) 100%);
  border: 1px dashed rgba(28, 109, 242, 0.24);
  text-align: center;
}

.empty-state__title {
  margin-top: 12px;
  color: var(--deskbot-text-strong);
  font-family: var(--deskbot-font-display);
  font-size: 28px;
  font-weight: 700;
}

.empty-state__copy {
  max-width: 620px;
  margin: 12px auto 0;
  color: var(--deskbot-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.empty-state__action {
  margin-top: 20px;
}

html.dark-mode .dashboard-hero {
  background:
    radial-gradient(circle at top left, rgba(62, 131, 255, 0.26), transparent 32%),
    linear-gradient(135deg, #081120 0%, #0d2347 48%, #0f4c75 100%);
}

html.dark-mode .fleet-panel {
  background: var(--deskbot-surface);
  border-color: rgba(130, 152, 187, 0.16);
}

html.dark-mode .fleet-badge,
html.dark-mode .skeleton-item,
html.dark-mode .empty-state {
  background: rgba(19, 35, 61, 0.72);
}

html.dark-mode .skeleton-image,
html.dark-mode .skeleton-line,
html.dark-mode .skeleton-line-short {
  background: rgba(130, 152, 187, 0.12);
}

html.dark-mode .empty-state {
  border-color: rgba(62, 131, 255, 0.24);
}

@media (max-width: 1180px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .home-main {
    padding: 18px 18px 24px;
  }

  .dashboard-hero,
  .fleet-panel {
    padding: 22px;
    border-radius: 24px;
  }

  .dashboard-actions,
  .fleet-panel__badges {
    width: 100%;
  }

  .hero-mini-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .dashboard-title {
    font-size: 32px;
  }

  .dashboard-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-action,
  .secondary-action,
  .empty-state__action {
    width: 100%;
  }

  .device-list-container {
    grid-template-columns: 1fr;
  }
}
</style>
