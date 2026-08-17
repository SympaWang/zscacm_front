import { createStore } from 'vuex'

// Vuex store 还原自 dist(login 页 commit setLogin/setUid/setUsername/setUserType;
// 帖子详情通过 store.state.discuss 传递帖子对象)
export default createStore({
  state: {
    login: 0,
    uid: 0,
    username: '',
    userType: 0,
    discuss: ''
  },
  mutations: {
    setLogin(state, v) { state.login = v },
    setUid(state, v) { state.uid = v },
    setUsername(state, v) { state.username = v },
    setUserType(state, v) { state.userType = v },
    setDiscuss(state, v) { state.discuss = v }
  }
})
