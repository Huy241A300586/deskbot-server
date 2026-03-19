<template>
  <div class="welcome">
    <HeaderBar :devices="devices" @search="handleSearch" @search-reset="handleSearchReset" />
    <el-main class="home-main">
      <div class="home-shell">
        <section class="dashboard-hero">
          <div class="dashboard-hero__content">
            <div class="dashboard-pill">DeskBot Console</div>
            <h1 class="dashboard-title">TRUNG TÂM ĐIỀU PHỐI DESKBOT</h1>
            <p class="dashboard-subtitle">
              Quản lý agent, thiết bị và hoạt động vận hành trong một giao diện gọn, rõ và khác biệt hơn bản gốc.
            </p>
            <div class="dashboard-actions">
              <button class="primary-action" @click="showAddDialog">{{ $t('home.addAgent') }}</button>
              <button class="secondary-action" @click="fetchAgentList">Làm mới danh sách</button>
            </div>
          </div>
          <div class="dashboard-hero__stats">
            <div class="hero-stat-card">
              <div class="hero-stat-card__label">Tổng agent</div>
              <div class="hero-stat-card__value">{{ devices.length }}</div>
              <div class="hero-stat-card__hint">Đang hiển thị trên dashboard</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-card__label">Đang tải</div>
              <div class="hero-stat-card__value">{{ isLoading ? 'Có' : 'Không' }}</div>
              <div class="hero-stat-card__hint">Trạng thái đồng bộ dữ liệu</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-card__label">Tìm kiếm</div>
              <div class="hero-stat-card__value">{{ isSearching ? 'Đang lọc' : 'Toàn bộ' }}</div>
              <div class="hero-stat-card__hint">Nguồn dữ liệu đang xem</div>
            </div>
          </div>
        </section>

        <section class="fleet-panel">
          <div class="fleet-panel__header">
            <div>
              <div class="fleet-panel__eyebrow">Agent Fleet</div>
              <div class="fleet-panel__title">Danh sách agent và thiết bị</div>
            </div>
            <div class="fleet-panel__summary">{{ devices.length }} mục</div>
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

            <template v-else>
              <DeviceItem v-for="(item, index) in devices" :key="index" :device="item" :feature-status="featureStatus"
                @configure="goToRoleConfig" @deviceManage="handleDeviceManage" @delete="handleDeleteAgent"
                @chat-history="handleShowChatHistory" />
            </template>
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
      // 功能状态
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
    // 加载功能状态
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
      // 点击配置角色后跳转到角色配置页
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
      // 检测MAC地址格式：包含4个冒号
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
      // 直接将原始设备列表赋值给显示设备列表，避免重新加载数据
      this.devices = [...this.originalDevices];
    },

    // 搜索更新智能体列表
    handleSearchResult(filteredList) {
      this.devices = filteredList; // 更新设备列表
    },
    // 获取智能体列表
    fetchAgentList() {
      this.isLoading = true;
      Api.agent.getAgentList(({ data }) => {
        if (data?.data) {
          this.originalDevices = data.data.map(item => ({
            ...item,
            agentId: item.id
          }));

          // 动态设置骨架屏数量（可选）
          this.skeletonCount = Math.min(
            Math.max(this.originalDevices.length, 3), // 最少3个
            10 // 最多10个
          );

          this.handleSearchReset();
        }
        this.isLoading = false;
      }, (error) => {
        console.error('Failed to fetch agent list:', error);
        this.isLoading = false;
      });
    },
    // 删除智能体
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
            this.fetchAgentList(); // 刷新列表
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
  min-width: 900px;
  min-height: 506px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #eef4ff 0%, #f7f9fc 100%);
}

.home-main {
  padding: 24px;
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
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
  gap: 22px;
  padding: 30px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(110, 142, 251, 0.32), transparent 35%),
    linear-gradient(135deg, #11203f 0%, #1d3160 45%, #2d4d90 100%);
  box-shadow: 0 24px 60px rgba(26, 43, 85, 0.18);
}

