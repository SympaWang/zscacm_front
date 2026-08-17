<template>
  <div class="reply-section">
    <!-- 顶部评论输入 -->
    <div class="reply-editor" @click="inputFocus" v-clickoutside="hideReplyBtn">
      <el-avatar class="editor-avatar" :size="40" :src="myHeader">{{ myName.charAt(0) }}</el-avatar>
      <div class="editor-body">
        <div
          tabindex="0"
          contenteditable="true"
          id="replyInput"
          spellcheck="false"
          placeholder="输入评论..."
          class="reply-input"
          @focus="showReplyBtn"
          @input="onDivInput"
        ></div>
        <div class="editor-actions" v-show="btnShow">
          <el-button class="reply-btn" size="medium" @click="sendComment" type="primary">发表评论</el-button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-for="(comment, index) in comments" :key="index" class="comment-item">
      <el-avatar class="comment-avatar" :size="40">{{ (comment.name || '?').charAt(0) }}</el-avatar>
      <div class="comment-body">
        <div class="comment-head">
          <span class="comment-name">{{ comment.name }}</span>
          <span class="comment-time">{{ comment.createTime }}</span>
          <span class="comment-reply-btn" @click="showReplyInput(index, comment.name, comment.id)">
            <el-icon><ChatDotSquare /></el-icon>
            回复 {{ comment.commentNum || 0 }}
          </span>
        </div>
        <div class="comment-content">{{ comment.comment }}</div>

        <!-- 二级回复 -->
        <div v-if="comment.reply && comment.reply.length" class="sub-replies">
          <div v-for="(reply, r) in comment.reply" :key="r" class="sub-reply">
            <span class="sub-reply-from">{{ reply.from }}</span>
            <span class="sub-reply-at">回复 @{{ reply.to }}:</span>
            <span class="sub-reply-text">{{ reply.comment }}</span>
            <span class="sub-reply-time">{{ reply.createTime }}</span>
          </div>
        </div>

        <!-- 二级回复输入框 -->
        <div class="sub-reply-editor" v-show="_inputShow(index)">
          <el-avatar class="editor-avatar" :size="32" :src="myHeader"></el-avatar>
          <div class="editor-body">
            <div
              tabindex="0"
              contenteditable="true"
              spellcheck="false"
              placeholder="回复评论..."
              @input="onDivInput"
              class="reply-input sub-input"
            ></div>
            <div class="editor-actions">
              <el-button class="reply-btn" size="small" @click="sendCommentReply(index)" type="primary">回复</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '../api'

const props = defineProps({
  row: { type: Object, default: () => ({}) }
})

const store = useStore()
const row = ref(props.row)
const btnShow = ref(false)
const index = ref('0')
const replyComment = ref('')
const myName = ref(store.state.username || '我')
const myHeader = ref('')
const myId = ref(0)
const to = ref('')
const toId = ref(-1)
const comments = ref([])

const vClickoutside = {
  mounted(el, binding) {
    function d(l) {
      if (el.contains(l.target)) return false
      binding.value && binding.value(l)
    }
    el.vueClickOutside = d
    document.addEventListener('click', d)
  },
  unmounted(el) {
    document.removeEventListener('click', el.vueClickOutside)
    delete el.vueClickOutside
  }
}

function inputFocus() {
  const t = document.getElementById('replyInput')
  if (t) {
    t.style.padding = '12px 12px'
    t.style.border = '2px solid var(--primary)'
    t.focus()
  }
}

function showReplyBtn() {
  btnShow.value = true
}

function hideReplyBtn() {
  btnShow.value = false
  const replyInput = document.getElementById('replyInput')
  if (replyInput) {
    replyInput.style.padding = '12px'
    replyInput.style.border = '1px solid var(--border-color)'
  }
}

function showReplyInput(t, e, o) {
  comments.value[index.value].inputShow = false
  index.value = t
  comments.value[t].inputShow = true
  to.value = e
  toId.value = o
}

function _inputShow(t) {
  return comments.value[t].inputShow
}

function onDivInput(t) {
  replyComment.value = t.target.innerHTML
}

function sendComment() {
  if (!replyComment.value) {
    ElMessage({ showClose: true, type: 'warning', message: '评论不能为空' })
  } else {
    const t = {}
    t.fromId = store.state.uid
    t.toId = row.value.uid
    t.context = replyComment.value
    t.replyId = row.value.discussId
    t.replyType = 1
    console.log(t)
    api.submitReply(t).then(() => {
      replyComment.value = ''
      ElMessage.success('评论成功')
      setTimeout(() => location.reload(), 600)
    })
  }
}

function sendCommentReply(t) {
  if (!replyComment.value) {
    ElMessage({ showClose: true, type: 'warning', message: '评论不能为空' })
  } else {
    const e = {}
    e.fromId = store.state.uid
    e.toId = comments.value[t].fromId
    e.context = replyComment.value
    e.replyId = comments.value[t].id
    e.replyType = 2
    console.log(e)
    api.submitReply(e).then(() => {
      replyComment.value = ''
      ElMessage.success('回复成功')
      setTimeout(() => location.reload(), 600)
    })
  }
}

onMounted(() => {
  row.value = props.row
  api.getReplyList({ discussId: row.value.discussId }).then(t => {
    console.log(t)
    comments.value = t.data.data
  }).catch(t => {
    console.log(t)
    ElMessage.error('请求超时，请重试！')
  })
})
</script>

<style scoped>
.reply-editor {
  display: flex;
  gap: 12px;
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}
.editor-avatar { flex-shrink: 0; background: var(--primary); color: #fff; }
.editor-body { flex: 1; }
.reply-input {
  border: 1px solid var(--border-color);
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  outline: none;
  min-height: 64px;
  transition: border-color .2s;
  font-size: 14px;
  line-height: 1.6;
}
.reply-input:focus { border-color: var(--primary); }
.editor-actions { padding-top: 10px; text-align: right; }

.comment-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px dashed #f0f0f0; }
.comment-avatar { flex-shrink: 0; background: #909399; color: #fff; }
.comment-body { flex: 1; }
.comment-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.comment-name { font-weight: 600; color: var(--text-main); }
.comment-time { font-size: 12px; color: var(--text-muted); }
.comment-reply-btn { margin-left: auto; cursor: pointer; color: var(--primary); font-size: 13px; }
.comment-content { margin-top: 8px; line-height: 1.7; font-size: 14px; color: var(--text-secondary); }

.sub-replies { margin-top: 10px; background: #f7f8fa; border-radius: 8px; padding: 10px 14px; }
.sub-reply { padding: 6px 0; font-size: 13px; line-height: 1.6; }
.sub-reply-from { font-weight: 600; }
.sub-reply-at { color: var(--primary); }
.sub-reply-text { color: var(--text-secondary); }
.sub-reply-time { float: right; color: var(--text-muted); font-size: 12px; }

.sub-reply-editor { display: flex; gap: 10px; margin-top: 12px; background: #fafafa; padding: 12px; border-radius: 8px; }
.sub-input { min-height: 44px; }
</style>
