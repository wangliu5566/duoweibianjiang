<template>
  <div class="index-cont" :style="{height:winHeight +'px'}" @contextmenu.prevent="">
     <!-- winHeight <= 600?winHeight*0.025 +'px': -->
     <div></div>
     <div 
     v-if="!isShowScale"
     class="index-dimen" 
     ref="indexDimen" 
     :style="{margin:winHeight*0.15 +'px auto',height:winHeight > 750 ?winHeight*0.6 + 'px':winHeight*0.7 +'px'}">
       <div  v-for="item in indexData" :style="{width: '20.37%'}" @click="toPath(item.toPath,item.title)">
          <div class="dimen" :style="{height: winWidth*0.8255*0.2037*0.619 + 'px'}">
             <img :src="item.src" alt="" @dragstart.prevent="">
          </div>
          <div class="content-dimen">
            <div class="small-icon">
              <span :style="{height: winWidth*0.8255*0.2037*0.294*0.6 + 'px'}">
                 <img :src="item.icon" alt="" @dragstart.prevent="">
              </span>
            </div>

              <div class="content-text" :style="{height:winHeight > 750 ?(winHeight*0.6)*0.6 +'px' : (winHeight*0.7)*0.6 +'px'}">
                    <div :style="{height:winHeight >= 500? '90%':'80%'}">
                      {{item.intro}}
                   </div>
              </div>
          </div>
       </div>
     </div>

     <div
      v-else
      class="index-dimen1"
      ref="indexDimen1" 
      :style="{marginTop:winWidth > 500 ? winHeight*0.27 +'px' : winHeight*0.1 +'px' }"
      >
       <div  
        v-for="item in indexData" 
       
        @click="toPath(item.toPath,item.title)">
          <div class="dimen1" :style="{height: winHeight*0.24 + 'px'}"
          >
             <img :src="item.srcSmall" alt="" @dragstart.prevent="">
          </div>
          <div style="height:100px;">
            <div
            style="margin-left: 10%;overflow: hidden">
              <span :style="{width: '50%',height: winWidth*0.935*0.2244 + 'px'}">
                 <img :src="item.icon" alt="" @dragstart.prevent="">
              </span>
            </div>
          </div>
       </div>
     </div>
  </div>
</template>
<!-- :style="{width: '22.44%'}" -->
<script>
   // import navBar from '../model/navbar.vue';
   export default {
     data(){
      return {  
           winWidth:1080,
           winHeight:768,
           scrollTimer:null,
           isShowScale:false,
           indexData:[{
              src:'./static/images/1.png',
              srcSmall:'./static/images/小1.png',
              icon:'./static/images/书.png',
              intro:'图书库收录边疆研究图书近百本内容涵盖新中国成立以来边疆研究学者的重要学术专著，以及近代以来直至新中国成立前面世的稀见边疆研究著述及其解题。收录书目由国内边疆研究领域一流专家精心挑选，为您呈现最权威的边疆研究资料与学术成果。您可以选择整本阅读从而深入全面地了解某一专项研究的完整成果也可以根据自己的需要按章节阅读。同时系统给出的丰富筛选条件能够帮助您快速精确地找到感兴趣的内容。系统还提供了一系列辅助工具，最大限度地为您的阅读过程提供各种便利。',
              toPath:'/booklist',
              title:'图书列表'
           },{
              src:'./static/images/2.png',
              srcSmall:'./static/images/小2.png',
              icon:'./static/images/图.png',
              intro:'地图库收录中国不同历史时期高清地图32张，为您了解中国历史边疆情况进行深入研究提供参考您可以通过点击图上热区查看某一具体地区、地点的相关文章；也可以通过点击屏幕左上方按钮阅读该图对应时期的专门论述，查看同时期的重要边疆事件在读图界面，您可以对地图进行放大缩小、漫游等操作，还可以对任意两张不同时期的地图进行重叠对比，从而直观掌握中国不同历史时期的边疆变化情况。',
              toPath:'/maplist',
              title:'地图列表'
           },{
              src:'./static/images/3.png',
              srcSmall:'./static/images/小3.png',
              icon:'./static/images/事.png',
              intro:'事件库收录秦代以来重要边疆事件154个，这些事件对中国历史边疆的演变产生了深远的影响。通过了解这些事件，您能快速掌握中国历史边疆的形成和变化情况，从而对于中国边疆研究对象有一个更直观的认识。您可以通过专题页中的描述了解事件的大致经过和历史影响相关地图、相关地点、相关人物等信息也能帮助您更全面地掌握事件全貌。在此基础之上阅读图书库内的相关章节，可以起到事半功倍的效果。',
              toPath:'/eventsList',
              title:'事件列表'
           },{
              src:'./static/images/4.png',
              srcSmall:'./static/images/小4.png',
              icon:'./static/images/人.png',
              intro:'人物库共收录重要边疆历史人物600余位，包括古代边地民政政权的领袖中原历代王朝的重要将领，以及外交方面有突出贡献的官员，等等。在历史的长河里，这些重要的边疆人物所代表的各方势力相互作用，有征伐、有联合，共同底定了中国之疆域，而中华民族也在这个漫长的历史过程中经由不同的文化碰撞、融合最终形成边疆历史人物是研究边疆的重要入口我们为每一个人物准备了专题页，您可以在其中查看人物简介，相关的历史事件，以及图书库内涉及他生平事迹的具体内容。',
              toPath:'/personList',
              title:'人物列表'
           }],

        }
     },
     methods:{
        setWindow() {
          this.winWidth = window.innerWidth;
          this.winHeight = window.innerHeight;

           if(env == 'prod') {
               var winformWidth = GetFormWidth();
               if(this.winWidth <= parseInt(winformWidth)/2 + 50) {
                   this.isShowScale = true; 
               }else {
                   this.isShowScale = false;
               }
            }

          // alert(GetFormWidth().toString());
        },
        
        toPath(path,title) {
          CloseMenueStrip();
          if(env == 'dev') {
             this.$router.push(path);
          }else if(env == 'prod') {
             loadForm('/index.html#'+path,'资源',title,false);
             CloseForm();
          }
        },
        getUserInfo(userid) {
            ApiTransfer('get','/user/detail',JSON.stringify({id:userid}),(winResult)=>{
                winResult=JSON.parse(winResult)
                if(winResult.Success){
                  localStorage.setItem("userInfo",JSON.stringify(winResult.Data));
                }else {
                  ShowMessage('获取用户信息失败，请重新登录！')
                }
            });      
        }
        // upload() {
        //   var a = UpLoadFile();
        //   alert(a);
        // }
     },
     mounted() {
        this.setWindow();
        // 获取用户id
        var userid = GetUserId();

        if(userid) { 
           localStorage.setItem('userId',userid);
           if(localStorage.getItem('userInfo')) {
               var userInfo = localStorage.getItem('userInfo');
               userInfo = JSON.parse(userInfo);

               if(userInfo.Id != userid) {
                  this.getUserInfo(userid);
               }
           }else {
               this.getUserInfo(userid);
           }
        }

        // ShowDevTools();
        window.onresize = ()=>{
           this.setWindow();
        }
     },
     updated() {

        // if(this.$refs.indexDimen){
        //     var listOfdimen = this.$refs.indexDimen.children;
        //     for(var i = 0 ; i < listOfdimen.length ; i ++) {
        //        if(i == 0) continue;
        //        listOfdimen[i].style.height = parseInt(getComputedStyle(listOfdimen[0]).height) + 'px';
        //     }
        // }else{
        //   var listOfdimen1 = this.$refs.indexDimen1.children;
        //     for(var i = 0 ; i < listOfdimen1.length ; i ++) {
        //        if(i == 0) continue;
        //        listOfdimen1[i].style.height = parseInt(getComputedStyle(listOfdimen1[0]).height) + 'px';
        //     }
        // }
        
     },
     watch:{
     }
   }
