<template>
    <div :style="{height:winHeight +'px'}" class="maplist-content" @contextmenu.prevent="">
        <div class="maplist-show-type">
           <!--  <el-radio-group v-model="radio3" >
                <el-radio-button label="图片模式"></el-radio-button>
                <el-radio-button label="文字模式"></el-radio-button>
            </el-radio-group>
            <el-button type="primary">{{radio3}}</el-button> -->
        </div>
        <div class="maplist-item-content">
            <ul v-if="!isShowScale">
                <li v-for="(item,index) in maplistData" :title="item.Title">
<!--                 @mouseenter="checkMapIsDownLoad(item,index)" 
                @mouseleave="upDownload(item,index)" -->

                 <!-- <li v-for="(item,index) in maplistData" :title="item.Title"> -->
                    <img :src="item.CoverUrl" alt="" @click="toMapView(item,item.Id)" @dragstart.prevent="" >
                    <p>{{item.Title}}</p>
                    <!-- <p>{{item.Title.length<=8 ?item.Title:item.Title.slice(0,8)+ '...'}}</p> -->
                        
                    <!-- <img src="../assets/下载完成1.png" alt="" class="has-download" v-show="item.hasDownLoad">     -->
                    <div class="down-load-modal" :style="{top:item.hasDownLoad?-153 + 'px': 0 + 'px',opacity:item.startDownLoad?0.3:0}">
                       
                    </div>

                    <div class="down-load-modal down-load-modal-opcaty" :style="{top:item.hasDownLoad?-153 + 'px': 0 + 'px'}">
                        <el-progress v-show="item.startDownLoad" :stroke-width="3" type="circle" :percentage="item.downLoadPercent" :status="item.downLoadPercent == 100?'success':''" :width="46" style="color:white;margin-top:-10px">
                        </el-progress>
                        <img src="../assets/下载大.png" alt="" @click="startDownLoad(item,index)" v-show="!item.startDownLoad">
                    </div>
                </li>
            </ul>
            <ul v-else>
                <li v-for="(item,index) in maplistData" :title="item.Title" :class="item.hasDownLoad?'is-checked font-model-list':'font-model-list'" 
                   @click="startDownLoad(item,index)" 
                 >
<!--                    @mouseenter="showDownIcon(item,index)"
                   @mouseleave="showDownIcon(item,index)" -->


                    <span>{{item.Title.length <= 6?item.Title:item.Title.slice(0,6)+'...'}}</span>
                    &nbsp;
                    <img src="../assets/下载小.png" alt="" v-show="!item.hasDownLoad " v-if="!item.startDownLoad">
                    <span v-else v-show="item.downLoadPercent !== 100" style="color:#337ab7; position: absolute;right: 10px;top: 21px;">{{item.downLoadPercent}}%</span>
                    <!-- <img src="../assets/下载完成.png" alt="" v-show="item.hasDownLoad "> -->
                </li>
            </ul>

            <div style="display:flex;justify-content:center;align-items:center;width:100%;height:400px;" v-show="maplistData.length==0">
                暂无地图数据
            </div>
        </div>

        <div class="loading-content" v-show="loading">
            <img src="../assets/loading.gif" alt="">
        </div>
    </div>
