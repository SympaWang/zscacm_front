<template>

<div>
    <create></create>
    <list v-show="listShow"></list>
</div>

      
</template>

<script>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import list from '../components/discuss/list.vue'
import create from '../components/discuss/create.vue'

export default {
  data: function() {
    return{
        listShow: true,
        msg: '',
    }
  },

  components: {
    list,
    create
  },

  methods: {

  },

  created: function()  {

  }

}

</script>