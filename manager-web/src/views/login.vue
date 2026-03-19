<template>
  <div class="welcome">
    <el-container style="height: 100%">
      <el-header>
        <div style="display:flex;align-items:center;margin-top:11px;margin-left:11px;gap:10px;">
          <img loading="lazy" alt="" src="@/assets/xiaozhi-logo.png" style="width:42px;height:42px" />
          <div class="console-brand-text">DeskBot Console</div>
        </div>
      </el-header>
      <div class="login-person">
        <div class="login-hero-card">
          <div class="login-hero-card__eyebrow">DeskBot Control Layer</div>
          <div class="login-hero-card__title">Điều phối agent và thiết bị trong một bảng điều khiển gọn, rõ, thực dụng.</div>
          <div class="login-hero-card__subtitle">Dùng một điểm đăng nhập để đi vào toàn bộ hệ quản trị DeskBot Console.</div>
          <img loading="lazy" alt="" src="@/assets/login/login-person.png" class="login-hero-card__image" />
        </div>
      </div>
      <el-main style="position:relative">
        <div class="login-box" @keyup.enter="login">
          <div class="login-header-row">
            <div class="login-heading-group">
              <div class="login-badge">DeskBot Console</div>
              <div class="login-text">TRANG ĐĂNG NHẬP</div>
              <div class="login-subtext">Đăng nhập để quản lý agent, thiết bị và cấu hình vận hành.</div>
            </div>
            <div class="dark-mode-toggle">
              <el-switch v-model="isDarkMode" @change="toggleDarkMode" active-color="#2a2a4a" inactive-color="#94a3b8" />
              <span class="dark-mode-label">{{ isDarkMode ? 'Chế độ tối' : 'Chế độ sáng' }}</span>
            </div>
          </div>
          <div class="login-form-body">
            <template v-if="!isMobileLogin">
              <div class="input-box">
                <img loading="lazy" alt="" class="input-icon" src="@/assets/login/username.png" />
                <el-input v-model="form.username" :placeholder="$t('login.usernamePlaceholder')" />
              </div>
            </template>
            <template v-else>
              <div class="input-box">
                <div class="credential-row">
                  <el-select v-model="form.areaCode" class="credential-row__select">
                    <el-option v-for="item in mobileAreaList" :key="item.key" :label="item.name+' ('+item.key+')'" :value="item.key" />
                  </el-select>
                  <el-input v-model="form.mobile" class="credential-row__input" :placeholder="$t('login.mobilePlaceholder')" />
                </div>
              </div>
            </template>
            <div class="input-box">
              <img loading="lazy" alt="" class="input-icon" src="@/assets/login/password.png" />
              <el-input v-model="form.password" :placeholder="$t('login.passwordPlaceholder')" type="password" show-password />
            </div>
            <div class="captcha-row">
              <div class="input-box captcha-input-box">
                <img loading="lazy" alt="" class="input-icon" src="@/assets/login/shield.png" />
                <el-input v-model="form.captcha" :placeholder="$t('login.captchaPlaceholder')" style="flex:1" />
              </div>
              <img loading="lazy" v-if="captchaUrl" :src="captchaUrl" alt="captcha" class="captcha-image" @click="fetchCaptcha" />
            </div>
            <div class="login-aux-links">
              <div v-if="allowUserRegister" class="login-link" @click="goToRegister">{{ $t("login.register") }}</div>
              <div class="login-link" @click="goToForgetPassword" v-if="enableMobileRegister">{{ $t("login.forgetPassword") }}</div>
            </div>
          </div>
          <div class="login-btn" @click="login">{{ $t("login.login") }}</div>
          <div class="login-bottom-zone">
            <div class="login-type-container" v-if="enableMobileRegister">
              <div class="login-mode-switches">
                <el-tooltip :content="$t('login.mobileLogin')" placement="bottom">
                  <el-button :type="isMobileLogin ? 'primary' : 'default'" icon="el-icon-mobile" circle @click="switchLoginType('mobile')"></el-button>
                </el-tooltip>
                <el-tooltip :content="$t('login.usernameLogin')" placement="bottom">
                  <el-button :type="!isMobileLogin ? 'primary' : 'default'" icon="el-icon-user" circle @click="switchLoginType('username')"></el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="login-agreement-text">
              {{ $t("login.agreeTo") }}
              <div class="login-inline-link">{{ $t("login.userAgreement") }}</div>
              {{ $t("login.and") }}
              <div class="login-inline-link">{{ $t("login.privacyPolicy") }}</div>
            </div>
          </div>
        </div>
      </el-main>
      <el-footer><version-footer /></el-footer>
    </el-container>
  </div>