</script>
<style lang="css" scoped>
::-webkit-scrollbar{width:0px;}
::-webkit-scrollbar-track{background-color:#bee1eb;}
::-webkit-scrollbar-thumb{background-color:#00aff0;}
/* ::-webkit-scrollbar-thumb:hover {background-color:#9c33} */
/* ::-webkit-scrollbar-thumb:active {background-color:#00aff0} */

    .index-cont {
     overflow: hidden;
     overflow-y: visible;
  } 

   .index-dimen {
      display: flex;
      justify-content: flex-start;
      /*margin: 16% auto;*/
      width: 82.55%;
      letter-spacing: 1px;
   }

   .index-dimen1{
      display: flex;
      justify-content: flex-start;
      margin: 18.5% auto;
      width: 93.5%;
   }

    .index-dimen1>div {
      margin-right:3.5%;
      height:100%;
      width: 22.4%;
      font-size: 14px;
      box-sizing: border-box;
      box-shadow:0px 0px  20px #ccc;
      cursor: pointer;
   }
   .dimen1 {
      margin-bottom: 10%;
      width: 100%;
      box-sizing: border-box;
   }
   @media screen and (max-width: 500px) {
   .index-dimen1 {
        flex-direction: column;
        justify-content: flex-start;
        height: auto;
        width: 50.4%;
        margin: 8% auto;
    }
    .index-dimen1>div {
      margin-bottom:14%;
      height:100%;
      width: 192px;
      font-size: 14px;
      box-sizing: border-box;
      box-shadow:0px 0px  20px #ccc;
      cursor: pointer;
   }
}
   .index-dimen>div {
      margin-right:6.18%;
      margin-bottom: 3%;
      height:100%;
      overflow: hidden;
      font-size: 14px;
      box-sizing: border-box;
      box-shadow:0px 0px  20px #ccc;
      cursor: pointer;
      overflow: hidden;

   }

   div>img{
    width: 100%;
    height: 100%;
   }

   .index-dimen>div:nth-child(4) {
      margin-right: 0;
   }
   .index-dimen1>div:nth-child(4) {
      margin-right: 0;
   }
   
   .index-dimen>div:hover {
      outline: 1px solid #5980b8;
   }
   .index-dimen1>div:hover {
      outline: 1px solid #5980b8;
   }

   .dimen {
      margin-bottom: 4%;
      height: 75%;
      width: 100%;
      box-sizing: border-box;
   }

   .dimen1 {
      margin-bottom: 10%;
      width: 100%;
      box-sizing: border-box;
   }


   .content-dimen {
      display: flex;
      width: 100%;
      height: auto
   }   

   .small-icon {
      width: 29.4%;
   }

   .small-icon span {
      display: inline-block;
      width: 42%;
      margin: 10% 29%;
      height: 20%;
   }

   .content-text {
      width: 90%;
      margin: 0 10% 0 0;
      padding-bottom: 10%;
      line-height: 20px;
      font-size: 12px;
      text-indent: 25px;
      overflow: hidden;
   }
   .content-text div{
        width: 100%;
        overflow: auto;
   }

   .index-dimen span {
      float: left;
      margin: 20px 7.73% 200% ;
      width: 12.39%;
      height: 12.5%;
   }

 /*   .index-dimen img {
      width: 100%;
      height: 100%;
   } */

  .dimen span {
      display: block;
      text-align: center;
      cursor: pointer;
      line-height: 100px;
      width: 100px;
      height: 100px;
      font-size: 50px;
      color:white;
      border-radius: 50%;
      background: #5980b8;
   }
</style>