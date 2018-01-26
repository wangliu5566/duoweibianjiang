    		
<template>
  <div  class="event-detail" 
  :style="{height:winHeight +'px',width:winWidth +'px'}" 
  ref="eventDetail" 
  @contextmenu.prevent="openContextmenu($event)"
  >
    <div class="collectImg" v-if="!isCollected" @click="collectedDeatil()"></div>
    <div class="collectImg1" v-else  @click="collectedDeatil()"></div>

    <div 
      @click="conMenuShow = false">
       <h2><span> 事件名称：{{Title}}</span></h2>
       <p>
         <p>公元纪年：{{time}}</p>
       </p>
        <p>
         <p>年号纪年：{{Dynasty}}</p>
       </p>
       <p style="line-height:24px">
         事件描述：{{Abstracts}}
       </p>
       
       <p v-if="RegionList!=0">涉及地区：
          <span class="region" 
          v-for="item in RegionList" 
          @click="goRegionList(item.Title,item.Id)"
          >
            {{item.Title}}
          </span>
       </p>
       <p v-if="RegionList==0">涉及地区：暂无</p>
       <p v-if="PeopleList!=0">涉及人物：
          <span class="region" 
          v-for="item in PeopleList" 
          @click="goPersonDetail(item.Title,item.Id)">
          {{item.Title}}
          </span>
        </p>
       <p v-if="PeopleList.length == 0">涉及人物：暂无</p>
       <div class="thumb-img" v-if="MapList.length != 0">
        <p style="margin-left: 0">同时期地图：</p>
          <div class="img-wrap" 
            v-for="(item,index) in MapList"
             @mouseenter="checkMapIsDownLoad(item,index)" 
             @mouseleave="upDownload(item,index)"
             >
                <img :src='(item.CoverUrl?item.CoverUrl:"")'
                 @click="toMapView(item,item.Id)">
                <p style="margin:0;margin-left:10px;line-height: 40px;font-size: 14px;">{{item.Title}}</p>
                <!-- <img src="../assets/下载完成1.png" alt="" class="has-download" v-show="item.hasDownLoad">     -->
                <div class="down-load-modal" :style="{background:item.startDownLoad?'#444':'',opacity:item.startDownLoad?0.6:1}" v-show="!item.hasDownLoad">
                    <el-progress 
                    v-show="item.startDownLoad" 
                    type="circle" 
                    :percentage="item.downLoadPercent" 
                    :status="item.downLoadPercent == 100?'success':''" 
                    :width="66" style="color:white"
                    :stroke-width="4"
                    >
                    </el-progress>
                    <img src="../assets/下载大.png" alt="" @click="startDownLoadMap(item,index)" v-show="!item.startDownLoad">
                </div>
          </div>
       </div> 
       <p class="thumb-img" v-if="MapList.length == 0">同时期地图：暂无</p>

       <p style="margin-bottom:20px">
         相关章节：
       </p>
    </div>
    
    <el-table
      ref="sectionListTable"
      :data="ResourceList"
      style="width: 96%;margin:0 20px 40px;"
      :row-key="getRowKeys"
      :expand-row-keys="expands"
      v-if="ResourceList.length !== 0">
      <el-table-column type="expand" >
        <template scope="props">
            <div  >
                <div  @contextmenu.prevent="" style="line-height:20px">
                 {{props.row.Description?'摘要：'+props.row.Description:'摘要：暂无简介'}}
                </div>
               <div class="mysource" style="margin-top:10px" @click="goBookDetail(props.row.Title,props.row.ParentId)">来源：{{'《'+props.row.Source+'》'}}</div>
            </div>
        </template>
      </el-table-column>
      <el-table-column
        label="章 名"
        >
        <template scope="props">
            <a href="javascript:void(0)" @click="beforeToBookView(props.row);">{{props.row.Title}}</a>
        </template>
      </el-table-column>
      <el-table-column
        label="详 情"
        align="center"
        >
        <template scope="props">
            <a href="javascript:void(0)" style="cursor:pointer" @click="expandRowKeys(props.row.Id,props.row)">
               <i class="el-icon-arrow-down" :style="{transition:'all .5s',transform:'rotate('+transform(props.row)+'deg)'}">
               </i> &nbsp;{{props.row.isExpand?'收起':'展开'}}
            </a>
        </template>
      </el-table-column>
      <el-table-column
        label="状 态"
        align="right"
        >
        <template scope="props">
          <el-button 
          size="small" 
          :data-bookData="JSON.stringify(props.row)" 
          :type="props.row.hasDown?'primary':''" 
          style="padding: 8px 15px;width:80px;margin-right:38px" 
          :disabled="props.row.startDownLoad && props.row.downLoadPercent !== 100 ?true:false" 
          @click.stop="download($event,props.row.Id,props.row,props.$index)">{{props.row.hasDown?'阅 读': (props.row.downLoadPercent== 0 && !props.row.startDownLoad? '点击下载': props.row.downLoadPercent + '%')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

<!--     <p style="margin-bottom: 20px;">
      <span v-else>暂无相关章节</span>
    </p> -->

    <div class="loading-content" v-show="loading">
        <img src="../assets/loading.gif" alt="">
    </div>

    <!-- 右键菜单 -->
    <ul class="context-menu" v-if="conMenuShow" :style="{left:conMenuLeft+'px',top:conMenuTop+'px'}">  
      <li :class="menuListDisable.copy?'':'menu-disabled'" @click="copyText()">复制</li>  
      <li @click="collectedDeatil()">{{menuListDisable.collect?"取消收藏":'收藏'}}</li>
      <li :class="menuListDisable.read?'':'menu-disabled'" @click="closeMenuAndDo($event,'read')">打开阅读</li>  
      <li :class="menuListDisable.download?'':'menu-disabled'" @click="closeMenuAndDo($event,'download')">下载该章</li>  
    </ul>  

  </div>
</template>

<script>
  export default {
    data() {
      return {
        eventId:"",
        winHeight:'',
        winWidth:'',
        activeNames: ['1'],
        Title:'',
        time:"",
        Dynasty:"",
        DynastyYear:"",
        Abstracts:"",
        RegionList:[],
        PeopleList:[],
        MapList:[],
        ResourceList:[],
        isCollected:false,
        loading:true,
        conMenuLeft:100,
        conMenuTop:100,
        conMenuShow:false,
        menuListDisable:{
          copy:false,
          collect:false,
          read:false,
          download:false
        },
       copySection:'',
       showBlackModal:false,
       getRowKeys(row) {
              return row.Id;
          },
          // 要展开的行，数值的元素是row的key值
      aimNode:null,
      expands: [],
      }
    },
    methods: {
     setWindow() {
        this.winWidth = window.innerWidth;
        this.winHeight = window.innerHeight;
      },
      transform(row) {
             return row.isExpand?180:0;
      },
      //获取详情
      getDetailData() {
          //验证有没有用户信息
          // var hasUserId = volidUserId();
          // if(!hasUserId) return;

          if(env=="dev"){
          this.$http.get('/explicitword/detail',{
           params:{
              id:this.eventId,
              // userid:localStorage.getItem('userId')
            }
          })
          .then((response)=>{
            this.loading=false;
            this.DataObj=response.data.Data;
             this.Title=response.data.Data.Title==""?'暂无':response.data.Data.Title;
             this.DynastyYear=response.data.Data.DynastyYear==null||response.data.Data.DynastyYear==""?'暂无':response.data.Data.DynastyYear;
             this.Dynasty=response.data.Data.Dynasty==null||response.data.Data.Dynasty==""?'暂无':response.data.Data.Dynasty;
             this.Abstracts=response.data.Data.Abstracts==null||response.data.Data.Abstracts==""?'暂无':response.data.Data.Abstracts;
             this.RegionList=response.data.Data.RegionList;
             this.PeopleList=response.data.Data.PeopleList;
             this.MapList = response.data.Data.MapList[0]==null?[]:response.data.Data.MapList;
             

             var listIds = [];
             this.MapList.forEach((item,index)=>{
                 item['hasDownLoad'] = false;
                 item['showHasDownLoad'] = true;
                 item['startDownLoad'] = false;
                 item['downLoadPercent'] = 0;
                 listIds.push(item.Id)
              })

             this.ResourceList = response.data.Data.ResourceList;
             this.menuListDisable.collect =response.data.Data.IsFavorite
             //处理章节列表
             this.ResourceList.forEach((item,index)=>{
                 item['hasDown'] = false;
                 item['downLoadPercent'] = 0;
                 item['isExpand'] = false;
                 item['startDownLoad'] = false;
                 listIds.push(item.Id)
              })

             this.expands = [];


             var StartTime="";
             if(response.data.Data.StartTime==null||response.data.Data.StartTime==''){
                StartTime="?";
             }else{
                if(response.data.Data.StartTime.indexOf("BC")!=-1){
                  StartTime="公元前";
                  var showYear=response.data.Data.StartTime.slice(2,6);
                  for(var i=0;i<4;i++){
                    if(showYear[i]!=0){
                      StartTime+=showYear.slice(i)
                      break;
                    }
                  }
                }else{
                  StartTime="公元";
                   var showYear=response.data.Data.StartTime.slice(0,4);
                    for(var i=0;i<4;i++){
                    if(showYear[i]!=0){
                       StartTime+=showYear.slice(i)
                      break;
                    }
                  }
                }
             }
             var EndTime="";
              if(response.data.Data.EndTime==null||response.data.Data.EndTime==''){
                EndTime="?";
             }else{
                if(response.data.Data.EndTime.indexOf("BC")!=-1){
                  EndTime="公元前";
                  var showYear=response.data.Data.EndTime.slice(2,6);
                  for(var i=0;i<4;i++){
                    if(showYear[i]!=0){
                      EndTime+=showYear.slice(i)
                      break;
                    }
                  }
                }else{
                  EndTime="公元";
                   var showYear=response.data.Data.EndTime.slice(0,4);
                    for(var i=0;i<4;i++){
                    if(showYear[i]!=0){
                       EndTime+=showYear.slice(i)
                      break;
                    }
                  }
                }
             }
              if(StartTime==EndTime&&StartTime!="?"){
                this.time=StartTime;
              }else if(StartTime=="?"&&EndTime=="?"){
                this.time="暂无年份相关信息";
              }else{
                this.time=StartTime+' - '+EndTime
              }

          })
          .catch((err)=>{
            console.log(err)
          })

        }else if(env=="prod"){
            var data={
                 id:this.eventId,
                 userid:localStorage.getItem('userId')
              }

             // setTimeout(()=>{
             //   var winResult = ApiTransfer('get','/explicitword/detail',conbineData(data));
             //   winResult=JSON.parse(winResult)
             //   this.loading=false;
             //   if(winResult.Success){
             //       this.DataObj=winResult.Data;
             //       this.Title=winResult.Data.Title==""?'暂无':winResult.Data.Title;
             //       this.DynastyYear=winResult.Data.DynastyYear==null||winResult.Data.DynastyYear==""?'暂无':winResult.Data.DynastyYear;
             //       this.Dynasty=winResult.Data.Dynasty==null||winResult.Data.Dynasty==""?'暂无':winResult.Data.Dynasty;
             //       this.Abstracts=winResult.Data.Abstracts==null||winResult.Data.Abstracts==""?'暂无':winResult.Data.Abstracts;
             //       this.RegionList=winResult.Data.RegionList;
             //       this.PeopleList=winResult.Data.PeopleList;
             //       this.MapList = winResult.Data.MapList[0]==null? [] : winResult.Data.MapList;

             //       var listIds = [];
             //       this.MapList.forEach((item,index)=>{
             //           item['hasDownLoad'] = false;
             //           item['showHasDownLoad'] = true;
             //           item['startDownLoad'] = false;
             //           item['downLoadPercent'] = 0;
             //           listIds.push(item.Id)
             //        })

             //       this.ResourceList=winResult.Data.ResourceList;
             //       this.menuListDisable.collect =winResult.Data.IsFavorite
             //       //处理章节列表
             //       this.ResourceList.forEach((item,index)=>{
             //           item['hasDown'] = false;
             //           item['downLoadPercent'] = 0;
             //           item['isExpand'] = false;
             //           listIds.push(item.Id)
             //        }) 
             //       this.expands = [];


             //        //向后台发送缓存验证,获取已经下载过的文件
                     
             //        //获取已下载的数据
                    
             //        if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
             //            var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
             //                hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
             //            if(hasDownLoadedContent.length == 0) return; 

             //            //根据已下载数据，渲染界面
             //            hasDownLoadedContent.forEach((getItem,getIndex)=>{
             //               this.ResourceList.forEach((bookItem,bookIndex)=>{
             //                   if(getItem.ResourceId == bookItem.Id) {
             //                       bookItem['hasDown'] = true;
             //                       bookItem['nativeUrl'] = getItem.FilePath;
             //                       bookItem['downLoadPercent'] = 100;
             //                       bookItem['nativeUrl'] = getItem.FilePath;
             //                   }
             //               })

             //               this.MapList.forEach((bookItem,bookIndex)=>{
             //                   if(getItem.ResourceId == bookItem.Id) {
             //                       bookItem['hasDownLoad'] = true;
             //                       bookItem['downLoadPercent'] = 100;
             //                       bookItem['nativeUrl'] = getItem.FilePath;
             //                   }
             //               })
             //            })
             //        }

             //        var StartTime="";
             //         if(winResult.Data.StartTime==null||winResult.Data.StartTime==''){
             //            StartTime="?";
             //         }else{
             //            if(winResult.Data.StartTime.indexOf("BC")!=-1){
             //              StartTime="公元前";
             //              var showYear=winResult.Data.StartTime.slice(2,6);
             //              for(var i=0;i<4;i++){
             //                if(showYear[i]!=0){
             //                  StartTime+=showYear.slice(i)
             //                  break;
             //                }
             //              }
             //            }else{
             //              StartTime="公元";
             //               var showYear=winResult.Data.StartTime.slice(0,4);
             //                for(var i=0;i<4;i++){
             //                if(showYear[i]!=0){
             //                   StartTime+=showYear.slice(i)
             //                  break;
             //                }
             //              }
             //            }
             //         }
             //         var EndTime="";
             //        if(winResult.Data.EndTime==null||winResult.Data.EndTime==''){
             //          EndTime="?";
             //        }else{
             //          if(winResult.Data.EndTime.indexOf("BC")!=-1){
             //            EndTime="公元前";
             //            var showYear=winResult.Data.EndTime.slice(2,6);
             //            for(var i=0;i<4;i++){
             //              if(showYear[i]!=0){
             //                EndTime+=showYear.slice(i)
             //                break;
             //              }
             //            }
             //          }else{
             //            EndTime="公元";
             //             var showYear=winResult.Data.EndTime.slice(0,4);
             //              for(var i=0;i<4;i++){
             //              if(showYear[i]!=0){
             //                 EndTime+=showYear.slice(i)
             //                break;
             //              }
             //            }
             //          }
             //       }
             //        if(StartTime==EndTime&&StartTime!="?"){
             //          this.time=StartTime;
             //        }else if(StartTime=="?"&&EndTime=="?"){
             //          this.time="暂无年份相关信息";
             //        }else{
             //          this.time=StartTime+' - '+EndTime
             //        }
             //      }
             // },500) 
  // ShowDevTools();


          //下面是配合winform异步获取数据
            ApiTransfer('get','/explicitword/detail',JSON.stringify(data),(winResult)=>{
               winResult=JSON.parse(winResult)
               this.loading = false;
               if(winResult.Success){
                console.log(winResult.Data);
                   this.DataObj=winResult.Data;
                   this.Title=winResult.Data.Title==""?'暂无':winResult.Data.Title;
                   SetTabTitle(this.Title,GetFormId());

                   this.DynastyYear=winResult.Data.DynastyYear==null||winResult.Data.DynastyYear==""?'暂无':winResult.Data.DynastyYear;
                   this.Dynasty=winResult.Data.Dynasty==null||winResult.Data.Dynasty==""?'暂无':winResult.Data.Dynasty;
                   this.Abstracts=winResult.Data.Abstracts==null||winResult.Data.Abstracts==""?'暂无':winResult.Data.Abstracts;
                   this.RegionList=winResult.Data.RegionList;
                   this.PeopleList=winResult.Data.PeopleList;
                   this.MapList = winResult.Data.MapList[0]==null? [] : winResult.Data.MapList;


                   var listIds = [];
                   this.MapList.forEach((item,index)=>{
                       item['hasDownLoad'] = false;
                       item['showHasDownLoad'] = true;
                       item['startDownLoad'] = false;
                       item['downLoadPercent'] = 0;
                       listIds.push(item.Id)
                    })

                   this.ResourceList=winResult.Data.ResourceList;
                   this.isCollected = winResult.Data.IsFavorite;

                   //处理章节列表
                   this.ResourceList.forEach((item,index)=>{
                       item['hasDown'] = false;
                       item['downLoadPercent'] = 0;
                       item['isExpand'] = false;
                       item['startDownLoad'] = false;
                       listIds.push(item.Id)
                    }) 
                   this.expands = [];


                    //向后台发送缓存验证,获取已经下载过的文件
                     
                    //获取已下载的数据
                    
                    if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
                        // var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
                        //     hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                        // if(hasDownLoadedContent.length == 0) return; 

                        // //根据已下载数据，渲染界面
                        // hasDownLoadedContent.forEach((getItem,getIndex)=>{
                        //    this.ResourceList.forEach((bookItem,bookIndex)=>{
                        //        if(getItem.ResourceId == bookItem.Id) {
                        //            bookItem['hasDown'] = true;
                        //            bookItem['nativeUrl'] = getItem.FilePath;
                        //            bookItem['downLoadPercent'] = 100;
                        //            bookItem['nativeUrl'] = getItem.FilePath;
                        //        }
                        //    })

                        //    this.MapList.forEach((bookItem,bookIndex)=>{
                        //        if(getItem.ResourceId == bookItem.Id) {
                        //            bookItem['hasDownLoad'] = true;
                        //            bookItem['downLoadPercent'] = 100;
                        //            bookItem['nativeUrl'] = getItem.FilePath;
                        //        }
                        //    })
                        // })



                        //异步获取下载
                        GetDownLoadedResources(listIds.join(','),localStorage.getItem('userId'),(hasDownLoadedContent)=>{
                            hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                            if(hasDownLoadedContent.length == 0) return; 

                             hasDownLoadedContent.forEach((getItem,getIndex)=>{
                               this.ResourceList.forEach((bookItem,bookIndex)=>{
                                   if(getItem.ResourceId == bookItem.Id) {
                                       bookItem['hasDown'] = true;
                                       bookItem['nativeUrl'] = getItem.FilePath;
                                       bookItem['downLoadPercent'] = 100;
                                       bookItem['nativeUrl'] = getItem.FilePath;
                                       this.$set(this.ResourceList,bookIndex,bookItem);
                                   }
                               })

                               this.MapList.forEach((bookItem,bookIndex)=>{
                                   if(getItem.ResourceId == bookItem.Id) {
                                       bookItem['hasDownLoad'] = true;
                                       bookItem['downLoadPercent'] = 100;
                                       bookItem['nativeUrl'] = getItem.FilePath;
                                       this.$set(this.MapList,bookIndex,bookItem);
                                   }
                               })
                            })
                        })
                    }

                    var StartTime="";
                     if(winResult.Data.StartTime==null||winResult.Data.StartTime==''){
                        StartTime="?";
                     }else{
                        if(winResult.Data.StartTime.indexOf("BC")!=-1){
                          StartTime="公元前";
                          var showYear=winResult.Data.StartTime.slice(2,6);
                          for(var i=0;i<4;i++){
                            if(showYear[i]!=0){
                              StartTime+=showYear.slice(i)
                              break;
                            }
                          }
                        }else{
                          StartTime="公元";
                           var showYear=winResult.Data.StartTime.slice(0,4);
                            for(var i=0;i<4;i++){
                            if(showYear[i]!=0){
                               StartTime+=showYear.slice(i)
                              break;
                            }
                          }
                        }
                     }
                     var EndTime="";
                    if(winResult.Data.EndTime==null||winResult.Data.EndTime==''){
                      EndTime="?";
                    }else{
                      if(winResult.Data.EndTime.indexOf("BC")!=-1){
                        EndTime="公元前";
                        var showYear=winResult.Data.EndTime.slice(2,6);
                        for(var i=0;i<4;i++){
                          if(showYear[i]!=0){
                            EndTime+=showYear.slice(i)
                            break;
                          }
                        }
                      }else{
                        EndTime="公元";
                         var showYear=winResult.Data.EndTime.slice(0,4);
                          for(var i=0;i<4;i++){
                          if(showYear[i]!=0){
                             EndTime+=showYear.slice(i)
                            break;
                          }
                        }
                      }
                   }
                    if(StartTime==EndTime&&StartTime!="?"){
                      this.time=StartTime;
                    }else if(StartTime=="?"&&EndTime=="?"){
                      this.time="暂无年份相关信息";
                    }else{
                      this.time=StartTime+' - '+EndTime
                    }
                  }
            });
        
            
        }
      },
      //设置展开项
      expandRowKeys(newVal,row) {
          var index = 0;
          this.ResourceList.forEach((item,index1)=>{
              if(item.Id == newVal) {
                 index = index1;
              }
          })

          if(this.expands.indexOf(newVal) != -1) {
             row.isExpand = false;
             this.expands.splice(this.expands.indexOf(newVal),1);
             this.$set(this.ResourceList,index,row);
             return;
          }

          row.isExpand = true;
          this.$set(this.ResourceList,index,row);
          this.expands.push(newVal);
        },
      //链接到人物详情
      goPersonDetail(title,id){  
         if(env=="dev"){
          this.$router.push({ path: '/personDetail', query: { personId:id }})
        }else if(env=="prod"){
           SaveArgument('personId='+id)
          loadForm('/index.html#/personDetail',"详情",title,true)
        }
      },
      //链接到地区相关章节列表
      goRegionList(title,id){ 
         if(env=="dev"){
            window.location.href=ymUrl+'/sectionlist?relatedregionids='+id;
          }else if(env=="prod"){
            SaveArgument('relatedregionids='+id)
            loadForm('/index.html#/sectionlist',"资源",title,true)
          }
      },
      //链接到图书洗详情
      goBookDetail(title,id){  
       if(env=="dev"){
           this.$router.push({path:"/bookDetail",query:{bookId:id}})
       }else if(env=="prod"){
         SaveArgument('bookId='+id.toString())
         loadForm('/index.html#/bookDetail',"详情",title,true)
       }
      },
      //链接到地图阅读页
      goMapDetail(id){  
         if(env=="dev"){
            // this.$router.push({path:"/static/map.html",query:{bookId:id}})
         }else if(env=="prod"){
           SaveArgument('mapId'+id.toString())
           loadForm("/static/map.html",'阅读',"地图阅读",true);
         }
      },
      //点击下载
      loadStart(id){  
        console.log(id)
      },
      //右键功能
      openContextmenu(e){
         this.conMenuShow=true;
         this.aimNode = null;

         this.menuListDisable.copy = false;
         this.menuListDisable.collect = false;
         this.menuListDisable.read = false;
         this.menuListDisable.download = false;


         if(this.winWidth-e.pageX<120){
            this.conMenuLeft=this.winWidth-120;
         }else{
            this.conMenuLeft=e.pageX;
         }
        this.conMenuTop = e.pageY;
       
       //复制
        if(document.getSelection().toString()!=""){
          this.menuListDisable.copy = true;
           this.copySection = document.getSelection().toString();

        }else{
          this.menuListDisable.copy = false;
        }

        //判断阅读按钮能否使用
         if(e.target.nodeName == 'TD') {
          //都点击的td
            this.aimNode = e.target.parentNode.children[3];
         }else if(e.target.nodeName == 'A') {
            // 点击的是第一个单元格里的文字a标签
            this.aimNode = e.target.parentNode.parentNode.parentNode.children[3];
         }else if(e.target.nodeName == 'DIV') {
            //点击的是a标签的 父容器div
            this.aimNode = e.target.parentNode.parentNode.children[3];
         }else if(e.target.nodeName == 'I') {
            // 点击的是a 的子元素i
            this.aimNode = e.target.parentNode.parentNode.parentNode.parentNode.children[3];
         }else if(e.target.nodeName == 'I') {
            // 点击的是a 的子元素i
            this.aimNode = e.target.parentNode.parentNode.parentNode.parentNode.children[3];
         }else if(e.target.nodeName == 'BUTTON') {
            // 点击的是button
            this.aimNode = e.target.parentNode.parentNode;
         }else if(e.target.nodeName == 'SPAN') {
            // 点击的是button
            this.aimNode = e.target.parentNode.parentNode.parentNode;
         }

        if(this.aimNode) {
           if(this.aimNode.innerText.trim() == '点击下载') {
             this.menuListDisable.download = true;
             this.menuListDisable.read = false ;
           }else if(this.aimNode.innerText.trim()== '阅 读') {
               this.menuListDisable.read = true ;
               this.menuListDisable.download = false;
           } 
        }

      },
       //点击右键菜单中的选项的操作
      closeMenuAndDo(e,operate) {
          this.conMenuShow = false;
          if(e.target.className !== '') return;
          var bookData = null;
          if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
             bookData = this.aimNode.children[0].children[0].getAttribute('data-bookData');
          }
          switch (operate) {
            //阅读该章
            case 'read':
                 if(bookData) {
                     bookData = JSON.parse(bookData)
                     this.toBookView(bookData.Id,bookData);
                 } 
              break;
            case 'download':
            //下载该章
                 if(bookData) {
                     var index = 0;
                     bookData = JSON.parse(bookData)
                     this.ResourceList.forEach((item,index1)=>{
                        if(item.Id == bookData.Id) index = index1;
                     })

                     this.download(e,bookData.Id,bookData,index);
                 }
              break;       
            default:
              // statements_def
              break;
          }
      },
      //点击章节名称进行的跳转
      beforeToBookView(row) {
         if(!row.hasDown) {
            this.$message({
              message: '请先下载该章节！',
              type: 'warning'
            });
         }else {
            this.toBookView(row.Id,row);
         }
      },

      //复制
      copyText(e){
        this.conMenuShow=false;
        Clip(this.copySection);
      },
      //阅读
      openReading(e){
        var bookid = null;
         if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
             bookid = this.aimNode.children[0].children[0].getAttribute('data-id');
         }
         if(bookid) {
             this.toBookView(bookid);
         }
      },
      //收藏
      collectedDeatil() {
          //验证有没有用户信息
          var hasUserId = volidUserId();
          if(!hasUserId) return;

          this.conMenuShow = false;
          if(env=="dev"){
             this.$http.post("/favorite/createorcancel", {
              objectid: this.eventId,
              objecttype: 2, //1图书章节地图2人物事件
              userid: localStorage.getItem("userId")
            })
            .then((res) => {
                if (res.data.Description=="收藏成功") {
                    this.menuListDisable.collect = true;
                } else {
                    this.menuListDisable.collect = false;
                }
                if (res.data.Success) {
                    this.$message({
                        showClose: true,
                        message: res.data.Description,
                        type:'success'
                    });
                }
            })
            .catch((err) => {
                console.log(err)
            })
          }else if(env=="prod"){
            var data={
              objectid:parseInt(this.eventId),
              objecttype: 2, //1图书章节地图2人物事件
              userid: localStorage.getItem('userId'),
            }

            // var winResult = ApiTransfer('post','/favorite/createorcancel',conbineData(data));
            // winResult=JSON.parse(winResult)
            // if(winResult.Success){
            //     if (winResult.Description=="收藏成功") {
            //         this.menuListDisable.collect = true;
            //     } else {
            //         this.menuListDisable.collect = false;
            //     }
            //     this.$message({
            //          showClose: true,
            //          message: winResult.Description,
            //          type:'success'
            //     });
            // }

            

            //下面是配合winform异步获取数据
            ApiTransfer('post','/favorite/createorcancel',JSON.stringify(data),(winResult)=>{
                  winResult=JSON.parse(winResult)
                  if(winResult.Success){
                      if (winResult.Description=="收藏成功") {
                          this.isCollected = true;
                          this.menuListDisable.collect = true;
                      } else {
                          this.isCollected = false;
                          this.menuListDisable.collect = false;
                      }
                      
                      this.$message({
                           showClose: true,
                           message: winResult.Description,
                           type:'success'
                      });
                  }
              });

          }
         
      },
      //下载该章节
      download(e,sectionid,item,index) {
             CloseMenueStrip();
             //验证有没有用户信息
              var hasUserId = volidUserId(true);
              if(!hasUserId) return;

             if(item.hasDown) {
               e.stopPropagation();
               this.toBookView(sectionid,item);
               return;
             }

            item.startDownLoad = true;
            this.$set(this.ResourceList,index,item);
            
            if(env == 'dev') {

               var setTime = setInterval(()=>{

                    if(item.downLoadPercent >= 100) {
                       item.downLoadPercent = 100;
                       item.hasDown = true;  
                       this.$set(this.ResourceList,index,item)
                       clearInterval(setTime);
                    }else {
                       item.downLoadPercent++;
                       this.$set(this.ResourceList,index,item)
                    }
                }, 50)
            }else if(env == 'prod') {
                //获取图书下载地址
                // var resFromWinF = ApiTransfer('get','/file/stream','fileid='+item.DefaultFileId+'&isPC=true&userid='+localStorage.getItem('userId')+'&activatedcode=16267308418');

                //     resFromWinF = JSON.parse(resFromWinF);

                //     if(resFromWinF.Code == 200) {
                //         item.downloadUrl = resFromWinF.Data;
                //         var downdata = {
                //                       downloadUrl:item.downloadUrl,
                //                       resourceid:item.Id+'',
                //                       type:item.Type,
                //                       title:item.Title,
                //                       source:item.Source,
                //                       userid:localStorage.getItem('userId')
                //                    }
                //         item.nativeUrl = DownLoad(JSON.stringify(downdata));

                //         //开始下载
                //               var setTime = setInterval(() => {
                //                   if (item.downLoadPercent >= 100) {
                //                       item.downLoadPercent = 100;
                //                       item.hasDown = true;

                //                       clearInterval(setTime);
                //                   } else {
                //                       item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                //                   }
                //                   this.$set(this.ResourceList, index, item)
                //               }, 500)

                //     }else {
                //         alert('出现未知错误，请关闭重试！');
                //     }
                  
                  var data = {
                      fileid:item.DefaultFileId,
                      isPC:true,
                      type:item.Type,
                      userid:localStorage.getItem('userId'),
                      resourceid:item.Id+'',
                      source:item.Source,
                      title:item.Title,
                  }

                    //下面是配合winform异步获取数据
                  // ApiTransfer('get','/file/stream',JSON.stringify(data),(resFromWinF)=>{
                  //     resFromWinF = JSON.parse(resFromWinF);

                  //     if(resFromWinF.Code == 200) {
                  //         item.downloadUrl = resFromWinF.Data;
                  //         var downdata = {
                  //                   downloadUrl:item.downloadUrl,
                  //                   resourceid:item.Id+'',
                  //                   type:item.Type,
                  //                   title:item.Title,
                  //                   source:item.Source,
                  //                   userid:localStorage.getItem('userId')
                  //                }
                  //         // item.nativeUrl = DownLoad(JSON.stringify(downdata));

                  //         DownLoad(JSON.stringify(downdata),(nativeUrl)=>{
                  //           item.nativeUrl = nativeUrl;
                  //           GetDownLoadProgress(item.downloadUrl,(progress)=>{
                  //                 if (Math.floor(progress) >= 100) {
                  //                   item.downLoadPercent = 100;
                  //                   item.hasDown = true;
                  //                 } else {
                  //                     item.downLoadPercent = Math.floor(progress);
                  //                 }

                  //                 this.$set(this.ResourceList, index, item)
                  //             })
                  //         })

                  //     }else {
                  //         alert('出现未知错误，请关闭重试！');
                  //     }
                  // });


                  //多线程异步下载
                  DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
                      
                      if(err) {
                        OpenForm(480,500,'/index.html#/userCenter','个人信息');
                        localStorage.setItem('fromWhere',3);
                        item.startDownLoad = false;
                        
                      }else {
                        item.nativeUrl = nativeUrl;
                        //获取下载进度
                        if (Math.floor(progress) >= 100) {
                            item.downLoadPercent = 100;
                            item.hasDown = true;
                        } else {
                            item.downLoadPercent = Math.floor(progress);
                        }

                      }

                      this.$set(this.ResourceList,index,item);
                  });



              }
           
      },
      //检测该地图是否已经被下载
      checkMapIsDownLoad(item, index) {
        this.showBlackModal=true;
         
      },
      upDownload(item, index) {
        this.showBlackModal=false;
            },
        //开始下载地图
        //开始下载
        startDownLoadMap(item, index) {
            //验证有没有用户信息
            var hasUserId = volidUserId(true);
            if(!hasUserId) return;

            
            if(item.hasDownLoad){
                this.toMapView(item,item.Id);
                return;
            }; 
            item.startDownLoad = true;
            
            if(env == 'dev') {
               this.$http.get("/resource/defaultfile_open", {
                    params: {
                        resourceid: item.Id,
                    }
                })
                .then((res) => {
                    item.downloadUrl = res.data.Data.Url;
                })
                .catch((err) => {
                    console.log(err)
                })

                var setTime = setInterval(() => {
                    if (item.downLoadPercent >= 100) {
                        item.downLoadPercent = 100;
                        item.hasDownLoad = true;
                        clearInterval(setTime);

                    } else {
                        item.downLoadPercent += 1;
                    }

                    this.$set(this.MapList, index, item)
                }, 100)
            }else if(env == 'prod') {
                // var resFromWinF = ApiTransfer('get','/resource/defaultfile_open','resourceid='+item.Id+'&userid='+localStorage.getItem('userId')+'&activatedcode=16267308418');
                //     resFromWinF = JSON.parse(resFromWinF);
                //     item.downloadUrl = resFromWinF.Data.Url;
                //     var downdata = {
                //           downloadUrl:item.downloadUrl,
                //           resourceid:item.Id+'',
                //           type:item.Type,
                //           title:item.Title,
                //           source:item.Source,
                //           userid:localStorage.getItem('userId')
                //        }

                //     item.nativeUrl = DownLoad(JSON.stringify(downdata));
                    
                // // alert(nativeUrl);
                // var setTime = setInterval(() => {
                //     if (item.downLoadPercent >= 100) {
                //         item.downLoadPercent = 100;
                //         item.hasDownLoad = true;
                //         clearInterval(setTime);
                //     } else {
                //         item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                //     }
                //     this.$set(this.MapList, index, item)
                // }, 500)
               
                var data = {
                   resourceid:item.Id,
                   userid:localStorage.getItem('userId'),
                   fileid:item.DefaultFileId,
                   isPC:true,
                   type:3,
                   source:item.Source,
                   title:item.Title,
                }

                //下面是配合winform异步获取数据
                // ApiTransfer('get','/resource/defaultfile_open',JSON.stringify(data),(resFromWinF)=>{
                //      resFromWinF = JSON.parse(resFromWinF);
                //       item.downloadUrl = resFromWinF.Data.Url;
                //       var downdata = {
                //             downloadUrl:item.downloadUrl,
                //             resourceid:item.Id+'',
                //             type:item.Type,
                //             title:item.Title,
                //             source:item.Source,
                //             userid:localStorage.getItem('userId')
                //          }

                //       // item.nativeUrl = DownLoad(JSON.stringify(downdata));

                //        DownLoad(JSON.stringify(downdata),(nativeUrl)=>{
                //           item.nativeUrl = nativeUrl;
                //           GetDownLoadProgress(item.downloadUrl,(progress)=>{
                //               if (Math.floor(progress) >= 100) {
                //                 item.downLoadPercent = 100;
                //                 item.hasDownLoad = true;
                //               } else {
                //                   item.downLoadPercent = Math.floor(progress);
                //               }

                //               this.$set(this.MapList, index, item)
                //           })
                //       })

                //  });


                //多线程异步下载
                  DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
                    
                      if(err) {
                        OpenForm(480,500,'/index.html#/userCenter','个人信息');
                        localStorage.setItem('fromWhere',3);
                        item.startDownLoad = false;

                      }else {
                        item.nativeUrl = nativeUrl;
                        //获取下载进度
                        if (Math.floor(progress) >= 100) {
                            item.downLoadPercent = 100;
                            item.hasDownLoad = true;
                        } else {
                            item.downLoadPercent = Math.floor(progress);
                        }
                      }

                      this.$set(this.MapList, index, item)
                  });
                

            }   

            
        },
        //跳转地图阅读页面
        toMapView(item,resourceid) {
            if(item.hasDownLoad) {
                if(env == 'dev') {
                   window.location.href = './static/map.html?resourceid=' + resourceid;
                }else if(env == 'prod') {
                   // ChangeDpi(item.nativeUrl,(delNativeUrl)=>{
                       SaveArgument('imgSrc='+item.nativeUrl+'&resourceid='+resourceid);
                       loadForm('/static/map.html','地图阅读',item.Title,true);
                       
                   // });
                }
            }
        },

      //跳转图书阅读
       toBookView(sectionid,item) {
          if(env == 'dev') {
             location.href  = './static/reader.html?sectionid='+sectionid;
          }else if(env == 'prod') {
             SaveArgument('sectionId='+sectionid+'&secret='+item.Secret+'&bookSrc='+item.nativeUrl+'&parentId='+item.ParentId)
             loadForm('/static/reader.html','图书阅读',item.Title,true);
          }
       },

    },
    mounted(){
      // ShowDevTools()   
      if(env=="prod"){
        this.eventId = GetArgument().split('eventId=')[1].split('&&')[0]
      }else if(env=="dev"){
        this.eventId = this.$route.query.eventId
      }
      
       //用于设置navmenu的高度，解决element-ui不能设置高度的bug
       this.setWindow();
      
       window.onresize = ()=>{
         this.setWindow();
        }
        //请求页面数据


       this.getDetailData() ;
    },
    updated() {
        var container =  this.$refs.eventDetail;
         if(!container)  return;
        //用于设置模态框中多选框的样式
        var listofCheckBox = container.getElementsByClassName('el-checkbox-button__inner');

        for (let i = 0; i < listofCheckBox.length; i++) {
            listofCheckBox[i].style.borderRadius = '10px';
            listofCheckBox[i].style.padding = '5px 15px';
        }

      
        var listOfIcon = container.getElementsByClassName('el-table__expand-icon');
        for(var i = 0 ; i < listOfIcon.length ; i ++) {
            listOfIcon[i].style.display  = 'none'
        }

        var listOfColGroup = container.getElementsByTagName('colgroup');
        for(var i = 0 ; i < listOfColGroup.length ; i ++) {
            listOfColGroup[i].children[0].setAttribute('width', '0');
        }

        var listOfProgress = container.getElementsByClassName('el-progress__text');
            for (var i = 0; i < listOfProgress.length; i++) {
                listOfProgress[i].style.color = 'white';
                listOfProgress[i].style.fontSize = '14px';
            }
    },

    watch:{
       'setWindow':function(newValue) {
            this.setWindow();
       },
       'isCollected':function(nv,ov) {
           this.menuListDisable.collect = nv;
       }
    }
  }
