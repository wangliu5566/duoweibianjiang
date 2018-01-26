<template>
  <div :style="{height:winHeight/13 +'px',width:winWidth + 'px'}" class="toolsbar">
     <el-row class="tool-row">
        <el-col :span="5">
           <ul data-section="search" >
             <li :style="{width:100/(toolsBtns[0].btns.length+2)+'%',height:winHeight/18+'px'}" :class="item.content=='搜索'?'search-menu-item1':'search-menu-item'" 
              v-for="(item,index) in toolsBtns[0].btns" @click="goList(item.path)">
                <span v-if="item.content=='搜索'">
                <img :src="item.icon" alt=""></span>
                <span v-else>{{item.content}}</span>
             </li>
             <li>
               &nbsp;
             </li>
           </ul>
        </el-col>
        <el-col :span="6">
            <ul data-section="search" >
             <li :style="{width:100/(toolsBtns[1].btns.length+1)+'%',height:'100%'}" class="map-menu-list" v-for="(item,index) in toolsBtns[1].btns" @click="goList(item.path)">
                <img :src="item.icon" alt="">
                <span>{{item.content}}</span>
             </li>
             <li>
               &nbsp;
             </li>
           </ul>
        </el-col>
        <el-col :span="8">
            <ul data-section="search" >
             <li :style="{width:100/(toolsBtns[2].btns.length+1)+'%',height:'100%'}" class="map-menu-list" v-for="(item,index) in toolsBtns[2].btns">
                <img :src="item.icon" alt="">
                <span>{{item.content}}</span>
             </li>
             <li>
               &nbsp;
             </li>
           </ul>
        </el-col>
        <el-col :span="3">
            <ul data-section="search" >
             <li :style="{width:100/(toolsBtns[3].btns.length)+'%',height:'100%'}" class="map-menu-list" v-for="(item,index) in toolsBtns[3].btns">
                <img :src="item.icon" alt="">
                <span>{{item.content}}</span>
             </li>
             <li>
               &nbsp;
             </li>
           </ul>
        </el-col>
         <el-col :span="2">
           <ul data-section="search" >
             <li :style="{width:100/(toolsBtns[4].btns.length)+'%',height:'100%'}" class="map-menu-list" v-for="(item,index) in toolsBtns[4].btns" @click='showModal(item.content)'>
                <img :src="item.icon" alt="">
                <span>{{item.content}}</span>
             </li>
             <li>
               &nbsp;
             </li>
           </ul>
        </el-col>
      </el-row>

    <!-- 模态框 -->
    <el-dialog :visible.sync="showMyModal">
        <span slot="title" class="dialog-title">
          {{modalTitle}}
        </span>
        <!-- 纪年换算 -->
       <div v-if="modalTitle=='纪年换算'">
        <calendar></calendar>
      </div>
        <!-- 设备切换 -->
       <div v-if="modalTitle=='设备切换'">
        <equipment></equipment>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import calendar from  "./Calendar.vue"
  import equipment from  "./Equipment.vue"
  export default {
    data() {
      return {
         mWidth:50,
         showMyModal:false,
         modalTitle:"纪年换算",
         toolsBtns:[{
            section:'search',
            className:'' ,           
            btns:[{
               content:'书',
               icon:'/static/images/nav.png',
               path:"/wrap/booklist",
               isActive:true,
            },{
               content:'图',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'事',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/eventsList",
            },{
               content:'人',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/personList",
            },{
               content:'搜索',
               icon:'/static/images/nav.png',
               isActive:true
            }]
         },{
            section:'map',
            className:'' ,           
            btns:[{
               content:'涉及地区',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/affectedArea"
            },{
               content:'涉及人物',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/affectedPerson"
            },{
               content:'涉及事件',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/affectedEvent"
            },{
               content:'相关文章',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/relatedArticle"
            },{
               content:'相关地图',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/RelatedMap"
            },{
               content:'文内检索',
               icon:'/static/images/nav.png',
               isActive:true,
               path:"/wrap/paperRetrieval"
            }]
         },{
            section:'text',
            className:'' ,           
            btns:[{
               content:'背景',
               icon:'/static/images/nav.png',
               isActive:true,
               color:['red','green','blue','#1da']
            },{
               content:'字体大小',
               icon:'/static/images/nav.png',
               isActive:true,
               fontSize:[12,13,14,16,18,20,28,36,48,72]
            },{
               content:'页码',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'书签',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'收藏',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'笔记',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'热区',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'近代图',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'加地图',
               icon:'/static/images/nav.png',
               isActive:true,
            }]
         },{
            section:'note',
            className:'' ,           
            btns:[{
               content:'插入图片',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'插入视频',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'插入音频',
               icon:'/static/images/nav.png',
               isActive:true,
            }]
         },{
            section:'other',
            className:'' ,           
            btns:[{
               content:'纪年',
               icon:'/static/images/nav.png',
               isActive:true,
            },{
               content:'设备',
               icon:'/static/images/nav.png',
               isActive:true,
            }]
         }]
      }
    },
    props:['winHeight','winWidth'],
    components:{
      calendar,
      equipment
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      setMenuListWidth() {
        var count = 0;
        this.toolsBtns.forEach(function(item,index) {
           item.btns.forEach(function() {
               count++;
           })
        })
        // this.mWidth = this.winHeight/(count+5);
      },
      goList(path){
        this.$router.push(path)
      },
      showModal(name){
        switch(name){
          case "纪年":
           name="纪年换算";
           break;
          case "设备":
          name="设备切换"
          break;
        }
        this.modalTitle=name;
        this.showMyModal=true;
        document.getElementsByClassName('el-dialog__header')[1].style.backgroundColor="rgba(143, 169, 169, 1)"
        document.getElementsByClassName('el-dialog__header')[1].style.textAlign="center"
        document.getElementsByClassName('el-dialog__header')[1].style.color="white";
        document.getElementsByClassName('el-dialog__header')[1].style.paddingBottom="12px";
       
      },
    },
    mounted(){
       //用于设置navmenu的高度，解决element-ui不能设置高度的bug
       this.setMenuListWidth();
    },

    watch:{
       'winHeight':function() {
            this.setMenuListWidth();
       },
       'winWidth':function() {
            this.setMenuListWidth();
       }
    }
  }
