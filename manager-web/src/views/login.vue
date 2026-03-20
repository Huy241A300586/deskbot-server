<template>
  <div class="welcome">
    <el-container class="auth-layout">
      <el-header class="auth-header">
        <div class="brand-lockup">
          <img loading="lazy" alt="" src="@/assets/deskbot-mark.svg" class="brand-lockup__mark" />
          <div>
            <div class="brand-lockup__eyebrow">DeskBot Console</div>
            <div class="brand-lockup__title">Premium Admin Workspace</div>
          </div>
        </div>
      </el-header>
      <el-main class="auth-main">
        <div class="auth-shell">
          <section class="auth-showcase">
            <div class="auth-showcase__content">
              <div class="brand-lockup">
                <img loading="lazy" alt="" src="@/assets/deskbot-mark.svg" class="brand-lockup__mark" />
                <div>
                  <div class="brand-lockup__eyebrow">DeskBot Console</div>
                  <div class="brand-lockup__title">Operational Control Layer</div>
                </div>
              </div>
              <div class="auth-showcase__kicker">Desktop Admin Control</div>
              <h1 class="auth-headline">Điều phối agent và thiết bị trong một không gian DeskBot cao cấp hơn.</h1>
              <p class="auth-description">
                Giữ nguyên luồng đăng nhập hiện tại, nhưng đưa trải nghiệm quản trị sang một bề mặt desktop rõ ràng,
                tin cậy và giàu thứ bậc hơn cho vận hành hàng ngày.
              </p>
              <div class="auth-metrics">
                <div class="auth-metric">
                  <div class="auth-metric__label">Multi-Surface Ops</div>
                  <div class="auth-metric__value">Agents + Devices</div>
                  <div class="auth-metric__copy">Một shell thống nhất cho role, thiết bị, voice và knowledge.</div>
                </div>
                <div class="auth-metric">
                  <div class="auth-metric__label">Operator Ready</div>
                  <div class="auth-metric__value">Fast Entry</div>
                  <div class="auth-metric__copy">Truy cập nhanh, ít nhiễu và ưu tiên các thao tác lặp lại thường xuyên.</div>
                </div>
                <div class="auth-metric">
                  <div class="auth-metric__label">Visual Hierarchy</div>
                  <div class="auth-metric__value">Clear Signals</div>
                  <div class="auth-metric__copy">Màu, chiều sâu và nhịp bố cục giúp đọc nhanh hơn trên desktop.</div>
                </div>
              </div>
            </div>
            <div class="auth-visual-frame">
              <div class="auth-visual-frame__label">DeskBot system overview</div>
              <div class="login-person">
                <img loading="lazy" alt="" src="@/assets/login/login-person.png" />
              </div>
            </div>
          </section>

          <section class="login-box" @keyup.enter="login">
            <div class="login-card__intro">
              <div>
                <div class="login-card__eyebrow">Secure Access</div>
                <div class="login-text">Đăng nhập vào DeskBot Console</div>
                <p class="login-caption">Tiếp tục vào trung tâm quản trị để quản lý agent, thiết bị và trạng thái vận hành.</p>
              </div>
              <div class="dark-mode-toggle">
                <el-switch v-model="isDarkMode" @change="toggleDarkMode" active-color="#0f4bb7" inactive-color="#94a3b8" />
                <span class="dark-mode-label">{{ isDarkMode ? 'Chế độ tối' : 'Chế độ sáng' }}</span>
              </div>
            </div>
            <div class="login-form">
              <div class="login-mode-chip">{{ isMobileLogin ? $t('login.mobileLogin') : $t('login.usernameLogin') }}</div>
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
                  <el-input v-model="form.captcha" :placeholder="$t('login.captchaPlaceholder')" />
                </div>
                <img loading="lazy" v-if="captchaUrl" :src="captchaUrl" alt="captcha" class="captcha-image" @click="fetchCaptcha" />
              </div>
              <div class="login-links">
                <button v-if="allowUserRegister" type="button" class="link-action" @click="goToRegister">
                  {{ $t("login.register") }}
                </button>
                <button v-if="enableMobileRegister" type="button" class="link-action" @click="goToForgetPassword">
                  {{ $t("login.forgetPassword") }}
                </button>
              </div>
            </div>
            <div class="login-btn" @click="login">{{ $t("login.login") }}</div>
            <div class="login-type-container" v-if="enableMobileRegister">
              <div class="login-type-buttons">
                <el-tooltip :content="$t('login.mobileLogin')" placement="bottom">
                  <el-button :type="isMobileLogin ? 'primary' : 'default'" icon="el-icon-mobile" circle @click="switchLoginType('mobile')"></el-button>
                </el-tooltip>
                <el-tooltip :content="$t('login.usernameLogin')" placement="bottom">
                  <el-button :type="!isMobileLogin ? 'primary' : 'default'" icon="el-icon-user" circle @click="switchLoginType('username')"></el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="login-legal">
              {{ $t("login.agreeTo") }}
              <span class="login-legal__link">{{ $t("login.userAgreement") }}</span>
              {{ $t("login.and") }}
              <span class="login-legal__link">{{ $t("login.privacyPolicy") }}</span>
            </div>
          </section>
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

.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.dark-mode-label {
  font-size: 12px;
  color: var(--deskbot-text);
  white-space: nowrap;
  font-weight: 700;
}

html.dark-mode .dark-mode-toggle {
  background: rgba(19, 35, 61, 0.74);
  border-color: rgba(130, 152, 187, 0.18);
  box-shadow: 0 12px 24px rgba(2, 8, 23, 0.24);
}

html.dark-mode .dark-mode-label {
  color: var(--deskbot-text);
}

:deep(.el-switch__core) {
  border-color: #94a3b8 !important;
}

:deep(.el-button--primary) {
  background-color: var(--deskbot-accent);
  border-color: transparent;

  &:hover,
  &:focus {
    background-color: var(--deskbot-accent-strong);
    border-color: transparent;
  }

  &:active {
    background-color: var(--deskbot-accent-strong);
    border-color: transparent;
  }
}
</style>
