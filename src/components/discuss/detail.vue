<template>

  <div style="margin-bottom: 50px; padding-top: 50px; padding-left: 0px; width: 70%;float:left;">

        <div style="padding-bottom: 20px; background-color: white; padding: 10px 10px 10px 10px;">
          <h2 style="text-align: left;">{{row.title}}</h2>
          <div style="text-align: left;">
            {{row.username}}
            发布于:{{row.createTime}}
          </div>

        </div>
        <div class="editor-content-view" v-html="row.context" style="background-color: white; padding: 10px 10px 10px 10px;"></div>
        <div>
          <div style="text-align: left;">
            <h2>评论</h2>
          </div>
          <reply></reply>
        </div>

  </div>
  <div style="padding-top: 50px; padding-left: 0px; float:left; width: 30%;">
  </div>

      
</template>

<script>

import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import reply from '../discuss/reply.vue'

import 'prismjs'
import 'prismjs/themes/prism.css'



export default {
  data: function() {
    return{
        row: '',
    }
  },

  methods: {
    
  },

  components: {
    reply,
  },

  created: function()  {

    this.row = JSON.parse(this.$store.state.discuss);
    console.log(this.row)
  },

  mounted: function() {

    const oScript = document.createElement('script');
    oScript.type = 'text/javascript';
    oScript.src = 'https://unpkg.com/prismjs@latest/components/prism-java.js';
    document.body.appendChild(oScript);
    
    const bScript = document.createElement('script');
    bScript.type = 'text/javascript';
    bScript.src = 'https://unpkg.com/prismjs@latest/components/prism-core.js';
    document.body.appendChild(bScript);

    const eScript = document.createElement('script');
    eScript.type = 'text/javascript';
    eScript.src = 'https://unpkg.com/prismjs@latest/components/prism-c.js';
    document.body.appendChild(eScript);

    const dScript = document.createElement('script');
    dScript.type = 'text/javascript';
    dScript.src = 'https://unpkg.com/prismjs@latest/components/prism-cpp.js';
    document.body.appendChild(dScript);



    const fScript = document.createElement('script');
    fScript.type = 'text/javascript';
    fScript.src = 'https://unpkg.com/prismjs@latest/components/prism-python.js';
    document.body.appendChild(fScript);

    const aScript = document.createElement('script');
    aScript.type = 'text/javascript';
    aScript.src = 'https://unpkg.com/prismjs@latest/prism.js';
    document.body.appendChild(aScript);

    const cScript = document.createElement('script');
    cScript.type = 'text/javascript';
    cScript.src = 'https://unpkg.com/prismjs@latest/plugins/autoloader/prism-autoloader.js';
    document.body.appendChild(cScript);
    



    setTimeout(() => {
      Prism.highlightAll();
	}, 1000);
  }

}

</script>

<style>

.editor-content-view {
  border: 3px solid #ccc;
  border-radius: 5px;
  padding: 0 10px;
  margin-top: 20px;
  overflow-x: auto;

}

.editor-content-view p,
.editor-content-view li {
  white-space: pre-wrap; /* 保留空格 */
}

.editor-content-view blockquote {
  border-left: 8px solid #d0e5f2;
  padding: 10px 10px;
  margin: 10px 0;
  background-color: #f1f1f1;
}

.editor-content-view code {
  font-family: monospace;
  background-color: #eee;
  padding: 3px;
  border-radius: 3px;
}
.editor-content-view pre>code {
  display: block;
  padding: 10px;
}

.editor-content-view table {
  border-collapse: collapse;
}
.editor-content-view td,
.editor-content-view th {
  border: 1px solid #ccc;
  min-width: 50px;
  height: 20px;
}
.editor-content-view th {
  background-color: #f1f1f1;
}

.editor-content-view ul,
.editor-content-view ol {
  padding-left: 20px;
}

.editor-content-view input[type="checkbox"] {
  margin-right: 5px;
}

</style>