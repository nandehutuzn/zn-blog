<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <button @click="throwException">抛出异常</button>
    <HelloWorld msg="Welcome to Znnnnn GitHub Pages"/>
  </div>
</template>
<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  methods: {
    throwException () {
      var a = 34
      a.bb = 123
      console.log(a)
    }
  }
}
</script>
