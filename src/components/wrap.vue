<template>
  <div class="index-cont" :style="{width:winWidth +'px',height:winHeight +'px'}">
     <nav-bar v-bind:winHeight="winHeight"></nav-bar>
     <tools-bar v-bind:winHeight="winHeight" v-bind:winWidth="winWidth"></tools-bar>
     <router-view></router-view>
  </div>
</template>

<script>
   import navBar from '../model/navbar.vue';
   import toolsBar from '../model/toolsBar.vue';
   export default {
     data(){
      return {
           winWidth:1080,
           winHeight:768,
        }
     },
     components:{
       'nav-bar':navBar,
       'tools-bar':toolsBar,
     },
     methods:{
        setWindow() {
          this.winWidth = window.innerWidth;
          this.winHeight = window.innerHeight;
        }
     },
     mounted() {
        this.setWindow();
        window.onresize = ()=>{
           this.setWindow();
        }
     }
   }
</script>
<style lang="css" scoped>
   .index-cont {
     overflow-x:hidden; 
   }
</style>