</script>

<style lang="less">
.event-detail { 
    min-width: 350px;
    color:#444;
    position: relative;
    overflow-y:visible;

  .collectImg,.collectImg1{
    width: 32px;
    height: 32px;
    position: absolute;
    right:100px;
    top:40px;
    background-image: url("../assets/收藏.png");
    cursor: pointer;
  }
  .collectImg1{
     background-image: url("../assets/收藏1.png");
  }
  .collectImg:hover{
    width: 32px;
    height: 32px;
    background-image: url("../assets/收藏1.png");
  }

  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center; 
    height: 70px;
    margin-bottom: -20px
  }

  h2 span{
    margin: 0 20px;
  }

  h2 span:nth-child(2) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 span:nth-child(2) button {
    margin: 0 20px
  }


  p {
    margin: 0 20px;
    margin-top: 30px;
  }

  .thumb-img {
    margin:20px;
    overflow: hidden;
  }

  .booklist-item {
      display: flex;
      justify-content: left;
      align-items: center;
      margin:20px auto;
      border:1px solid #ddd;
      height: 100px;
      width: 96%;
    }

    .booklist-item:hover {
      box-shadow: 1px 1px 10px #888;
    }
    .booklist-item-cont{
      width: 100%;
    }

    .booklist-item-cont li {
      height: 25px;
      width: 98%;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      cursor: pointer;
      color:#444;
    }

    .booklist-item-cont li:nth-child(2) {
      display: flex;
      justify-content: space-between;
      height: 36px;
      margin: 4px;
    }

    .booklist-item-cont li:nth-child(2) p {
      width: 80%;
      height: 100%;
    }

    .region{
      display: inline-block;
      padding: 6px 13px;
      margin-right: 10px;
      cursor:pointer;
      background-color: #eee;
      border-radius: 15px;
      font-size: 14px;
      margin-bottom: 10px;

    }

      .img-wrap{
        width: 240px;
        position: relative;
        margin-top: 15px;
        cursor: pointer;
        float:left;
        margin-right:20px;
        border:1px solid #ccc;
      }

      .img-wrap img{
        width: 100%;
        height: 100%;
        
      }

      .myLoad{
        position: absolute;
        right:20px;
        top:6px;
        padding:8px 15px;
        font-weight: 400;
        z-index: 100;
        font-size: 12px;
      }

      .down-load-modal {
        position: absolute;
        left: 0;
        top:0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 170px;
        // background: #666;
        // opacity: 0;
      }


      .has-download {
        position: absolute;
        right: 0px;
        top: 0px;
        width: 64px !important;
        height: 64px !important;
    }

    .down-load-modal img {
      width: 64px !important;
      height: 64px !important;
    }
    .el-table__expanded-cell{
      background-color: #e4ebf5;
    }
    .el-table th{
      background-color: #f2f2f2;
    }
    
    & a {
      color:#666;
    }

    & a:hover {
      /*text-decoration: underline !important;*/
      color:#2b579a;
    }

  }


</style>
