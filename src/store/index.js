import { createStore } from 'vuex'

// Vuex store 还原自 dist(login 页 commit setLogin/setUid/setUsername/setUserType;
// 帖子详情通过 store.state.discuss 传递帖子对象)
// 初始化时从 localStorage 恢复登录状态,避免刷新后丢失登录
export default createStore({
  state: {
    login: localStorage.getItem('userToken') ? 1 : 0,
    uid: Number(localStorage.getItem('userUid') || 0),
    username: localStorage.getItem('userName') || '',
    userType: Number(localStorage.getItem('userType') !== null ? localStorage.getItem('userType') : 0),
    lgPrivacy: Number(localStorage.getItem('userLgPrivacy') !== null ? localStorage.getItem('userLgPrivacy') : 0),
    discuss: ''
  },
  mutations: {
    setLogin(state, v) { state.login = v },
    setUid(state, v) { state.uid = v },
    setUsername(state, v) { state.username = v },
    setUserType(state, v) { state.userType = v },
    setLgPrivacy(state, v) { state.lgPrivacy = v },
    setDiscuss(state, v) { state.discuss = v }
  }
})