</template>
<script>
export default {
    data() {
            return {
                input: '',
                maplistData: [],
                radio3: '图片模式',
                winHeight: window.innerHeight,
                beCheckedMaps: [],
                loading: true,
                winWidth:1080,
                downloadUrl:'',
                isShowScale:false,

            }
        },

        methods: {
            //检测该地图是否已经被下载
            checkMapIsDownLoad(item, index) {
                if (item.top !== -153) {
                    clearInterval(item.setTime);
                };

                if (item.setTime) return;
                item.setTime = setInterval(() => {
                    if (item.top >= 0) {
                        item.top = 0;
                        clearInterval(item.setTime);
                        item.setTime = null;
                    } else {
                        item.top += 4;
                    }
                    this.$set(this.maplistData, index, item)
                }, 1)
            },
            //开始下载
            startDownLoad(item, index) {
                //验证有没有用户信息
                var hasUserId = volidUserId(true);
                if(!hasUserId) return;

                if(item.hasDownLoad){
                    this.toMapView(item,item.Id,index);
                    return;
                }; 
                item.startDownLoad = true;
                item.top = 0;
                this.$set(this.maplistData, index, item);
                
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

                            setTimeout(() => {
                                var setTime1 = setInterval(() => {
                                    if (item.top <= -153) {
                                        item.top = -153;
                                        clearInterval(setTime1);
                                    } else {
                                        item.top -= 2;
                                    }
                                    this.$set(this.maplistData, index, item)
                                }, 1)
                            }, 500)
                            clearInterval(setTime);

                        } else {
                            item.downLoadPercent += 1;
                        }
                        this.$set(this.maplistData, index, item)
                    }, 100)
                }else if(env == 'prod') {


                   var data = {
                      resourceid:item.Id,
                      userid:localStorage.getItem('userId'),
                      source:item.Source,
                      title:item.Title,
                      fileid:item.DefaultFileId,
                      isPC:true,
                      type:3
                   }


                   DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
                         

                          if(err) {
                              OpenForm(480,500,'/index.html#/userCenter','个人信息');
                              localStorage.setItem('fromWhere',3);
                              item.startDownLoad = false;
                          }else {
                              console.log(progress)
                              item.nativeUrl = nativeUrl;
                              //获取下载进度
                              if (Math.floor(progress) >= 100) {
                                  item.downLoadPercent = 100;
                                  item.hasDownLoad = true;
                                  item.top = -153;
                              } else {
                                  item.downLoadPercent = Math.floor(progress);
                              }

                              // document.getElementById('downloadBtn'+index).innerText = progress;
                              
                          }

                          this.$nextTick(()=>{
                             this.$set(this.maplistData, index, item)
                             // this.startDownLoad(item, index);
                          })

                          // this.$set(this.maplistData, index, item)
                  });
                    
                }   

                
            },
            upDownload(item, index) {
                if (item.top !== 0) {
                    clearInterval(item.setTime);
                }; //如果未走到0

                //如果正在下载
                if (item.startDownLoad) {
                    return;
                }

                //没有下载
                item.setTime = setInterval(() => {
                    if (item.top <= -153) {
                        item.top = -153;
                        clearInterval(item.setTime);
                        item.setTime = null;
                    } else {
                        item.top -= 2;
                    }
                    this.$set(this.maplistData, index, item)
                }, 1)
            },
            //获取表格数据，包括搜索结果
            getTableData(keyword = '', ps = 5000, cp = 1) {
                this.loading = true;
                if(env == 'dev') {
                   this.$http.get("/resource/list", {
                        params: {
                            keyword: keyword,
                            ps: ps, //每页条数
                            cp: cp, //当前页
                            type: 3
                        }
                    })
                    .then((res) => {
                        this.loading = false;
                        this.maplistData = res.data.Data.ItemList;
                        if (this.maplistData.length !== 0) {
                            this.maplistData.forEach((item, index) => {
                                item['hasDownLoad'] = false;
                                item['showHasDownLoad'] = true;
                                item['startDownLoad'] = false;
                                item['downLoadPercent'] = 0;
                                // item['top'] = -153;
                                item['top'] = 0;
                            })
                        }
                    })
                    .catch((err) => {
                        this.loading = false;
                        console.log(err)
                    })
                }else if(env == 'prod') {

                  var data = {
                            keyword: keyword,
                            ps: ps, //每页条数
                            cp: cp, //当前页
                            type: 3
                         }

                    //下面这种是配合winform实现异步获取数据
                   ApiTransfer('get','/resource/list',JSON.stringify(data),(resFromWinF)=>{
                        this.loading = false;

                        resFromWinF = JSON.parse(resFromWinF);
                        if(resFromWinF.Code == 200) {
                            // resFromWinF.Data.ItemList.pop();

                            this.maplistData = resFromWinF.Data.ItemList;
                            if (this.maplistData.length !== 0) {
                                this.maplistData.forEach((item, index) => {
                                    item['hasDownLoad'] = false;
                                    item['showHasDownLoad'] = true;
                                    item['startDownLoad'] = false;
                                    item['downLoadPercent'] = 0;
                                    item['top'] = -153;
                                })
                            }


                            //向后台发送缓存验证,获取已经下载过的文件
                              var listIds = [];
                              this.maplistData.forEach((item,index)=>{
                                 listIds.push(item.Id)
                              })
                              
                              //获取已下载的数据
                              if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
                                  GetDownLoadedResources(listIds.join(','),localStorage.getItem('userId'),(hasDownLoadedContent)=>{

                                      hasDownLoadedContent = JSON.parse(hasDownLoadedContent);

                                      if(hasDownLoadedContent.length == 0) return; 

                                      hasDownLoadedContent.forEach((getItem,getIndex)=>{
                                         this.maplistData.forEach((mapItem,mapIndex)=>{
                                             if(getItem.ResourceId == mapItem.Id) {
                                                 mapItem['hasDownLoad'] = true;
                                                 mapItem['nativeUrl'] = getItem.FilePath;
                                                 mapItem['downLoadPercent'] = 100;

                                                 this.$set(this.maplistData,mapIndex,mapItem);
                                             }
                                         })
                                      })
                                  });

                                }
                        }else {
                            alert('出现未知错误，请关闭重试！');
                        }
                  });   
                          



                             
                   // var resFromWinF = ApiTransfer('get',"/resource/list",conbineData({
                   //          keyword: keyword,
                   //          ps: ps, //每页条数
                   //          cp: cp, //当前页
                   //          type: 3
                   //      }));


                    // setTimeout(()=>{
                    //     this.loading = false;

                    //     resFromWinF = JSON.parse(resFromWinF);0.0
                    //     if(resFromWinF.Code == 200) {
                    //         this.loading = false;
                    //         this.maplistData = resFromWinF.Data.ItemList;
                    //         if (this.maplistData.length !== 0) {
                    //             this.maplistData.forEach((item, index) => {
                    //                 item['hasDownLoad'] = false;
                    //                 item['showHasDownLoad'] = true;
                    //                 item['startDownLoad'] = false;
                    //                 item['downLoadPercent'] = 0;
                    //                 item['top'] = -153;
                    //             })
                    //         }


                    //         //向后台发送缓存验证,获取已经下载过的文件
                    //           var listIds = [];
                    //           this.maplistData.forEach((item,index)=>{
                    //              listIds.push(item.Id)
                    //           })
                              
                    //           //获取已下载的数据
                    //           if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
                    //               var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
                    //                   hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                    //               if(hasDownLoadedContent.length == 0) return; 

                    //               hasDownLoadedContent.forEach((getItem,getIndex)=>{
                    //                  this.maplistData.forEach((mapItem,mapIndex)=>{
                    //                      if(getItem.ResourceId == mapItem.Id) {
                    //                          mapItem['hasDownLoad'] = true;
                    //                          mapItem['nativeUrl'] = getItem.FilePath;
                    //                          mapItem['downLoadPercent'] = 100;
                    //                      }
                    //                  })
                    //               })
                    //             }
                    //     }else {
                    //         alert('出现未知错误，请关闭重试！');
                    //     }
                    // },500)

                    
                }
            },
            //跳转地图阅读页面
            toMapView(item,resourceid,index) {
                //验证有没有用户信息
                var hasUserId = volidUserId();
                if(!hasUserId) return;

                //防止页面没刷新，用户在下载中心删除了地图，再点这个地图报错，需要再次验证是否有本地文件
                // GetDownLoadedResources(resourceid+'',localStorage.getItem('userId'),(hasDownLoadedContent)=>{

                //   hasDownLoadedContent = JSON.parse(hasDownLoadedContent);

                //   if(hasDownLoadedContent.length == 0) {
                //      //此时被用户删除了这个文件，重新去下载
                //      this.$message({
                //        message: '该文件可能被删除，请重新下载！',
                //        type: 'error'
                //      });

                //      item['hasDownLoad'] = false;
                //      item['startDownLoad'] = false;
                //      item['showHasDownLoad'] = true;
                //      item['downLoadPercent'] = 0;
                //      item['top'] = -153;
                //      this.$set(this.maplistData,index,item);
                //    }else {
                     if(item.hasDownLoad) {
                        if(env == 'dev') {
                           window.location.href = './static/map.html?resourceid=' + resourceid;
                        }else if(env == 'prod') {
                           SaveArgument('imgSrc='+item.nativeUrl+'&resourceid='+resourceid);
                           loadForm('/static/map.html','地图阅读',item.Title,false);
                         }
                      }
                      
                //    }
                // });

                
                
            },
            setHeight() {
                this.winHeight = window.innerHeight
                this.winWidth = window.innerWidth;

                 if(env == 'prod') {
                   var winformWidth = GetFormWidth();
                   if(this.winWidth <= parseInt(winformWidth)/2 - 50) {
                       this.isShowScale = true; 
                   }else {
                       this.isShowScale = false;
                   }
                }
            },
            showDownIcon(item,index) {
                if(!item.hasDownLoad) item.showHasDownLoad = !item.showHasDownLoad;
                this.$set(this.maplistData,index,item)
            }
        },
        mounted() {
            // ShowDevTools();
            this.setHeight();

            this.getTableData();

            window.onresize = () => {
                this.setHeight();
            }
        },
        updated() {
            var listOfProgress = document.getElementsByClassName('el-progress__text');
            for (var i = 0; i < listOfProgress.length; i++) {
                listOfProgress[i].style.color = 'white';
                listOfProgress[i].style.fontSize = '14px';
            }

            
            // var listOfProgressStoke = document.getElementsByClassName('el-progress-circle__track');
            // for (var i = 0; i < listOfProgressStoke.length; i++) {
            //     listOfProgressStoke[i].setAttribute('stroke', 'red');
            // }
        },
        watch: {
            'winHeight': function() {
                this.setHeight();
            },
            'winWidth': function(nv,ov) {
                if(nv <= 900) {
                   this.radio3 = '文字模式'
                }else {
                    this.radio3 = '图片模式'
                }
            }
        }
}
</script>
<style lang="css" scoped>
.maplist-content {
    margin: 1% auto;
    width: 92%;
     -webkit-user-select:none;
    /*overflow: hidden;*/
}