.dashboard-hero__content {
  text-align: left;
}

.dashboard-pill {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #dfe8ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.dashboard-title {
  margin: 18px 0 14px;
  color: #ffffff;
  font-size: 38px;
  line-height: 1.12;
  font-weight: 800;
  max-width: 720px;
}

.dashboard-subtitle {
  margin: 0;
  max-width: 680px;
  color: rgba(234, 240, 255, 0.86);
  font-size: 15px;
  line-height: 1.7;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 28px;
}

.primary-action,
.secondary-action {
  border: none;
  border-radius: 16px;
  padding: 0 18px;
  height: 44px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}

.primary-action {
  background: #ffffff;
  color: #1f3d7a;
}

.secondary-action {
  background: rgba(255, 255, 255, 0.12);
  color: #eaf0ff;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.dashboard-hero__stats {
  display: grid;
  gap: 14px;
}

.hero-stat-card {
  border-radius: 22px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  text-align: left;
}

.hero-stat-card__label {
  color: #bfcdf6;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-stat-card__value {
  margin-top: 8px;
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
}

.hero-stat-card__hint {
  margin-top: 6px;
  color: rgba(234, 240, 255, 0.78);
  font-size: 12px;
  line-height: 1.5;
}

.fleet-panel {
  border-radius: 28px;
  padding: 26px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(210, 220, 242, 0.9);
  box-shadow: 0 16px 42px rgba(31, 41, 55, 0.08);
}

.fleet-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fleet-panel__eyebrow {
  color: #5778ff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.fleet-panel__title {
  margin-top: 6px;
  color: #162033;
  font-size: 24px;
  font-weight: 800;
}

.fleet-panel__summary {
  min-width: 96px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: #eef3ff;
  color: #365acb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.device-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 22px;
  padding: 24px 0 0;
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
  background: #fff;
  border-radius: 22px;
  padding: 24px;
  height: 140px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e8edf6;
}

.skeleton-image {
  width: 72px;
  height: 72px;
  background: #eef2f8;
  border-radius: 18px;
  float: left;
  position: relative;
  overflow: hidden;
}

.skeleton-content {
  margin-left: 96px;
}

.skeleton-line {
  height: 16px;
  background: #eef2f8;
  border-radius: 999px;
  margin-bottom: 12px;
  width: 70%;
  position: relative;
  overflow: hidden;
}

.skeleton-line-short {
  height: 12px;
  background: #eef2f8;
  border-radius: 999px;
  width: 50%;
}

.skeleton-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.42),
      rgba(255, 255, 255, 0));
  animation: shimmer 1.5s infinite;
}
</style>

/* Dark mode overrides (non-scoped) */
html.dark-mode .welcome {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%) !important;
}

html.dark-mode .dashboard-hero {
  background:
    radial-gradient(circle at top left, rgba(87, 120, 255, 0.24), transparent 35%),
    linear-gradient(135deg, #0f172a 0%, #15213e 45%, #22335f 100%) !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}

html.dark-mode .fleet-panel {
  background: rgba(15, 23, 42, 0.88);
  border-color: rgba(51, 65, 85, 0.9);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.26);
}

html.dark-mode .fleet-panel__title {
  color: #e5ecf6;
}

html.dark-mode .fleet-panel__summary {
  background: rgba(87, 120, 255, 0.16);
  color: #dce6ff;
}

html.dark-mode .hero-stat-card {
  background: rgba(15, 23, 42, 0.34);
  border-color: rgba(148, 163, 184, 0.18);
}

html.dark-mode .skeleton-item {
  background: #16213e;
  border-color: #24304d;
}

html.dark-mode .skeleton-image,
html.dark-mode .skeleton-line,
html.dark-mode .skeleton-line-short {
  background: #1a1a2e;
}
