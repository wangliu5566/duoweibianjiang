<template>
  <div :style="{height:winHeight/20 +'px'}">
    <el-menu class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-submenu index="1" style="margin-left:50px">
        <template slot="title">资源相关</template>
        <el-menu-item index="1-1">图书</el-menu-item>
        <el-menu-item index="1-2">地图</el-menu-item>
        <el-menu-item index="1-3">事件</el-menu-item>
        <el-menu-item index="1-4">人物</el-menu-item>
        <el-menu-item index="1-5">搜索资源</el-menu-item>
        <el-menu-item index="1-6">涉及地区</el-menu-item>
        <el-menu-item index="1-7">涉及人物</el-menu-item>
        <el-menu-item index="1-8">涉及事件</el-menu-item>
        <el-menu-item index="1-9">相关地图</el-menu-item>
        <el-menu-item index="1-10">相关文章</el-menu-item>
        <el-menu-item index="1-11">文内搜索</el-menu-item>
      </el-submenu>

      <el-submenu index="2">
        <template slot="title">页面操作</template>
        <el-menu-item index="2-1">页码</el-menu-item>
        <el-menu-item index="2-2">字体</el-menu-item>
        <el-menu-item index="2-3">背景</el-menu-item>
        <el-menu-item index="2-4">书签</el-menu-item>
        <el-menu-item index="2-5">收藏</el-menu-item>
        <el-menu-item index="2-6">笔记</el-menu-item>
        <el-menu-item index="2-7">设备</el-menu-item>
        <el-menu-item index="2-8">热区</el-menu-item>
        <el-menu-item index="2-9">近代图</el-menu-item>
        <el-menu-item index="2-10">地图加</el-menu-item>
        <el-menu-item index="2-11">旋转</el-menu-item>
        <el-menu-item index="2-12">插入图片</el-menu-item>
        <el-menu-item index="2-13">插入视频</el-menu-item>
        <el-menu-item index="2-14">插入音频</el-menu-item>
      </el-submenu>

      <el-submenu index="3">
        <template slot="title">窗口管理</template>
        <el-menu-item index="3-1">横向均排</el-menu-item>
        <el-menu-item index="3-2">竖向均排</el-menu-item>
        <el-menu-item index="3-3">自定义</el-menu-item>
        <el-menu-item index="3-4">关闭所有窗口</el-menu-item>
      </el-submenu>

      <el-submenu index="4">
        <template slot="title">个人中心</template>
        <el-menu-item index="4-1">我的足迹</el-menu-item>
        <el-menu-item index="4-2">我的书签</el-menu-item>
        <el-menu-item index="4-3">我的收藏</el-menu-item>
        <el-menu-item index="4-4">笔记管理</el-menu-item>
        <el-menu-item index="4-5">下载管理</el-menu-item>
      </el-submenu>

      <el-submenu index="5">
        <template slot="title">设置</template>
        <el-menu-item index="5-1">开启推送消息</el-menu-item>
        <el-menu-item index="5-2">开启复制文字自带出处</el-menu-item>
        <el-menu-item index="5-3">修改密码</el-menu-item>
        <el-menu-item index="5-4">检查更新</el-menu-item>
      </el-submenu>

      <el-menu-item index="6">登录/注册</el-menu-item>
    </el-menu>

    <!-- 登录注册模态框 -->
    <el-dialog  :visible.sync="openDialog" size="tiny" :before-close="closeModal">
       <span v-if="showBlueColor!=3" slot="title" class="dialog-title">
            <button @click="loginReg(1)" :class="{'blueColor':showBlueColor==1}" style="margin-right: -6px;">登录</button>
            <button @click="loginReg(2)" :class="{'blueColor':showBlueColor==2}">注册</button>
       </span>

       <span v-if="showBlueColor==3" slot="title" class="dialog-title">
          <i class="el-icon-arrow-left" v-if="showBlueColor==3" id="returnPage" @click="loginReg(1)"></i>
          <span>忘记密码</span>
       </span>
     
      <div>
        <!-- 登录 -->
        <div v-if="showBlueColor==1">
          <login></login>
          <p style="text-align: right;cursor:pointer" @click="loginReg(3)">忘记密码</p>
          <p style="text-align: center;margin-bottom: 15px;">
            <span>----</span>
            <span style="margin:0 5px;">快速登录</span>
            <span>----</span>
          </p>
          <div class="iconImg">
            <div class="png1"  @click="oauthLogin(1)"></div>
            <div class="png2"  @click="oauthLogin(2)"></div>
            <div class="png3"  @click="oauthLogin(3)"></div>
          </div>
        </div>
        <!-- 注冊 -->
        <register v-if="showBlueColor==2"></register>
        <!-- 找回密码 -->
        <lookforPSD v-if="showBlueColor==3"></lookforPSD>
      </div>
     
    </el-dialog>
  </div>
