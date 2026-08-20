import request from './request'

// 全部接口调用(还原自 dist 各页面 chunk 提取的 URL)
export default {
  // ---- 登录/用户 ----
  login(data) { return request.post('/login', data) },
  logout() { return request.get('/logout') },
  forgetPassword(data) { return request.post('/forgetPassword', data) },
  changePassword(data) { return request.post('/changePassword', data) },
  getUserDetailList(params) { return request.get('/getUserDetailList', { params }) },
  getUserDetail(params) { return request.get('/getUserDetail', { params }) },
  updateUserDetail(data) { return request.post('/updateUserDetail', data) },
  addUser(data) { return request.post('/addUser', data) },
  deleteUser(data) { return request.post('/deleteUser', data) },
  getLoginLogList(params) { return request.get('/loginLogList', { params }) },

  // ---- 比赛 ----
  getFutureContests() { return request.get('/FutureContests') },
  getEndContests() { return request.get('/endContests') },
  getEndContestsWithUsers() { return request.get('/endContestsWithUsers') },
  getEndContestsPage(params) { return request.get('/endContestsPage', { params }) },

  // ---- 题目/解题 ----
  getProblemList(params) { return request.get('/problemList', { params }) },
  // 题目列表(完整 URL 由页面拼装,兼容原版带参数的拼接方式)
  getProblemListRaw(url) { return request.get(url) },
  getUsers(params) { return request.get('/users', { params }) },
  getAcCf(params) { return request.get('/ac/cf', { params }) },
  getAcLuogu(params) { return request.get('/ac/luogu', { params }) },
  getAcVj(params) { return request.get('/ac/vj', { params }) },

  // ---- Rating ----
  getUserRating(params) { return request.get('/rating/user', { params }) },
  getContestUser(params) { return request.get('/rating/contest', { params }) },
  getUserRatings(params) { return request.get('/userRating', { params }) },
  getPersonalHome(params) { return request.get('/personalHome', { params }) },
  getPersonalRecentProblems(params) { return request.get('/personalRecentProblems', { params }) },
  getPersonalSubmitHistory(params) { return request.get('/personalSubmitHistory', { params }) },
  getPersonalSubmitSearch(params) { return request.get('/personalSubmitSearch', { params }) },
  getContestReview(params) { return request.get('/contestReview', { params }) },
  getAcwingProblemList(params) { return request.get('/acwingProblemList', { params }) },
  getRanklandContests(params) { return request.get('/rankland/contests', { params }) },
  getRanklandCollections() { return request.get('/rankland/collections') },
  getRanklandRank(params) { return request.get('/rankland/rank', { params }) },

  // ---- 历史荣誉 ----
  getHonorOverview() { return request.get('/honor/overview') },
  getHonorAwards(params) { return request.get('/honor/awards', { params }) },
  getHonorTeams() { return request.get('/honor/teams') },
  getHonorTeamMembers(params) { return request.get('/honor/teamMembers', { params }) },
  getHonorMembers(params) { return request.get('/honor/members', { params }) },
  getHonorMemberDetail(params) { return request.get('/honor/memberDetail', { params }) },
  getHonorParticipationOverview() { return request.get('/honor/participationOverview') },
  getHonorParticipations(params) { return request.get('/honor/participations', { params }) },

  // ---- 论坛 ----
  getDiscussList(params) { return request.get('/discussList', { params }) },
  addDiscuss(data) { return request.post('/addDiscuss', data) },
  deleteDiscuss(data) { return request.post('/deleteDiscuss', data) },
  submitReply(data) { return request.post('/submitReply', data) },
  getReplyList(params) { return request.get('/getReplyList', { params }) },

  // ---- 消息 ----
  getMessage(params) { return request.get('/getMessage', { params }) },

  // ---- 意见反馈 ----
  submitFeedback(data) { return request.post('/feedback', data) }
}