</script>

<style lang="css" scoped>
    .search-menu-item {
       border-radius: 50%;
       background: rgb(115,145,145);
       margin:0 3%;
       color:white;;
       cursor: pointer;
    }

    .search-menu-item1 img {
       width: 100%;
       height: 120%
    }

    .search-menu-item1 {
       margin:0 5px;
       border-radius: 50%;
       opacity: 0.7;
       cursor: pointer;
    }

    .map-menu-list {
       display: flex;
       justify-content: center;
       flex-direction: column;
       align-items: center;
       margin: 0 1.2%;
       opacity: 0.7;
       cursor: pointer;
    }

    .map-menu-list:hover {
       opacity: 1
    }

    .map-menu-list img {
       height: 60%;
       width: 60%;
    }

    .map-menu-list span {
       display: block;
       height: 40%;
       width: 100%;
       font-size: 12px;
       text-align: center;
    }



    .toolsbar {
       display: flex;
       justify-content: flex-start;
       align-items: center;
       width: 100%;
       background: #eee
    }

    .el-col {
      height: 100%;
    }

    .toolsbar ul {
       display: flex;
       justify-content: flex-start;
       align-items: center;
       height: 100%;
      border-right: 1px solid black
    }

    .toolsbar ul li {
       display: flex;
       justify-content: center;
       align-items: center;
       flex-direction: column;
    }

    .tool-row {
       display: flex;
       align-items: center;
       width: 100%;
       height: 100%
    } 

    .last-item {
       border-right: 1px solid rgb(115,145,145);
    }
  .el-dialog__body{
    padding:30px 0 !important;
  }


    


</style>
