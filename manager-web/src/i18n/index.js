import Vue from 'vue';
import VueI18n from 'vue-i18n';
import vi from './vi';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'vi',
  messages: {
    'vi': vi
  }
});

export default i18n;
