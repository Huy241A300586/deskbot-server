<template>
  <el-header class="header">
    <div class="header-container">
      <div class="header-left" @click="goHome">
        <img loading="lazy" alt="" src="@/assets/deskbot-mark.svg" class="logo-img" />
        <div class="brand-copy">
          <div class="brand-copy__eyebrow">DeskBot Console</div>
          <div class="brand-copy__title">{{ isSuperAdmin ? 'Admin Control Layer' : 'Operator Workspace' }}</div>
        </div>
      </div>

      <div class="header-center">
        <div
          class="nav-pill"
          :class="{
            'active-tab':
              $route.path === '/home' ||
              $route.path === '/role-config' ||
              $route.path === '/device-management',
          }"
          @click="goHome"
        >
          <span class="nav-pill__icon">
            <img loading="lazy" alt="" src="@/assets/header/robot.png" />
          </span>
          <span class="nav-text">{{ $t("header.smartManagement") }}</span>
        </div>

        <div
          v-if="!isSuperAdmin && featureStatus.voiceClone"
          class="nav-pill"
          :class="{ 'active-tab': $route.path === '/voice-clone-management' }"
          @click="goVoiceCloneManagement"
        >
          <span class="nav-pill__icon">
            <img loading="lazy" alt="" src="@/assets/header/voice.png" />
          </span>
          <span class="nav-text">{{ $t("header.voiceCloneManagement") }}</span>
        </div>

        <el-dropdown
          v-if="isSuperAdmin && featureStatus.voiceClone"
          trigger="click"
          class="nav-pill nav-pill--dropdown"
          :class="{
            'active-tab':
              $route.path === '/voice-clone-management' ||
              $route.path === '/voice-resource-management',
          }"
          @visible-change="handleVoiceCloneDropdownVisibleChange"
        >
          <span class="nav-pill__content">
            <span class="nav-pill__icon">
              <img loading="lazy" alt="" src="@/assets/header/voice.png" />
            </span>
            <span class="nav-text">{{ $t("header.voiceCloneManagement") }}</span>
            <i class="el-icon-arrow-down nav-pill__arrow" :class="{ 'rotate-down': voiceCloneDropdownVisible }"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="goVoiceCloneManagement">
              {{ $t("header.voiceCloneManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goVoiceResourceManagement">
              {{ $t("header.voiceResourceManagement") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <div v-if="isSuperAdmin" class="nav-pill" :class="{ 'active-tab': $route.path === '/model-config' }" @click="goModelConfig">
          <span class="nav-pill__icon">
            <img loading="lazy" alt="" src="@/assets/header/model_config.png" />
          </span>
          <span class="nav-text">{{ $t("header.modelConfig") }}</span>
        </div>

        <div
          v-if="featureStatus.knowledgeBase"
          class="nav-pill"
          :class="{ 'active-tab': $route.path === '/knowledge-base-management' || $route.path === '/knowledge-file-upload' }"
          @click="goKnowledgeBaseManagement"
        >
          <span class="nav-pill__icon">
            <img loading="lazy" alt="" src="@/assets/header/knowledge_base.png" />
          </span>
          <span class="nav-text">{{ $t("header.knowledgeBase") }}</span>
        </div>

        <el-dropdown
          v-if="isSuperAdmin"
          trigger="click"
          class="nav-pill nav-pill--dropdown"
          :class="{
            'active-tab':
              $route.path === '/dict-management' ||
              $route.path === '/params-management' ||
              $route.path === '/provider-management' ||
              $route.path === '/server-side-management' ||
              $route.path === '/agent-template-management' ||
              $route.path === '/ota-management' ||
              $route.path === '/user-management' ||
              $route.path === '/feature-management',
          }"
          @visible-change="handleParamDropdownVisibleChange"
        >
          <span class="nav-pill__content">
            <span class="nav-pill__icon">
              <img loading="lazy" alt="" src="@/assets/header/param_management.png" />
            </span>
            <span class="nav-text">{{ $t("header.paramDictionary") }}</span>
            <i class="el-icon-arrow-down nav-pill__arrow" :class="{ 'rotate-down': paramDropdownVisible }"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="goParamManagement">
              {{ $t("header.paramManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goUserManagement">
              {{ $t("header.userManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goOtaManagement">
              {{ $t("header.otaManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goDictManagement">
              {{ $t("header.dictManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goProviderManagement">
              {{ $t("header.providerManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goAgentTemplateManagement">
              {{ $t("header.agentTemplate") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goServerSideManagement">
              {{ $t("header.serverSideManagement") }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goFeatureManagement">
              {{ $t("header.featureManagement") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <div class="header-right">
        <div class="search-container" v-if="$route.path === '/home' && !(isSuperAdmin && isSmallScreen)">
          <div class="search-wrapper">
            <el-input
              v-model="search"
              :placeholder="$t('header.searchPlaceholder')"
              class="custom-search-input"
              @keyup.enter.native="handleSearch"
              @focus="showSearchHistory"
              @blur="hideSearchHistory"
              clearable
              ref="searchInput"
            >
              <i slot="suffix" class="el-icon-search search-icon" @click="handleSearch"></i>
            </el-input>
            <div v-if="showHistory && searchHistory.length > 0" class="search-history-dropdown">
              <div class="search-history-header">
                <span>{{ $t("header.searchHistory") }}</span>
                <el-button type="text" size="small" class="clear-history-btn" @click="clearSearchHistory">
                  {{ $t("header.clearHistory") }}
                </el-button>
              </div>
              <div class="search-history-list">
                <div
                  v-for="(item, index) in searchHistory"
                  :key="index"
                  class="search-history-item"
                  @click.stop="selectSearchHistory(item)"
                >
                  <span class="history-text">{{ item }}</span>
                  <i class="el-icon-close clear-item-icon" @click.stop="removeSearchHistory(index)"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="header-meta">
          <div class="context-chip">{{ currentLanguageText }}</div>
          <div class="dark-mode-toggle">
            <el-switch v-model="isDarkMode" @change="toggleDarkMode" active-color="#0f4bb7" inactive-color="#d1d9e6" :width="28" />
            <span class="dark-mode-label">{{ isDarkMode ? 'Night' : 'Day' }}</span>
          </div>
          <div class="profile-trigger" @click="handleAvatarClick">
            <img loading="lazy" alt="" src="@/assets/home/avatar.png" class="avatar-img" />
            <div class="profile-trigger__copy">
              <span class="profile-trigger__name">{{ userInfo.username || "Đang tải..." }}</span>
              <span class="profile-trigger__role">{{ isSuperAdmin ? 'Super Admin' : 'Operator' }}</span>
            </div>
            <i class="el-icon-arrow-down profile-trigger__arrow" :class="{ 'rotate-down': userMenuVisible }"></i>
          </div>
        </div>

        <el-cascader
          :options="userMenuOptions"
          trigger="click"
          :props="cascaderProps"
          style="width: 0px; overflow: hidden"
          :show-all-levels="false"
          @change="handleCascaderChange"
          @visible-change="handleUserMenuVisibleChange"
          ref="userCascader"
        >
          <template slot-scope="{ data }">
            <span>{{ data.label }}</span>
          </template>
        </el-cascader>
      </div>
    </div>

    <ChangePasswordDialog v-model="isChangePasswordDialogVisible" />
  </el-header>
</template>

<script>
import userApi from "@/apis/module/user";

import { mapActions, mapGetters } from "vuex";
import ChangePasswordDialog from "./ChangePasswordDialog.vue";
import featureManager from "@/utils/featureManager";

export default {
  name: "HeaderBar",
  components: {
    ChangePasswordDialog,
  },
  props: ["devices"],
  data() {
    return {
      search: "",
      userInfo: {
        username: "",
        mobile: "",
      },
      isChangePasswordDialogVisible: false,
      paramDropdownVisible: false,
      voiceCloneDropdownVisible: false,
      userMenuVisible: false,
      menuVisibleTimer: null,
      isSmallScreen: false,
      searchHistory: [],
      isDarkMode: false,
      showHistory: false,
      SEARCH_HISTORY_KEY: "xiaozhi_search_history",
      MAX_HISTORY_COUNT: 3,
      cascaderProps: {
        expandTrigger: "click",
        value: "value",
        label: "label",
        children: "children",
      },
      featureStatus: {
        voiceClone: false,
        knowledgeBase: false,
      },
    };
  },
  computed: {
    ...mapGetters(["getIsSuperAdmin"]),
    isSuperAdmin() {
      return this.getIsSuperAdmin;
    },
    currentLanguageText() {
      return "Tiếng Việt";
    },
    userMenuOptions() {
      return [
        {
          label: this.$t("header.changePassword"),
          value: "changePassword",
        },
        {
          label: this.$t("header.logout"),
          value: "logout",
        },
      ];
    },
  },
  async mounted() {
    this.fetchUserInfo();
    this.checkScreenSize();
    window.addEventListener("resize", this.checkScreenSize);
    this.loadSearchHistory();
    var savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode === 'true';
    if (this.isDarkMode) document.documentElement.classList.add('dark-mode');
    await this.loadFeatureStatus();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkScreenSize);
  },
  methods: {
    goHome() {
      this.$router.push("/home");
    },
    goUserManagement() {
      this.$router.push("/user-management");
    },
    goModelConfig() {
      this.$router.push("/model-config");
    },
    goKnowledgeBaseManagement() {
      this.$router.push("/knowledge-base-management");
    },
    goVoiceCloneManagement() {
      this.$router.push("/voice-clone-management");
    },
    goParamManagement() {
      this.$router.push("/params-management");
    },
    goOtaManagement() {
      this.$router.push("/ota-management");
    },
    goDictManagement() {
      this.$router.push("/dict-management");
    },
    goProviderManagement() {
      this.$router.push("/provider-management");
    },
    goServerSideManagement() {
      this.$router.push("/server-side-management");
    },

    goVoiceResourceManagement() {
      this.$router.push("/voice-resource-management");
    },
    goAgentTemplateManagement() {
      this.$router.push("/agent-template-management");
    },
    goFeatureManagement() {
      this.$router.push("/feature-management");
    },
    async loadFeatureStatus() {
      await featureManager.waitForInitialization();

      const config = featureManager.getConfig();

      this.featureStatus.voiceClone = config.voiceClone;
      this.featureStatus.knowledgeBase = config.knowledgeBase;
    },
    toggleDarkMode(val) {
      if (val) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
      localStorage.setItem('darkMode', val);
    },
    fetchUserInfo() {
      userApi.getUserInfo(({ data }) => {
        this.userInfo = data.data;
        if (data.data.superAdmin !== undefined) {
          this.$store.commit("setUserInfo", data.data);
        }
      });
    },
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth <= 1386;
    },
    handleSearch() {
      const searchValue = this.search.trim();

      if (!searchValue) {
        this.$emit("search-reset");
        return;
      }

      this.saveSearchHistory(searchValue);
      this.$emit("search", searchValue);

      if (this.$refs.searchInput) {
        this.$refs.searchInput.blur();
      }
    },

    showSearchHistory() {
      this.showHistory = true;
    },

    hideSearchHistory() {
      setTimeout(() => {
        this.showHistory = false;
      }, 200);
    },

    loadSearchHistory() {
      try {
        const history = localStorage.getItem(this.SEARCH_HISTORY_KEY);
        if (history) {
          this.searchHistory = JSON.parse(history);
        }
      } catch (error) {
        console.error("加载搜索历史失败:", error);
        this.searchHistory = [];
      }
    },

    saveSearchHistory(keyword) {
      if (!keyword || this.searchHistory.includes(keyword)) {
        return;
      }

      this.searchHistory.unshift(keyword);

      if (this.searchHistory.length > this.MAX_HISTORY_COUNT) {
        this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY_COUNT);
      }

      try {
        localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
      } catch (error) {
        console.error("保存搜索历史失败:", error);
      }
    },

    selectSearchHistory(keyword) {
      this.search = keyword;
      this.handleSearch();
    },

    removeSearchHistory(index) {
      this.searchHistory.splice(index, 1);
      try {
        localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
      } catch (error) {
        console.error("更新搜索历史失败:", error);
      }
    },

    clearSearchHistory() {
      this.searchHistory = [];
      try {
        localStorage.removeItem(this.SEARCH_HISTORY_KEY);
      } catch (error) {
        console.error("清空搜索历史失败:", error);
      }
    },
    showChangePasswordDialog() {
      this.isChangePasswordDialogVisible = true;
      this.userMenuVisible = false;
    },
    async handleLogout() {
      try {
        await this.logout();
        this.$message.success({
          message: this.$t("message.success"),
          showClose: true,
        });
      } catch (error) {
        console.error("退出登录失败:", error);
        this.$message.error({
          message: this.$t("message.error"),
          showClose: true,
        });
      }
    },
    handleParamDropdownVisibleChange(visible) {
      this.paramDropdownVisible = visible;
    },

    handleVoiceCloneDropdownVisibleChange(visible) {
      this.voiceCloneDropdownVisible = visible;
    },
    handleCascaderChange(value) {
      if (!value || value.length === 0) {
        return;
      }

      const action = value[value.length - 1];

      switch (action) {
        case "changePassword":
          this.showChangePasswordDialog();
          break;
        case "logout":
          this.handleLogout();
          break;
      }

      setTimeout(() => {
        this.completeResetCascader();
      }, 300);
    },

    completeResetCascader() {
      if (this.$refs.userCascader) {
        try {
          if (this.$refs.userCascader.clearValue) {
            this.$refs.userCascader.clearValue();
          }

          if (this.$refs.userCascader.$data) {
            this.$refs.userCascader.$data.selectedPaths = [];
            this.$refs.userCascader.$data.displayLabels = [];
            this.$refs.userCascader.$data.inputValue = "";
            this.$refs.userCascader.$data.checkedValue = [];
            this.$refs.userCascader.$data.showAllLevels = false;
          }

          const menuElement = this.$refs.userCascader.$refs.menu;
          if (menuElement && menuElement.$el) {
            const activeItems = menuElement.$el.querySelectorAll(
              ".el-cascader-node.is-active"
            );
            activeItems.forEach((item) => item.classList.remove("is-active"));

            const checkedItems = menuElement.$el.querySelectorAll(
              ".el-cascader-node.is-checked"
            );
            checkedItems.forEach((item) => item.classList.remove("is-checked"));
          }

          console.log("Cascader values cleared");
        } catch (error) {
          console.error("清空选择值失败:", error);
        }
      }
    },

    handleAvatarClick() {
      if (this.$refs.userCascader) {
        this.userMenuVisible = !this.userMenuVisible;

        if (!this.userMenuVisible) {
          this.completeResetCascader();
        }

        try {
          this.$refs.userCascader.toggleDropDownVisible(this.userMenuVisible);
        } catch (error) {
          if (this.$refs.userCascader.$refs.menu) {
            this.$refs.userCascader.$refs.menu.showMenu(this.userMenuVisible);
          } else {
            console.error("Cannot access menu component");
          }
        }
      }
    },

    handleUserMenuVisibleChange(visible) {
      if (this.menuVisibleTimer) return;
      this.menuVisibleTimer = setTimeout(() => {
        this.userMenuVisible = visible;
        clearTimeout(this.menuVisibleTimer);
        this.menuVisibleTimer = null;
      }, 100);

      if (!visible) {
        this.completeResetCascader();
      }
    },

    ...mapActions(["logout"]),
  },
};
</script>

<style lang="scss" scoped>
.header {
  height: auto !important;
  min-width: 0;
  padding: 18px 24px 0;
  background: transparent;
  border: none;
}

.header-container {
  display: grid;
  grid-template-columns: minmax(220px, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  border-radius: 28px;
  background: var(--deskbot-surface);
  border: 1px solid var(--deskbot-border);
  box-shadow: var(--deskbot-shadow-md);
  backdrop-filter: blur(18px);
}

.header-left {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  min-width: 0;
}

.logo-img {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.brand-copy {
  min-width: 0;
}

.brand-copy__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--deskbot-text-muted);
}

.brand-copy__title {
  margin-top: 5px;
  color: var(--deskbot-text-strong);
  font-family: var(--deskbot-font-display);
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 2px;
}

.header-center::-webkit-scrollbar {
  display: none;
}

.nav-pill,
.nav-pill__content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.nav-pill {
  min-height: 48px;
  padding: 0 14px;
  border-radius: 18px;
  background: var(--deskbot-surface-muted);
  color: var(--deskbot-text);
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;
}

.nav-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.nav-pill.active-tab {
  background: linear-gradient(135deg, var(--deskbot-accent) 0%, #2a88f1 100%);
  color: #ffffff;
}

.nav-pill__icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.68);
}

.nav-pill__icon img {
  width: 15px;
  height: 15px;
}

.nav-pill.active-tab .nav-pill__icon {
  background: rgba(255, 255, 255, 0.18);
}

.nav-pill.active-tab .nav-pill__icon img {
  filter: brightness(0) invert(1);
}

.nav-pill__arrow {
  font-size: 13px;
}

.nav-text {
  max-width: 104px;
  text-align: center;
  line-height: 1.22;
  font-size: 13px;
  font-weight: 700;
  white-space: normal;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.search-container {
  flex: 1;
  min-width: 230px;
}

.search-wrapper {
  position: relative;
}

.search-history-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--deskbot-surface-strong);
  border: 1px solid var(--deskbot-border);
  border-radius: 18px;
  box-shadow: var(--deskbot-shadow-lg);
  z-index: 1000;
  overflow: hidden;
}

.search-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  font-size: 12px;
  color: var(--deskbot-text-muted);
}

.clear-history-btn {
  padding: 0;
  height: auto;
  font-size: 12px;
}

.search-history-list {
  max-height: 220px;
  overflow-y: auto;
}

.search-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--deskbot-text);
  transition: background-color 0.18s ease;
}

.search-history-item:hover {
  background: var(--deskbot-surface-muted);
}

.history-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-item-icon {
  font-size: 11px;
  color: var(--deskbot-text-muted);
  visibility: hidden;
}

.search-history-item:hover .clear-item-icon {
  visibility: visible;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.context-chip,
.dark-mode-toggle,
.profile-trigger {
  display: inline-flex;
  align-items: center;
  border-radius: 18px;
  min-height: 46px;
}

.context-chip {
  padding: 0 14px;
  background: var(--deskbot-surface-muted);
  color: var(--deskbot-text);
  font-size: 13px;
  font-weight: 700;
}

.dark-mode-toggle {
  gap: 8px;
  padding: 0 12px;
  background: var(--deskbot-surface-muted);
}

.dark-mode-label {
  color: var(--deskbot-text);
  font-size: 12px;
  font-weight: 700;
}

.profile-trigger {
  gap: 12px;
  padding: 0 14px 0 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(238, 243, 251, 0.88) 100%);
  border: 1px solid rgba(148, 163, 184, 0.14);
  cursor: pointer;
  min-width: 0;
}

.avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-trigger__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile-trigger__name {
  color: var(--deskbot-text-strong);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.profile-trigger__role {
  color: var(--deskbot-text-muted);
  font-size: 11px;
  font-weight: 600;
}

.profile-trigger__arrow {
  color: var(--deskbot-text-muted);
  font-size: 13px;
}

::v-deep .custom-search-input .el-input__inner {
  height: 46px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.16);
  padding-left: 14px;
  padding-right: 38px;
  color: var(--deskbot-text-strong);
  font-size: 13px;
}

.search-icon {
  cursor: pointer;
  color: var(--deskbot-text-muted);
  font-size: 14px;
  line-height: 46px;
  margin-right: 12px;
}

::v-deep .custom-search-input .el-input__suffix-inner {
  display: flex;
  align-items: center;
  height: 100%;
}

.rotate-down {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.el-icon-arrow-down {
  transition: transform 0.3s ease;
}

html.dark-mode .header-container {
  background: var(--deskbot-surface);
  border-color: rgba(130, 152, 187, 0.16);
}

html.dark-mode .nav-pill,
html.dark-mode .context-chip,
html.dark-mode .dark-mode-toggle {
  background: rgba(19, 35, 61, 0.76);
}

html.dark-mode ::v-deep .custom-search-input .el-input__inner {
  background: rgba(19, 35, 61, 0.76);
}

html.dark-mode .profile-trigger {
  background: linear-gradient(180deg, rgba(15, 27, 49, 0.94) 0%, rgba(19, 35, 61, 0.9) 100%);
  border-color: rgba(130, 152, 187, 0.16);
}

html.dark-mode .nav-pill.active-tab {
  background: linear-gradient(135deg, var(--deskbot-accent) 0%, #2a88f1 100%);
}

html.dark-mode .nav-pill__icon,
html.dark-mode .search-history-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 1420px) {
  .header-container {
    grid-template-columns: minmax(220px, auto) minmax(0, 1fr);
  }

  .header-right {
    grid-column: 1 / -1;
    justify-content: space-between;
  }
}

@media (max-width: 920px) {
  .header {
    padding: 14px 18px 0;
  }

  .header-container {
    padding: 14px;
  }

  .header-right {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    min-width: 0;
    width: 100%;
  }

  .header-meta {
    justify-content: space-between;
    flex-wrap: wrap;
  }
}

@media (max-width: 620px) {
  .brand-copy__title {
    white-space: normal;
    font-size: 18px;
  }

  .context-chip {
    display: none;
  }

  .profile-trigger {
    width: 100%;
  }
}
</style>
