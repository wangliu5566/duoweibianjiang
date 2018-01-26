<template>
    <div class="person-detail" ref="personDetail" 
    :style="{height:winHeight+'px'}"
    @contextmenu.prevent="openContextMenu($event)" 
    @click="conMenuShow=false">
        <div class="collectImg" v-if="!hasCollect" @click="collectedDeatil()"></div>
        <div class="collectImg1" v-else  @click="collectedDeatil()"></div>
        <h2 class="person-name"><span>人&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：{{getDate.Title?getDate.Title:"暂无"}}</span></h2>
        <p>
            <p>朝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;代：{{getDate.Dynasty?getDate.Dynasty:"暂无"}}</p>
        </p>
        <p style="line-height:24px">
            简&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;介：{{getDate.Abstracts?getDate.Abstracts:"暂无"}}
        </p>
        <p>参考资料：暂无参考资料</p>
        <p v-if="EventList.length!=0">涉及事件：
            <span class="region" v-for="item in EventList" @click="goEventDetail(item.Title,item.Id)">{{item.Title}}</span>
        </p>
        <p v-if="EventList.length==0">涉及事件：暂无</p>
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
                <div class="down-load-modal" :style="{background:item.startDownLoad?'#444':'',opacity:item.startDownLoad?0.6:1}" v-show="!item.hasDownLoad" >
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
        <p style="margin-bottom: 20px;">相关章节：<span v-if="ResourceList.length==0">暂无</span></p>
      
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
                   <div class="mysource" style="margin-top:10px" @click="goBookDetail(props.row.ParentId,props.row.Title)">来源：{{'《'+props.row.Source+'》'}}</div>
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
              @click.stop="download($event,props.row.Id,props.row,props.$index)">{{props.row.hasDown?'阅 读': (props.row.downLoadPercent== 0 && !props.row.startDownLoad ? '点击下载': props.row.downLoadPercent + '%')}}</el-button>
            </template>
          </el-table-column>
        </el-table>


        <div class="loading-content" v-show="loading">
            <img src="../assets/loading.gif" alt="">
        </div>


         <ul class="context-menu" :style="{left:conMenuLeft+'px',top:conMenuTop + 'px'}" v-show="conMenuShow">
            <li :class="menuListDisable.copy?'':'menu-disabled'" @click="copyText()">复制</li>
            <li @click="collectedDeatil()">{{hasCollect?"取消收藏":'收藏'}}</li>
            <li :class="menuListDisable.read?'':'menu-disabled'" @click="openReading($event)">阅读该章</li>
            <li :class="menuListDisable.download?'':'menu-disabled'" @click="LoadList($event)">下载该章</li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
            return {
                personId: 0,
                winHeight: 800,
                winWidth: Number,
                showColectWord: "",
                activeNames: ['1'],
                getDate: {},
                EventList: [],
                MapList: [],
                ResourceList: [],
                ResourceList: [],
                loading: true,
                hasCollect:false,
                conMenuLeft:100,
                conMenuTop:100,
                conMenuShow:false,
                menuListDisable:{
                 copy:false,
                 collect:false,
                 read:false,
                 download:false
               },
               showBlackModal:false,
               copySection:'',
                getRowKeys(row) {
                    return row.Id;
                },
                // 要展开的行，数值的元素是row的key值
                aimNode: null,
                expands: [],

            }
        },
        mounted() {
           // ShowDevTools();
            //用于设置navmenu的高度，解决element-ui不能设置高度的bug
            this.setWindow();

           if(env=="dev"){
             this.personId=this.$route.query.personId
           }else if(env=="prod"){
             this.personId = GetArgument().split('personId=')[1].split('&&')[0]
           }

           this.getDetailData();
          

            window.onresize = () => {
                this.setWindow();
            }
            
        },
        methods: {
            setWindow() {
                this.winWidth = window.innerWidth;
                this.winHeight = window.innerHeight;
            },
            transform(row) {
                return row.isExpand ? 180 : 0;
            },
            //获取页面详情
            getDetailData() {
                //  验证有没有用户信息
                // var hasUserId = volidUserId();
                // if(!hasUserId) return;
                
                //请求页面数据
                this.loading = true;
                if(env=="dev"){
                    this.$http.get('/explicitword/detail', {
                        params: {
                            id: this.personId,
                            // userid: localStorage.getItem("userId")
                        }
                    })
                    .then((response) => {
                        this.loading = false;
                        this.getDate = response.data.Data;
                        this.EventList = response.data.Data.EventList;
                        this.MapList = response.data.Data.MapList[0] == null ?  [] :  response.data.Data.MapList;

                         this.MapList.forEach((item,index)=>{
                             item['hasDownLoad'] = false;
                             item['showHasDownLoad'] = true;
                             item['startDownLoad'] = false;
                             item['downLoadPercent'] = 0;
                          })

                        this.ResourceList = response.data.Data.ResourceList;
                        this.menuListDisable.collect=response.data.Data.IsFavorite
                        
                        //处理章节列表
                       this.ResourceList.forEach((item,index)=>{
                           item['hasDown'] = false;
                           item['downPercent'] = 0;
                           item['isExpand'] = false;
                        }) 
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }else if(env== "prod"){
                     var data={
                        id: this.personId,
                        userid: localStorage.getItem("userId")
                     }

                    // setTimeout(()=>{
                         
                    //      var winResult = ApiTransfer('get','/explicitword/detail',conbineData(data));
                    //      winResult=JSON.parse(winResult)
                    //      this.loading=false;
                    //      if(winResult.Success){
                    //         this.getDate = winResult.Data;
                    //         this.EventList = winResult.Data.EventList;
                    //         var listIds = [];
                    //         this.MapList = winResult.Data.MapList[0] == null ?  [] : winResult.Data.MapList;

                    //         this.MapList.forEach((item,index)=>{
                    //            item['hasDownLoad'] = false;
                    //            item['showHasDownLoad'] = true;
                    //            item['startDownLoad'] = false;
                    //            item['downLoadPercent'] = 0;
                    //            listIds.push(item.Id)
                    //         })
                    //         this.ResourceList = winResult.Data.ResourceList;
                    //         this.menuListDisable.collect=winResult.Data.IsFavorite
                            
                    //         //处理章节列表
                    //        this.ResourceList.forEach((item,index)=>{
                    //            item['hasDown'] = false;
                    //            item['downLoadPercent'] = 0;
                    //            item['isExpand'] = false;
                    //            listIds.push(item.Id)
                    //         }) 

                    //        this.expands = [];

                    //        //向后台发送缓存验证,获取已经下载过的文件
                
                    //         //获取已下载的数据
                    //         if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
                    //             var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
                    //                 hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                    //             if(hasDownLoadedContent.length == 0) return; 

                    //             //根据已下载数据，渲染界面
                    //             hasDownLoadedContent.forEach((getItem,getIndex)=>{
                    //                this.ResourceList.forEach((bookItem,bookIndex)=>{
                    //                    if(getItem.ResourceId == bookItem.Id) {
                    //                        bookItem['hasDown'] = true;
                    //                        bookItem['nativeUrl'] = getItem.FilePath;
                    //                        bookItem['downLoadPercent'] = 100;
                    //                        bookItem['nativeUrl'] = getItem.FilePath;
                    //                    }
                    //                })

                    //                this.MapList.forEach((bookItem,bookIndex)=>{
                    //                    if(getItem.ResourceId == bookItem.Id) {
                    //                        bookItem['hasDownLoad'] = true;
                    //                        bookItem['downLoadPercent'] = 100;
                    //                        bookItem['nativeUrl'] = getItem.FilePath;
                    //                    }
                    //                })
                    //             })
                    //         }

                    //      }
                    // },500)


                    //下面是配合winform异步获取数据
                    ApiTransfer('get','/explicitword/detail',JSON.stringify(data),(winResult)=>{
                        winResult=JSON.parse(winResult)
                         this.loading=false;
                         if(winResult.Success){
                            //设置窗口名称
                            SetTabTitle(winResult.Data.Title,GetFormId());
                            this.getDate = winResult.Data;
                            this.EventList = winResult.Data.EventList;
                            var listIds = [];
                            this.MapList = winResult.Data.MapList[0] == null ?  [] : winResult.Data.MapList;

                            this.MapList.forEach((item,index)=>{
                               item['hasDownLoad'] = false;
                               item['showHasDownLoad'] = true;
                               item['startDownLoad'] = false;
                               item['downLoadPercent'] = 0;
                               listIds.push(item.Id)
                            })
                            this.ResourceList = winResult.Data.ResourceList;
                            this.hasCollect = winResult.Data.IsFavorite
                            
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
                                               this.$set(this.ResourceList,bookIndex,bookItem)
                                           }
                                       })

                                       this.MapList.forEach((bookItem,bookIndex)=>{
                                           if(getItem.ResourceId == bookItem.Id) {
                                               bookItem['hasDownLoad'] = true;
                                               bookItem['downLoadPercent'] = 100;
                                               bookItem['nativeUrl'] = getItem.FilePath;
                                               this.$set(this.MapList,bookIndex,bookItem)
                                           }
                                       })
                                    })
                              })
                            }

                         }else {
                            ShowMessage(winResult.Description)
                         }        
                    });


                       
                }
            },
            //设置展开项
            expandRowKeys(newVal, row) {
                var index = 0;
                this.ResourceList.forEach((item, index1) => {
                    if (item.Id == newVal) {
                        index = index1;
                    }
                })

                if (this.expands.indexOf(newVal) != -1) {
                    row.isExpand = false;
                    this.expands.splice(this.expands.indexOf(newVal), 1);
                    this.$set(this.ResourceList, index, row);
                    return;
                }

                row.isExpand = true;
                this.$set(this.ResourceList, index, row);
                this.expands.push(newVal);
            },
            //模拟下载事件
            download(e, sectionid, item, index) {
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
                 this.$set(this.ResourceList,index,item)
                // item.hasDown = true;
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
                    // var resFromWinF = ApiTransfer('get','/file/stream','fileid='+item.DefaultFileId+'&isPC=true'+'&userid='+localStorage.getItem('userId'));
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
                               fileid: item.DefaultFileId,
                               isPC:true,
                               userid:localStorage.getItem('userId'),
                               type:2,
                               resourceid:item.Id,
                               source:item.Source,
                               title:item.Title,
                            }

                        //下面是配合winform异步获取数据
                        // ApiTransfer('get','/file/stream',JSON.stringify(data),(resFromWinF)=>{
                        //      resFromWinF = JSON.parse(resFromWinF);
                        //      if(resFromWinF.Code == 200) {
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
                        //             item.nativeUrl = nativeUrl;
                        //             GetDownLoadProgress(item.downloadUrl,(progress)=>{
                        //                   if (Math.floor(progress) >= 100) {
                        //                     item.downLoadPercent = 100;
                        //                     item.hasDown = true;
                        //                   } else {
                        //                       item.downLoadPercent = Math.floor(progress);
                        //                   }

                        //                   this.$set(this.ResourceList, index, item)
                        //               })
                        //           })
                        //         //开始下载
                        //               // var setTime = setInterval(() => {
                        //               //     if (item.downLoadPercent >= 100) {
                        //               //         item.downLoadPercent = 100;
                        //               //         item.hasDown = true;

                        //               //         clearInterval(setTime);
                        //               //     } else {
                        //               //         item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                        //               //     }
                        //               //     this.$set(this.ResourceList, index, item)
                        //               // }, 500)


                                       

                        //     }else {
                        //         ShowMessage(resFromWinF.Description);
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
           
            //点击章节名称进行的跳转
            beforeToBookView(row) {
                if (!row.hasDown) {
                    this.$message({
                        message: '请先下载该章节！',
                        type: 'warning'
                    });
                } else {
                    this.toBookView(row.Id,row);
                }
            },

            
            goEventDetail(title,id) {
                if (env == "dev") {
                    this.$router.push({
                        path: '/eventDetail',
                        query: {
                            eventId: id
                        }
                    })
                } else if (env == "prod") {
                    SaveArgument('eventId='+id.toString())
                    loadForm('/index.html#/eventDetail','详情',title,true)
                }
            },
            goBookDetail(id,title) {

                if (env == "dev") {
                     this.$router.push({path:"/bookDetail",query:{bookId:id}})
                } else if (env == "prod") {
                     SaveArgument('bookId='+id.toString())
                    loadForm('/index.html#/bookDetail','详情',title,true)
                }
            },
            goMapDetail(id) { //链接到地图阅读页
                if (env == "dev") {
                    this.$router.push({
                        path: '/static/map.html',
                        query: {
                            resourceid: id
                        }
                    })
                } else if (env == "prod") {
                    SaveArgument('mapId='+id.toString())
                    loadForm("/static/map.html",'阅读','地图阅读',true);
                }
            }, 
            //右键操作,打开menu
            openContextMenu(e) {
                this.conMenuShow=true;
                this.aimNode = null;

                this.menuListDisable.copy = false;
                this.menuListDisable.collect = this.hasCollect;
                this.menuListDisable.read = false;
                this.menuListDisable.download = false;

                if(this.winWidth-e.pageX<100){
                    this.conMenuLeft=this.winWidth-100;
                 }else{
                    this.conMenuLeft=e.pageX;
                 }
                this.conMenuTop = e.pageY;

                //判断复制按钮能否使用
                if (document.getSelection().toString() !== '') {
                    this.copySection = document.getSelection().toString();
                    this.menuListDisable.copy = true;
                }

                //判断阅读按钮能否使用
                if (e.target.nodeName == 'TD') {
                    //都点击的td
                    this.aimNode = e.target.parentNode.children[3];
                } else if (e.target.nodeName == 'A') {
                    // 点击的是第一个单元格里的文字a标签
                    this.aimNode = e.target.parentNode.parentNode.parentNode.children[3];
                } else if (e.target.nodeName == 'DIV') {
                    //点击的是a标签的 父容器div
                    this.aimNode = e.target.parentNode.parentNode.children[3];
                } else if (e.target.nodeName == 'I') {
                    // 点击的是a 的子元素i
                    this.aimNode = e.target.parentNode.parentNode.parentNode.parentNode.children[3];
                } else if (e.target.nodeName == 'I') {
                    // 点击的是a 的子元素i
                    this.aimNode = e.target.parentNode.parentNode.parentNode.parentNode.children[3];
                } else if (e.target.nodeName == 'BUTTON') {
                    // 点击的是button
                    this.aimNode = e.target.parentNode.parentNode;
                } else if (e.target.nodeName == 'SPAN') {
                    // 点击的是button
                    this.aimNode = e.target.parentNode.parentNode.parentNode;
                }

                if (this.aimNode) {
                    if (this.aimNode.innerText.trim() == '点击下载') {
                        this.menuListDisable.download = true;
                        this.menuListDisable.read = false;
                    } else if (this.aimNode.innerText.trim() == '阅 读') {
                        this.menuListDisable.read = true;
                        this.menuListDisable.download = false;
                    }
                }
            },
             //复制
            copyText(e){
                this.conMenuShow=false;
                //写入剪贴板
                Clip(this.copySection);
              },
            //右键阅读
            openReading(e){
                 if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
                     // bookid = this.aimNode.children[0].children[0].getAttribute('data-id');
                     var bookDetail = JSON.parse(this.aimNode.children[0].children[0].getAttribute('data-bookData'));

                     this.toBookView(bookDetail.Id,bookDetail);
                 }
              },
            //右键下载
            LoadList(e){
              if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
                 var bookDetail = JSON.parse(this.aimNode.children[0].children[0].getAttribute('data-bookData'));
                 
                 var sectionIndex = 0;
                 this.ResourceList.forEach((item,index)=>{
                     if(item.Id == bookDetail.Id) sectionIndex = index;
                 })

                 this.download(e, bookDetail.Id, bookDetail, sectionIndex);
               }
              
            },  
            //右键收藏
            collectedDeatil() {
                //验证有没有用户信息
                var hasUserId = volidUserId();
                if(!hasUserId) return;

                this.conMenuShow = false;
                if(env=="dev"){
                    this.$http.post("/favorite/createorcancel", {
                            objectid: this.personId,
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
                        objectid: this.personId,
                        objecttype: 2, //1图书章节地图2人物事件
                        userid: localStorage.getItem("userId")
                    }
                    // var winResult = ApiTransfer('post','/favorite/createorcancel',conbineData(data));
                    // winResult=JSON.parse(winResult)
                    // if (winResult.Success) {
                    //     if (winResult.Description=="收藏成功") {
                    //         this.menuListDisable.collect = true;
                    //     }else{
                    //         this.menuListDisable.collect = false;
                    //     }
                    //     this.$message({
                    //         showClose: true,
                    //         message: winResult.Description,
                    //         type:'success'
                    //     });
                    // }


                    //下面是配合winform异步获取数据
                    ApiTransfer('post','/favorite/createorcancel',JSON.stringify(data),(winResult)=>{
                         winResult=JSON.parse(winResult)
                        if (winResult.Success) {
                            if (winResult.Description=="收藏成功") {
                                this.hasCollect = true;
                            }else{
                                this.hasCollect = false;
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
           //检测该地图是否已经被下载
          checkMapIsDownLoad(item, index) {
            this.showBlackModal=true;
              console.log(item,index)
              // if (item.top !== -115) {
              //     clearInterval(item.setTime);
              // };

              // if (item.setTime) return;
              // item.setTime = setInterval(() => {
              //     if (item.top >= 0) {
              //         item.top = 0;
              //         clearInterval(item.setTime);
              //         item.setTime = null;
              //     } else {
              //         item.top += 4;
              //     }
              //     this.$set(this.mapList, index, item)
              // }, 1)
          },
          upDownload(item, index) {
            this.showBlackModal=false;
                //     if (item.top !== 0) {
                //         clearInterval(item.setTime);
                //     }; //如果未走到0

                //     //如果正在下载
                //     if (item.startDownLoad) {
                //         return;
                //     }

                //     //没有下载
                //     item.setTime = setInterval(() => {
                //         if (item.top <= -115) {
                //             item.top = -115;
                //             clearInterval(item.setTime);
                //             item.setTime = null;
                //         } else {
                //             item.top -= 2;
                //         }
                //         this.$set(this.maplistData, index, item)
                //     }, 1)
            },
            //开始下载地图
             //开始下载
            startDownLoadMap(item, index) {
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
                    // var resFromWinF = ApiTransfer('get','/resource/defaultfile_open','resourceid='+item.Id+'&userid='+localStorage.getItem('userId'));
                    // resFromWinF = JSON.parse(resFromWinF);
                    // item.downloadUrl = resFromWinF.Data.Url;
                    // var downdata = {
                    //       downloadUrl:item.downloadUrl,
                    //       resourceid:item.Id+'',
                    //       type:item.Type,
                    //       title:item.Title,
                    //       source:item.Source,
                    //       userid:localStorage.getItem('userId')
                    //    }

                    // item.nativeUrl = DownLoad(JSON.stringify(downdata));
                    
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
                        type:item.Type,
                        isPC:true,
                        source:item.Source,
                        title:item.Title,
                    }

                    //下面是配合winform异步获取数据
                    // ApiTransfer('get','/resource/defaultfile_open',JSON.stringify(data),(resFromWinF)=>{
                    //         resFromWinF = JSON.parse(resFromWinF);
                    //         item.downloadUrl = resFromWinF.Data.Url;
                    //         var downdata = {
                    //               downloadUrl:item.downloadUrl,
                    //               resourceid:item.Id+'',
                    //               type:item.Type,
                    //               title:item.Title,
                    //               source:item.Source,
                    //               userid:localStorage.getItem('userId')
                    //            }

                    //         // item.nativeUrl = DownLoad(JSON.stringify(downdata));
                            
                    //         DownLoad(JSON.stringify(downdata),(nativeUrl)=>{
                    //           item.nativeUrl = nativeUrl;
                    //           GetDownLoadProgress(item.downloadUrl,(progress)=>{
                    //                 if (Math.floor(progress) >= 100) {
                    //                   item.downLoadPercent = 100;
                    //                   item.hasDownLoad = true;
                    //                 } else {
                    //                     item.downLoadPercent = Math.floor(progress);
                    //                 }

                    //                 this.$set(this.MapList, index, item)
                    //            })
                    //        })
                    //         // alert(nativeUrl);
                    //         // var setTime = setInterval(() => {
                    //         //     if (item.downLoadPercent >= 100) {
                    //         //         item.downLoadPercent = 100;
                    //         //         item.hasDownLoad = true;
                    //         //         clearInterval(setTime);
                    //         //     } else {
                    //         //         item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                    //         //     }
                    //         //     this.$set(this.MapList, index, item)
                    //         // }, 500)


                            
                    //   });

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

            toBookView(sectionid,item) {
                  if(env == 'dev') {
                     location.href  = './static/reader.html?sectionid='+sectionid;
                  }else if(env == 'prod') {
                     SaveArgument('sectionId='+sectionid+'&secret='+item.Secret+'&bookSrc='+item.nativeUrl+'&parentId='+item.ParentId)
                     loadForm('/static/reader.html','图书阅读',item.Title,true);
                  }
            },
        },
        watch: {
            'setWindow': function() {
                this.setWindow();
            }
        },
        updated() {
           var container =  this.$refs.personDetail;
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
        }
}
</script>
<style lang="less">
@media screen and (max-width: 260px) {
   .person-name {
        flex-direction: column;
        align-items: flex-start;
        height: 80px
    }
}
.person-detail {
    min-width: 350px;
    position: relative;
    color: #444;
    overflow-y: visible;

    .collectImg{
        width: 32px;
        height: 32px;
        position: absolute;
        right: 100px;
        top: 40px;
        background-image: url("../assets/收藏.png");
        cursor: pointer;
    }
    .collectImg1 {
        width: 32px;
        height: 32px;
        position: absolute;
        right: 100px;
        top: 40px;
        cursor: pointer;
        background-image: url("../assets/收藏1.png");
    }
    .collectImg:hover {
        background-image: url("../assets/收藏1.png");
    }
    h2 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 70px;
        margin-bottom: -20px
    }

    h2 span {
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
        p{
          margin-top: 0;
        }
      }
    .booklist-item {
        display: flex;
        justify-content: left;
        align-items: center;
        margin: 20px auto;
        border: 1px solid #ddd;
        height: 100px;
        width: 98%;
    }
    .booklist-item:hover {
        box-shadow: 1px 1px 10px #888;
    }
    .booklist-item-cont li {
        height: 25px;
        width: 98%;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        cursor: pointer;
        color: #444;
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
    .region {
        display: inline-block;
        padding: 6px 13px;
        margin-right: 10px;
        cursor: pointer;
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
    .myLoad {
        position: absolute;
        right: 20px;
        top: 6px;
        padding: 8px 15px;
        font-weight: 400;
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
        // opacity: 0.5;
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
      text-decoration: underline !important;
      color:#2b579a;
          }
}
</style>