.maplist-show-type {
    display: flex;
    align-items: center;
    /*margin-top: 30px;*/
    width: 100%;
    height: 10px;
}

.maplist-item-content {
    margin: 0 auto;
    width: 100%;
    min-width: 400px;
    height: auto;
}

.maplist-item-content ul {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
}

.maplist-item-content ul li {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    outline: 1px solid #ccc;
    /*background: #eee;*/
    margin: 10px 15px 10px 0;
    width: 240px;
    height: 200px;
}

.maplist-item-content ul li img {
    margin-bottom: 15px;
    width: 100%;
    height: 153px;
}

.maplist-item-content ul li p {
    text-align: left;
    padding: 0 10px;
    font-size: 14px;
    color: #444;
}

.maplist-item-content ul li:hover {
    cursor: pointer;
}

.down-load-modal {
    position: absolute;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 153px;
    background: #444;
    opacity: 0;
}

.down-load-modal-opcaty {
    opacity: 1;
    background: transparent;
}


/*
    .el-progress__text {
      color:white !important;
    }*/

label {
    font-weight: 400
}

.down-load-modal img {
    width: 44px !important;
    height: 44px !important;
    margin-top: 5px;
}

.font-model-list {
    height: 57px !important;
    display: flex;
    flex-direction: row !important;
    justify-content: center;
    align-items: center;
    position: relative;
    font-size: 14px;
    box-shadow: 0px 5px 15px #ddd
}

.font-model-list:hover {
    outline: 7px solid #e4ebf5;
    border: none;
}  

.font-model-list img {
    position: absolute;
    right: 0px;
    top: 20px;
    width: 20px !important;
    height: 20px !important;
    margin: 0 10px 0 20px !important;

}

.is-checked {
    /*background: #eee*/
}

.has-download {
    position: absolute;
    right: 0px;
    top:0px;
    width: 64px !important;
    height: 64px !important;
}
</style>
