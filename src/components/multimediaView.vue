<template>
  <div class="img-view" :style="{height:winHeight +'px',width:winWidth +'px'}" id="imgView">
     <p><img src="" alt="" ></p>
     <div>
        <video :src="videoSrc" :width="winWidth-100" :height="winHeight-30" controls="controls" v-if="isVideo" :style="{marginTop:winHeight<=550?'-50px':'0'}"></video>
        <audio :src="audioSrc" controls="controls" v-else></audio>
     </div>
  </div>
</template>

<script>
  export default {
    data(){
      return {
          winWidth: window.innerWidth,
          winHeight: window.innerHeight,
          videoSrc:'',
          audioSrc:'',
          isVideo:true
      }
    },
    methods:{
      setWindow() {
        this.winWidth = window.innerWidth;
        this.winHeight = window.innerHeight;
      }
    },
    created() {
       setInterval(()=>{
          var src = GetArgument();
          console.log(src)
          if(src.indexOf('videoSrc') !== -1) {
             //此时传入的是视频地址
             this.isVideo = true;
             this.videoSrc = src.slice(src.indexOf('videoSrc')+9);

          }else if(src.indexOf('audioSrc') !== -1) {
             //此时传入的是视频地址
             this.isVideo = false;
             this.audioSrc = src.slice(src.indexOf('audioSrc')+9);
          }
          
       }, 300)
    },
    mounted(){
      this.setWindow();
      window.onresize = ()=>{
         this.setWindow();
      }
    }
  }
</script>
<style lang="css" scoped>  
   .img-view {
     display: flex;
     justify-content: center;
     align-items: center;
     flex-direction: column;
     position: relative;
     overflow: hidden;
     position: relative;
   }

   .img-view p{
     position: fixed;
     right: 12%;
     top: 8%;
     z-index: 10;
     width: 32px;
     height: 32px;  
   }

   .img-view img {
    cursor: pointer;

   }

   .img-content {
     position: absolute;
     display: flex;
     justify-content: center;
     align-items: center;
     transition: transform 1s;
   }

   video::-internal-media-controls-download-button {
      display:none;
  }

  video::-webkit-media-controls-enclosure {
      overflow:hidden;
  }

  video::-webkit-media-controls-panel {
      width: calc(100% + 30px); 
  }

  audio::-internal-media-controls-download-button {
      display:none;
  }

  audio::-webkit-media-controls-enclosure {
      overflow:hidden;
  }

  audio::-webkit-media-controls-panel {
      width: calc(100% + 30px); 
  }




</style>

