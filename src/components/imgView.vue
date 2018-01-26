<template>
  <div class="img-view" :style="{height:winHeight +'px',width:winWidth +'px'}" id="imgView"  
          @DOMMouseScroll="imgScale($event)" 
          @mousewheel="imgScale($event)"
          @mousemove.prevent="overmove"
          @mouseup="endmove"
          >
     <p><img src="../assets/选转.png" alt="" @click="imgRotate" ></p>
     <div 
     class="img-content" 
     :style="{transform:'rotate('+rotate+'deg) scale('+scale+')',left:left + 'px',top:top+'px',height:winHeight +'px',width:winWidth +'px'}"
     @mousedown.stop="startmove"
     >
        <img :src="imgSrc" alt="" ref="showImg" @dragstart.prevent="">
     </div>
  </div>
</template>

<script>
  export default {
    data(){
      return {
          winWidth: window.innerWidth,
          winHeight: window.innerHeight,
          input:'',
          textarea:'',
          rotate:0,
          scale:0.5,
          imgSrc:'',
          left: 0,
          top: 0,
          moveFlag:false,
          prevLeft:0,
          prevTop: 0
      }
    },
    methods:{
      setWindow() {
        this.winWidth = window.innerWidth;
        this.winHeight = window.innerHeight;
      },
      imgRotate() {
        this.rotate += 90;
      },

      imgScale(e) {
        if(this.moveFlag) return;
        var type = 1;
        if(e.wheelDelta < 0 || e.detail > 0){
            type = -1 ;
        }else {
            type = 1 ;
        }

        if(type == 1) {  //放大
          if(this.scale >= 2) {
            return 
          }

          this.scale *= 1.1;
       

        }else if(type == -1){  //缩小
          if(this.scale <= 0.5) {
            return 
          }//缩小到最小

          this.scale /= 1.1;
        }
      },
      startmove(e) {
        this.moveFlag = true;
        this.prevLeft = e.pageX - e.target.parentNode.offsetLeft;
        this.prevTop = e.pageY - e.target.parentNode.offsetTop;
      },
      overmove(e) {
        if(this.moveFlag) {
            this.left = e.pageX - this.prevLeft;
            this.top = e.pageY - this.prevTop;
        }
      },
      endmove(e) {
        this.moveFlag = false;
      }
    },
    created() {
       if(env == 'dev') {
          this.imgSrc = location.href.slice(location.href.indexOf('imgSrc')+7);
          this.imgSrc = './'+this.imgSrc.slice(this.imgSrc.indexOf('static'));
          this.imgSrc = this.imgSrc.replace('%2F', '/','g');
       }else if( env == 'prod') {
          setInterval(()=>{
             // this.imgSrc = GetArgument().slice(GetArgument().indexOf('imgSrc')+7);
             this.imgSrc = localStorage.getItem('imgSrcInBook');
          }, 200)
       }
    },
    mounted(){
      this.setWindow();
      window.onresize = ()=>{
         this.setWindow();
      }
    },
    update() {
       
    },
    watch:{
      'imgSrc':function(nv) {
          //初始化图片位置
          // setTimeout(()=>{
          //   this.left = this.winWidth/2 - this.$refs.showImg.offsetWidth / 2;
          //   this.top = this.winHeight/2 - this.$refs.showImg.offsetHeight / 2;
          // }, 100)
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
     top: 12%;
     z-index: 10;
     width: 32px;
     height: 32px;  
   }
  .img-view p img{
    width: 100%;
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




</style>

