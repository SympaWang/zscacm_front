<template>
    <div>
        <div style=" margin-top: 30px 0;">

            <div style="margin-bottom: 20px;">
                <el-input placeholder="文章标题" v-model="title"></el-input>
            </div>

            <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
                style="border-bottom: 1px solid #ccc"
            />
            <Editor
                :defaultConfig="editorConfig"
                :mode="mode"
                v-model="valueHtml"
                style="height: 400px; overflow-y: hidden;"
                @onCreated="handleCreated"
                @onChange="handleChange"
                @onDestroyed="handleDestroyed"
                @onFocus="handleFocus"
                @onBlur="handleBlur"
                @customAlert="customAlert"
                @customPaste="customPaste"
            />
        </div>

        <div style="padding: 20px 0; float: left;">
        <el-button type="primary" @click="submit">发布</el-button>
    </div>

    </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { addDiscuss } from "../../api/discuss";
import { useStore } from 'vuex' // 引入useStore 方法

export default {
  components: { Editor, Toolbar },
  setup() {
    // 编辑器实例，必须用 shallowRef，重要！
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = ref('<p>hello</p>')

    // 模拟 ajax 异步获取内容
    /*onMounted(() => {
        setTimeout(() => {
            valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
        }, 1500)
    })*/
 
    const title = ref('')

    const toolbarConfig = {}
    const editorConfig = { 
        placeholder: '请输入内容...',
        MENU_CONF: {}
    }

    var msg = ''

    editorConfig.MENU_CONF['uploadImage'] = {
        server: 'http://175.178.183.73:9050/',

        base64LimitSize: 5000 * 1024 // 5kb
    }

    // 组件销毁时，也及时销毁编辑器，重要！
    onBeforeUnmount(() => {
        const editor = editorRef.value
        if (editor == null) return

        editor.destroy()
    })

    const store = useStore()

    const submit = () => {

        addDiscuss(store.state.username, title._value, msg).then((res) => {
            console.log(res);

        })
        .catch((err) => {
            ElMessage.error('提交失败，请重试！');
            console.log(err)
        })

    }

    // 编辑器回调函数
    const handleCreated = (editor) => {
      console.log('created', editor);
      editorRef.value = editor // 记录 editor 实例，重要！
    }
    const handleChange = (editor) => {
      msg = editor.getHtml();
      console.log('change:', msg);
    }
    const handleDestroyed = (editor) => {
      console.log('destroyed', editor)
    }
    const handleFocus = (editor) => {
        console.log('focus', editor)
    }
    const handleBlur = (editor) => {
        console.log('blur', editor)
    }
    const customAlert = (info, type) => {
        alert(`【自定义提示】${type} - ${info}`)
    }
    const customPaste = (editor, event, callback) => {
        console.log('ClipboardEvent 粘贴事件对象', event)

        // 自定义插入内容
        editor.insertText(event)

        // 返回值（注意，vue 事件的返回值，不能用 return）
        //callback(false) // 返回 false ，阻止默认粘贴行为
        callback(true) // 返回 true ，继续默认的粘贴行为
    }

    const insertText = () => {
        const editor = editorRef.value
        if (editor == null) return
        editor.insertText('hello world')
    }

    const printHtml = () => {
        const editor = editorRef.value
        if (editor == null) return
        console.log(editor.getHtml())
    }

    const disable = () => {
        const editor = editorRef.value
        if (editor == null) return
        editor.disable()
    }

    return {
      editorRef,
      mode: 'default',
      valueHtml,
      title,
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleChange,
      handleDestroyed,
      handleFocus,
      handleBlur,
      customAlert,
      customPaste,
      insertText,
      printHtml,
      submit,
      disable,
    };
  }
}
</script>
