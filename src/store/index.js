import { createApp } from 'vue'
import App from '../App.vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
 
const app = createApp(App)

app.use(Vuex)
 
const store = new Vuex.Store({

  //配置
  plugins: [createPersistedState()],

  //数据，相当于data
  state: {
    login: 0,
    uid: -1,
    username: '',
    userType: 2,
    discuss: null,
  },
  getters: {
    
  },
  //里面定义方法，操作state方法
  mutations: {
    setLogin(state, login) {
        state.login = login;
    },

    setUid(state, uid) {
      state.uid = uid;
    },

    setUsername(state, username) {
        state.username = username;
    },

    setUserType(state, userType) {
      state.userType = userType;
    },

    setDiscuss(state, discuss) {
      state.discuss = discuss;
    }
  },
  // 操作异步操作mutation
  actions: {
    
  },
  modules: {
    
  },
})

export default store;