</template>

<script>
import Api from "@/apis/api";
import VersionFooter from "@/components/VersionFooter.vue";
import { getUUID, goToPage, showDanger, showSuccess, sm2Encrypt, validateMobile } from "@/utils";
import { mapState } from "vuex";
import featureManager from "@/utils/featureManager";

export default {
  name: "login",
  components: { VersionFooter },
  computed: {
    ...mapState({
      allowUserRegister: function(s) { return s.pubConfig.allowUserRegister; },
      enableMobileRegister: function(s) { return s.pubConfig.enableMobileRegister; },
      mobileAreaList: function(s) { return s.pubConfig.mobileAreaList; },
      sm2PublicKey: function(s) { return s.pubConfig.sm2PublicKey; },
    }),
    xiaozhiAiIcon: function() { return require("@/assets/xiaozhi-ai_vi.png"); },
  },
  data: function() {
    return {
      activeName: "username",
      form: { username: "", password: "", captcha: "", captchaId: "", areaCode: "+86", mobile: "" },
      captchaUuid: "", captchaUrl: "", isMobileLogin: false, isDarkMode: false,
    };
  },
  mounted: function() {
    this.fetchCaptcha();
    var saved = localStorage.getItem('darkMode');
    this.isDarkMode = saved === 'true';
    if (this.isDarkMode) document.documentElement.classList.add('dark-mode');
    var self = this;
    this.$store.dispatch("fetchPubConfig").then(function() {
      self.isMobileLogin = self.enableMobileRegister;
    });
  },
  methods: {
    toggleDarkMode: function(val) {
      if (val) document.documentElement.classList.add('dark-mode');
      else document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('darkMode', val);
    },
    fetchCaptcha: function() {
      var self = this;
      if (this.$store.getters.getToken) {
        if (this.$route.path !== "/home") this.$router.push("/home");
      } else {
        this.captchaUuid = getUUID();
        Api.user.getCaptcha(this.captchaUuid, function(res) {
          if (res.status === 200) {
            var blob = new Blob([res.data], { type: res.data.type });
            self.captchaUrl = URL.createObjectURL(blob);
          } else showDanger("captcha load failed");
        });
      }
    },
    switchLoginType: function(type) {
      this.isMobileLogin = type === "mobile";
      this.form.username = ""; this.form.mobile = "";
      this.form.password = ""; this.form.captcha = "";
      this.fetchCaptcha();
    },
    validateInput: function(input, messageKey) {
      if (!input.trim()) { showDanger(this.$t(messageKey)); return false; }
      return true;
    },
    login: function() {
      var self = this;
      if (this.isMobileLogin) {
        if (!validateMobile(this.form.mobile, this.form.areaCode)) { showDanger(this.$t('login.requiredMobile')); return; }
        this.form.username = this.form.areaCode + this.form.mobile;
      } else {
        if (!this.validateInput(this.form.username, 'login.requiredUsername')) return;
      }
      if (!this.validateInput(this.form.password, 'login.requiredPassword')) return;
      if (!this.validateInput(this.form.captcha, 'login.requiredCaptcha')) return;
      var encryptedPassword;
      try {
        encryptedPassword = sm2Encrypt(this.sm2PublicKey, this.form.captcha + this.form.password);
      } catch (e) { console.error("encrypt failed:", e); showDanger(this.$t('sm2.encryptionFailed')); return; }
      this.form.captchaId = this.captchaUuid;
      Api.user.login(
        { username: this.form.username, password: encryptedPassword, captchaId: this.form.captchaId },
        function(data) {
          showSuccess(self.$t('login.loginSuccess'));
          var tokenData = data && data.data && data.data.data ? data.data.data : null;
          if (!tokenData || !tokenData.token) {
            showDanger('login token invalid');
            return;
          }
          self.$store.commit("setToken", JSON.stringify(tokenData));
          goToPage("/home");
        },
        function(err) {
          showDanger(err.data.msg || "login failed");
          if (err.data && err.data.msg && (err.data.msg.indexOf("图形验证码") > -1 || err.data.msg.indexOf("Captcha") > -1)) self.fetchCaptcha();
        }
      );
      setTimeout(function() { self.fetchCaptcha(); }, 1000);
    },
    goToRegister: function() { goToPage("/register"); },
    goToForgetPassword: function() { goToPage("/retrieve-password"); },
  },
};
</script>