</template>

<script>
  import login from "@/components/user/Login.vue"
  import register from "@/components/user/register.vue"
  import lookforPSD from "@/components/user/lookforPSD.vue"

  import{mapGetters,mapActions} from 'vuex'
  export default {
    data() {
      return {
        activeIndex: '1',
        activeIndex2: '1',
        showBlueColor:"1",//1是登录，2是注册，3是忘记密码
      };
    },
    props:['winHeight'],
    components:{
      login,
      register,
      lookforPSD
    },
    computed: mapGetters(['openDialog']),
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
        document.getElementsByClassName('el-dialog__header')[0].style.textAlign="center"
        switch(key){
          case "6":
            this.$store.dispatch('openLoginModal',true);
            break;
          case '4-1':
            this.$router.push("/footPrint");
            break;
          case '4-2':
            this.$router.push("/bookMark");
            break;
          case '4-3':
            this.$router.push("/myCollect");
            break;
          case '4-4':
            this.$router.push("/noteList");
            break;
          case '4-5':
            this.$router.push("/downLoad");
            break;
        }
      },
      closeModal(){
         this.$store.dispatch('openLoginModal',false);//关闭模态框1
      },
      loginReg(index){
        this.showBlueColor=index;
      },
      oauthLogin(index){ //第三方平台登录
          this.$http.post("/passport/oauthlogin",{
                openid:'',
                platformid:index,
                token:'',
            })
            .then((reponse)=>{
              if(reponse.data.Data.State==1){
                 this.$store.dispatch('openLoginModal',false);//关闭模态框
              }
            })
            .catch((err)=>{
              console.log(err)
            })

      },
      setHeight() {
        var listofMenu = document.getElementsByClassName('el-submenu__title');
        var listofElmenu = document.getElementsByClassName('el-menu');

         for(let i = 0 ; i < listofMenu.length ; i ++ ){
             listofMenu[i].style.height = this.winHeight/20 + 'px';
             listofMenu[i].style.lineHeight = parseInt(listofMenu[i].style.height)-2 + 'px';
             listofMenu[i].style.boxSizing = 'border-box';
             listofMenu[i].onmouseover = function() {
                 this.style.borderBottom="5px solid rgb(115,145,145)";
             };

             listofMenu[i].onmouseleave= function() {
                 this.style.borderBottom="none";
             }
        }
        for(let i = 0 ; i < listofElmenu.length ; i ++ ) {
            listofElmenu[i].style.top = this.winHeight/20 + 'px';
        }
        document.getElementsByClassName('el-menu-demo')[0].style.top = 0;
      }
    },
    mounted(){
      this.$store.dispatch('openLoginModal',false);//默认不显示登录注册模态框
       //用于设置navmenu的高度，解决element-ui不能设置高度的bug
       this.setHeight();

       window.onresize = ()=>{
           this.setHeight();
        }
    },
    watch:{
       'winHeight':function() {
            this.setHeight();
       }
    }
  }
</script>

<style lang="css" scoped>

   .el-menu-demo {
       background: rgb(215,215,215);
       height: 100%;
   }

   .el-menu-demo>ul {
      height: 100% !important; 
   }

   .el-menu-demo li {
      height: 100% !important; 
      display: flex;
      justify-content: center;
      align-items: center;
   }

   .el-menu-demo>.el-menu-item:hover {
      border-bottom: 5px solid rgb(115,145,145)
   }

   .is-active {
      color:rgb(115,145,145);
   }
   .dialog-title button{
      border:none;background-color: gray;padding:4px 10px;color:white;font-size: 15px;cursor: pointer;
   }
   .dialog-title .blueColor{background-color: rgba(0, 153, 255, 1);}
   .iconImg{
    display: flex;
    justify-content: space-around;
  }
   .iconImg div{
    cursor: pointer;
    width: 32px;
    height: 32px;
    -webkit-background-size: 32px 32px;
    background-size: 32px 32px;
   }
   .png1{
    background: url("/static/images/wx.png") no-repeat;
   }
    .png1:hover{
    background: url("/static/images/wx1.png") no-repeat;
    -webkit-background-size: 32px 32px;
    background-size: 32px 32px;
   }
   .png2{
    background: url("/static/images/wb.png") no-repeat;
   }
   .png2:hover{
    background: url("/static/images/wb1.png") no-repeat;
    -webkit-background-size: 32px 32px;
    background-size: 32px 32px;
   }
   .png3{
    background: url("/static/images/qq.png") no-repeat;
   }
   .png3:hover{
    background: url("/static/images/qq1.png") no-repeat;
    -webkit-background-size: 32px 32px;
    background-size: 32px 32px;
   }
   #returnPage{margin-left: -34%;margin-right:36%;cursor: pointer; }
</style>