<style lang="scss" scoped>
@import "./auth.scss";
.login-form-body {
  padding: 0 34px;
}
.login-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
  padding: 0 34px;
}
.login-heading-group {
  min-width: 0;
}
.login-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  height: 30px;
  border-radius: 999px;
  background: #eef4ff;
  color: #3f6ef0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.login-subtext {
  margin-top: 10px;
  max-width: 320px;
  font-size: 13px;
  line-height: 1.6;
  color: #6f7c9c;
}
.login-aux-links {
  font-weight: 500;
  font-size: 13px;
  color: #5778ff;
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  gap: 16px;
}
.login-link {
  cursor: pointer;
}
.login-btn {
  margin-top: 22px;
}
.login-bottom-zone {
  margin: 18px 30px 0;
  padding-top: 18px;
  border-top: 1px solid #eef2f8;
}
.login-type-container {
  margin: 0;
  display: flex;
  justify-content: center;
}
.login-mode-switches {
  display: flex;
  gap: 10px;
}
.login-agreement-text {
  margin-top: 16px;
  font-size: 12px;
  line-height: 1.7;
  text-align: center;
  color: #8a94ad;
}
.login-inline-link {
  display: inline-block;
  color: #5778ff;
  cursor: pointer;
  font-weight: 600;
}
.dark-mode-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef4ff;
  border: 1px solid #cddcff;
  box-shadow: 0 4px 14px rgba(87, 120, 255, 0.12);
}
.dark-mode-label { font-size: 12px; color: #3d4566; white-space: nowrap; font-weight: 600; }
.console-brand-text {
  font-size: 20px;
  font-weight: 700;
  color: #3d4566;
  letter-spacing: 0.2px;
}
.login-hero-card {
  position: relative;
  padding: 34px 34px 0;
  border-radius: 28px;
  background: linear-gradient(160deg, rgba(13, 27, 62, 0.92), rgba(42, 78, 156, 0.88));
  box-shadow: 0 24px 60px rgba(31, 41, 55, 0.24);
  overflow: hidden;
}
.login-hero-card__eyebrow {
  color: #d9e5ff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.login-hero-card__title {
  margin-top: 16px;
  color: #ffffff;
  font-size: 34px;
  line-height: 1.18;
  font-weight: 800;
}
.login-hero-card__subtitle {
  margin-top: 14px;
  max-width: 420px;
  color: rgba(234, 240, 255, 0.82);
  font-size: 14px;
  line-height: 1.7;
}
.login-hero-card__image {
  width: 100%;
  margin-top: 24px;
  display: block;
}
html.dark-mode .console-brand-text,
html.dark-mode .login-subtext,
html.dark-mode .dark-mode-label {
  color: #e0e0e0;
}
html.dark-mode .login-badge {
  background: rgba(87, 120, 255, 0.2);
  color: #dce6ff;
}
html.dark-mode .dark-mode-toggle {
  background: rgba(42, 42, 74, 0.9);
  border-color: #394260;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
}
html.dark-mode .login-bottom-zone {
  border-top-color: #24304d;
}
html.dark-mode .login-agreement-text {
  color: #a0a9bf;
}
:deep(.el-switch__core) {
  border-color: #94a3b8 !important;
}
:deep(.el-button--primary) {
  background-color: #5778ff; border-color: #5778ff;
  &:hover, &:focus { background-color: #4a6ae8; border-color: #4a6ae8; }
  &:active { background-color: #3d5cd6; border-color: #3d5cd6; }
}
@media (max-width: 1440px) {
  .login-hero-card__title {
    font-size: 30px;
  }
}
@media (max-width: 1280px) {
  .login-header-row {
    flex-direction: column;
    align-items: stretch;
  }
  .dark-mode-toggle {
    margin-left: 0;
    align-self: flex-start;
  }
}
@media (max-width: 1100px) {
  .login-hero-card {
    padding: 28px 24px 0;
  }
  .login-hero-card__title {
    font-size: 26px;
  }
}
</style>
