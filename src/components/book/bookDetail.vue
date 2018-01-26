<template>
    <div class="book-detail" :style="{width:winWidth +'px',height:winHeight +'px'}" id="bookDetail" @contextmenu.prevent="openContextMenu($event)" @click="conMenuShow = false" ref="bookDetail">
        <div class="book-detail-head" style="overflow: hidden;"> 
           <div class="book-thumb-img" ref="bookThumbImg">
              <img :src="bookSrc" alt="" @dragstart.prevent="">
           </div>

           <div class="book-thumb-detail" ref="bookThumbDetail">
              <div class="collectImg" v-if="!menuListDisable.collect" @click="collectBook()"></div>
              <div class="collectImg1" v-else  @click="collectBook()"></div>
              <h2 style="padding-top: 10px;">{{bookDetail.Title}} 
              </h2>
              <p style="margin-bottom: 0;height: 50px;">
                <b>作者：{{bookDetail.Author?bookDetail.Author:'不详'}}</b>  &nbsp;&nbsp;&nbsp;&nbsp;
                <b>出版时间：{{bookDetail.PublishDate?bookDetail.PublishDate:'不详'}}</b> &nbsp;&nbsp;&nbsp;&nbsp;
                <b>出版社：{{bookDetail.Publisher?bookDetail.Publisher:'不详'}}</b>
              </p>
              <p class="bookdetail-description"><b>简介：</b>{{bookDetail.Description?bookDetail.Description:'暂无简介'}}</p>
           </div>
        </div>
        <p class="section-list-mulu">目录</p>
        <div class="book-sections" ref="bookSections" @mousemove.prevent="" >

            <el-table
              ref="sectionListTable"
              :data="bookListData"
              style="width: 100%"
              :highlight-current-row="true"
              :row-key="getRowKeys"
              :expand-row-keys="expands"
              v-if="bookListData.length !== 0">
              <el-table-column type="expand" >
                <template scope="props">
                    <div  v-if="props.row.Sections">
                        <!-- <div  @contextmenu.stop="openContextMenu($event,-1)" style="line-height:20px">
                         {{props.row.Description?'摘要：'+props.row.Description:'摘要：暂无简介'}}
                        </div>
                       <div class="mysource" style="margin-top:10px" @contextmenu.stop="openContextMenu($event,-1)">来源：{{'《'+props.row.Source+'》'}}</div> -->
                       <el-collapse @change="changeSectionExpand">
                          <el-collapse-item v-for="(item,index) in props.row.Sections" :name="JSON.stringify(item)">
                            <template slot="title">
                                <div style="float:left;width:50%;height:100%;overflow:hidden;text-overflow:hidden;word-wrap:nowrap">
                                  {{item.Title}}
                                </div>
                                <!-- <a href="javascript:void(0)" style="cursor:pointer;float:right;margin-right:20px"> -->
                                   <i class="el-icon-arrow-down"  style="cursor:pointer;float:right;margin-right:20px;margin-top: 15px;" :style="{transition:'all .5s',transform:'rotate('+transform(item)+'deg)'}">
                                   </i>
                                <!-- </a> -->

                                <el-button 
                                size="small"  
                                :data-bookData="JSON.stringify(item)" 
                                :type="item.hasDown?'primary':''" 
                                style="float:right;margin: 8px 20px 8px 0;width:80px" 
                                :disabled="item.startDownLoad && item.downLoadPercent !== 100 ?true:false" 
                                @click.stop="download($event,item.Id,item,index,props.$index)">{{item.hasDown?'阅 读': (item.downLoadPercent == 0 && !item.startDownLoad? '点击下载': item.downLoadPercent + '%')}}
                                </el-button> 
                                
                            </template>
                            <div style="line-height:20px">摘要：{{item.Description}}</div>
                            
                          </el-collapse-item>
                        </el-collapse>

                    </div>
                </template>
              </el-table-column>
               <!-- :width="winWidth*0.96/4" -->

              <el-table-column
               label="章节"
                >
                <template scope="props">
                    <a href="javascript:void(0)" @click="beforeToBookView(props.row);">{{props.row.Title}}</a>
                </template>
              </el-table-column>
                 <!-- :width="winWidth*0.96/2"              -->

              <el-table-column
                label=""
                align="center"
                >
                <template scope="props">
                  <div style="width:100%;height:40px;cursor:pointer" @click="expandRowKeys(props.row.Id,props.row)" v-if="props.row.Sections">
                      
                  </div>
                   <!--  <a href="javascript:void(0)" style="cursor:pointer" @click="expandRowKeys(props.row.Id,props.row)">
                       <i class="el-icon-arrow-down" :style="{transition:'all .5s',transform:'rotate('+transform(props.row)+'deg)'}">
                       </i> &nbsp;{{props.row.isExpand?'收起':'展开'}}
                    </a> -->


                </template>
              </el-table-column>
              <el-table-column
                 align="right"
                 label="状态"
                >
                <template scope="props">
                    <div style="width:100%;height:40px;cursor:pointer" @click="expandRowKeys(props.row.Id,props.row)" v-if="props.row.Sections">
                      
                    </div>
<!--                    <el-button 
                   size="small" 
                   style="width:80px" 
                   v-else 
                   @click.stop="download($event,props.row.Id,props.row,props.$index)"
                   >
                   {{props.row.hasDown?'阅 读': (props.row.downLoadPercent == 0 && !props.row.startDownLoad? '点击下载': props.row.downLoadPercent + '%')}}
                   </el-button>  -->
                  <el-button 
                  size="small" 
                  v-else
                  :id="'downloadBtn'+props.$index" 
                  :data-bookData="JSON.stringify(props.row)" 
                  :type="props.row.hasDown?'primary':''"
                  :disabled="props.row.startDownLoad && props.row.downLoadPercent !== 100 ?true:false" 
                  style="padding: 8px 15px;width:80px;margin-right:38px" 
                  @click.stop="download($event,props.row.Id,props.row,props.$index)">{{props.row.hasDown?'阅 读': (props.row.downLoadPercent == 0 && !props.row.startDownLoad? '点击下载': props.row.downLoadPercent + '%')}}</el-button>
 
                  <!-- <el-button size="small" @click="expandRowKeys(props.row.Id,props.row)" style="width:120px">小节目录</el-button> -->
                </template>
              </el-table-column>
            </el-table>

            <p v-else class="noTableData section-list-mulu">暂无相关章节信息</p> 
        </div>
        <div class="loading-content" v-show="loading">
            <!-- <img src="../../assets/loading.gif" alt=""> -->
        </div>

        <ul class="context-menu" :style="{left:conMenuLeft+'px',top:conMenuTop + 'px'}" v-show="conMenuShow">
            <li :class="menuListDisable.copy?'':'menu-disabled'" @click="closeMenuAndDo($event,'copy')">复制</li>
            <li @click="closeMenuAndDo($event,'collect')">{{menuListDisable.collect?"取消收藏":"收藏"}}</li>
            <li :class="menuListDisable.read?'':'menu-disabled'" @click="closeMenuAndDo($event,'read')">{{readText}}</li>
            <li :class="menuListDisable.download?'':'menu-disabled'" @click="closeMenuAndDo($event,'download')">{{downText}}</li>
        </ul>

        <!-- <p>{{test}}</p> -->
    </div>
</template>
<script>
// import mycollapse from '../model/collapse';

export default {
    name: 'bookDetail',
    data() {
        return {
           test:'',
           bookId:"",
           winWidth:window.innerWidth,
           winHeight:window.innerHeight,
           bookDetail:{},
           activeNames: ['1'],
           bookListData:[],
           loading:true,
           conMenuLeft:100,
           conMenuTop:100,
           conMenuShow:false,
           bookSrc:'./static/images/mapplaceholdimg.png',
           menuListDisable:{
             copy:true,
             collect:false,
             read:false,
             download:false
           },
           copySection:'',
           getRowKeys(row) {
              return row.Id;
          },
          // 要展开的行，数值的元素是row的key值
          aimNode:null,
          expands: [],
        }
    },

    methods: {

        a(b){
          // this.test = b;
        },
        transform(row) {
          // console.log(row)
           return row.isSectionExpand?180:0;
        },

        changeSectionExpand(row) {
           if (!row)  return;
           
           //每次展开去掉中横线
           this.$nextTick(()=>{
              var listOfColExpandedBorder= document.getElementsByClassName('el-collapse-item__header');
              for(var i = 0 ; i < listOfColExpandedBorder.length ; i ++) {
                  listOfColExpandedBorder[i].style.borderBottom = '1px solid #dfe6ec';

                  if(listOfColExpandedBorder[i].parentNode.className.indexOf('is-active') !== -1) {
                      listOfColExpandedBorder[i].style.borderBottom = '1px solid #fff';
                  }
                  
              }
           })

          
            // row = JSON.parse(row);
            // row.isSectionExpand = !row.isSectionExpand;
        },
        //设置展开项
        expandRowKeys(newVal,row) {
            var index = 0;
            this.bookListData.forEach((item,index1)=>{
                if(item.Id == newVal) {
                   index = index1;
                }
            })

            if(this.expands.indexOf(newVal) != -1) {
               row.isExpand = false;
               this.expands.splice(this.expands.indexOf(newVal),1);
               this.$set(this.bookListData,index,row);
               return;
            }

            row.isExpand = true;
            this.$set(this.bookListData,index,row);
            this.expands.push(newVal);
          },
        //收藏或者取消收藏
        collectBook(){
           // 验证有没有用户信息
           var hasUserId = volidUserId();
           if(!hasUserId) return;

           this.loading = true;
           if(env == 'dev'){
              this.$http.post("/favorite/createorcancel", {
                  objectid:this.bookId,
                  objecttype:1,
                  userid:localStorage.getItem('userId')
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
                          message: res.data.Description
                      });
                  }
              })
              .catch((err) => {
                  console.log(err)
              })
          }else if(env=="prod"){
             var data = {
                  objectid:this.bookId,
                  objecttype:1,
                  userid:localStorage.getItem('userId')
              }

              // setTimeout(()=>{
              //     var winResult = ApiTransfer('post','/favorite/createorcancel',conbineData(data));
              //       this.loading = false;
              //       winResult=JSON.parse(winResult)
              //       if(winResult.Success){
              //           if (winResult.Description=="收藏成功") {
              //               this.menuListDisable.collect = true;
              //           } else {
              //               this.menuListDisable.collect = false;
              //           }
                       
              //           if (winResult.Success) {
              //               this.$message({
              //                   showClose: true,
              //                   message: winResult.Description,
              //                   type:'success'
              //               });
              //           }
              //      }
              //  }, 500)



              //下面是配合winform异步获取数据
              ApiTransfer('post','/favorite/createorcancel',JSON.stringify(data),(winResult)=>{
                    this.loading = false;
                    winResult=JSON.parse(winResult)
                    if(winResult.Success){
                        if (winResult.Description=="收藏成功") {
                            this.menuListDisable.collect = true;
                        } else {
                            this.menuListDisable.collect = false;
                        }
                       
                        if (winResult.Success) {
                            this.$message({
                                showClose: true,
                                message: winResult.Description,
                                type:'success'
                            });
                        }
                     }
              });
             
          }
          
        },
        setWindow() {

            this.winWidth = window.innerWidth;
            this.winHeight = window.innerHeight;
            
            console.log(this.winWidth,this.winHeight)

        },
         handleChange(activeNames) {
            // console.log(activeNames )
         },
         //获取图书详情
         getBookDetail() {
           this.loading = true;
           if(env == 'dev'){
            this.$http.get("/resource/detail", {
                  params: {
                      resourceid: 2,
                      userid:localStorage.getItem('userId'),
                  }
              })
              .then((res) => {
                console.log(res)
                this.bookDetail = res.data.Data;
                this.menuListDisable.collect = res.data.Data.IsFavorite;
                this.bookSrc = res.data.Data.CoverUrl;
                //获取章节信息
                this.getBookSectionList(this.bookId);
              })
              .catch((err) => {
                  console.log(err)
              })
           }else if(env=="prod"){
              var data = {
                  resourceid: this.bookId,
                  userid:localStorage.getItem('userId'),
                }
                // setTimeout(()=>{
                //    var winResult = ApiTransfer('get','/resource/detail',conbineData(data));

                //     winResult=JSON.parse(winResult)
                //    if(winResult.Success){
                //       this.bookDetail = winResult.Data;
                //       this.menuListDisable.collect = winResult.Data.IsFavorite;
                //       this.bookSrc = winResult.Data.CoverUrl;
                //       //获取章节信息
                //       this.getBookSectionList(this.bookId);
                //    }
                // },500) 
               


               //下面是配合winform异步获取数据
                ApiTransfer('get','/resource/detail',JSON.stringify(data),(winResult)=>{
                       winResult=JSON.parse(winResult)

                       console.log(winResult)
                       if(winResult.Success){
                          this.bookDetail = winResult.Data;
                          
                          SetTabTitle(bookDetail.Title,GetFormId());
                          this.menuListDisable.collect = winResult.Data.IsFavorite;
                          this.bookSrc = winResult.Data.CoverUrl;
                          //获取章节信息
                          this.getBookSectionList(this.bookId);
                       }
                  });
            }
         },
         //获取图书的章节列表
          getBookSectionList(bookid) {
            // this.loading = true;
            if(env == 'dev'){
                 this.$http.get("/resource/tableofcontent", {
                      params: {
                          resourceid: 2
                      }
                  })
                  .then((res) => {
                    this.loading = false;
                    this.bookListData = res.data.Data;
                    this.bookListData.forEach((item,index)=>{
                       
                       item['isExpand'] = false;
                       if(item.Sections) {
                          item.Sections.forEach((secItem,secIndex)=>{
                            secItem['isSectionExpand'] = false;
                            secItem['hasDown'] = false;
                            secItem['downLoadPercent'] = 0;
                            secItem['startDownLoad'] = false;
                         })
                       }
                       
                    })

                  })
                  .catch((err) => {
                    this.loading = false;
                  })
            }else if(env=="prod"){
               var data = {
                     resourceid: bookid
                   }
               //  setTimeout(()=>{
               //     var winResult = ApiTransfer('get','/resource/tableofcontent',conbineData(data));
               //     winResult=JSON.parse(winResult)
               //     if(winResult.Success){
               //        this.loading = false;
               //        this.bookListData = winResult.Data;
               //        this.bookListData.forEach((item,index)=>{
               //           item['hasDown'] = false;
               //           item['downLoadPercent'] = 0;
               //           item['isExpand'] = false;
               //        })

               //        //向后台发送缓存验证,获取已经下载过的文件
               //        var listIds = [];
               //        this.bookListData.forEach((item,index)=>{
               //           listIds.push(item.Id)
               //        })
                      
               //        //获取已下载的数据
               //        if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
               //          var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
               //              hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
               //          if(hasDownLoadedContent.length == 0) return; 

               //          hasDownLoadedContent.forEach((getItem,getIndex)=>{
               //             this.bookListData.forEach((bookItem,bookIndex)=>{
               //                 if(getItem.ResourceId == bookItem.Id) {
               //                     bookItem['hasDown'] = true;
               //                     bookItem['nativeUrl'] = getItem.FilePath;
               //                     bookItem['downLoadPercent'] = 100;
               //                 }
               //             })
               //          })
               //        }


               //     }
               // },500) 



                //下面是配合winform异步获取数据
                ApiTransfer('get','/resource/tableofcontent',JSON.stringify(data),(winResult)=>{
                      winResult=JSON.parse(winResult)
                     if(winResult.Success){
                        this.loading = false;
                        this.bookListData = winResult.Data;

                        var listIds = [];
                        this.bookListData.forEach((item,index)=>{
                           item['isExpand'] = false;

                           if(item.Sections) {
                              item.Sections.forEach((secItem,secIndex)=>{
                                    secItem['isSectionExpand'] = false;
                                    secItem['hasDown'] = false;
                                    secItem['downLoadPercent'] = 0;
                                    secItem['startDownLoad'] = false;
                                    listIds.push(secItem.Id)
                              })
                           }else {
                              item['hasDown'] = false;
                              item['downLoadPercent'] = 0;
                              item['startDownLoad'] = false;
                              listIds.push(item.Id)
                           }
                        })

                        //向后台发送缓存验证,获取已经下载过的文件
                        
                        //获取已下载的数据
                        if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
                          // var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
                          //     hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                          // if(hasDownLoadedContent.length == 0) return; 

                          // hasDownLoadedContent.forEach((getItem,getIndex)=>{
                          //    this.bookListData.forEach((bookItem,bookIndex)=>{
                          //        if(getItem.ResourceId == bookItem.Id) {
                          //            bookItem['hasDown'] = true;
                          //            bookItem['nativeUrl'] = getItem.FilePath;
                          //            bookItem['downLoadPercent'] = 100;
                          //        }
                          //    })
                          // })


                          //异步获取下载
                          GetDownLoadedResources(listIds.join(','),localStorage.getItem('userId'),(hasDownLoadedContent)=>{
                              hasDownLoadedContent = JSON.parse(hasDownLoadedContent);

                              console.log(hasDownLoadedContent)
                              if(hasDownLoadedContent.length == 0) {
                                  this.bookListData.forEach((bookItem,bookIndex)=>{
                                     if(bookItem.Sections) this.expands.push(bookItem.Id);
                                 })
                              }else {
                                 hasDownLoadedContent.forEach((getItem,getIndex)=>{
                                   this.bookListData.forEach((bookItem,bookIndex)=>{
                                       if(bookItem.Sections) {
                                          bookItem.Sections.forEach((secItem,secIndex)=>{
                                              if(getItem.ResourceId == secItem.Id) {
                                                  secItem['isSectionExpand'] = false;
                                                  secItem['hasDown'] = true;
                                                  secItem['downLoadPercent'] = 100;
                                                  secItem['nativeUrl'] = getItem.FilePath;
                                                  this.$set(this.bookListData[bookIndex],secIndex,secItem);
                                              }  
                                          })

                                          this.expands.push(bookItem.Id);
                                       }else {
                                          if(getItem.ResourceId == bookItem.Id) {
                                                bookItem['hasDown'] = true;
                                                bookItem['downLoadPercent'] = 100;
                                                bookItem['nativeUrl'] = getItem.FilePath;
                                                this.$set(this.bookListData,bookIndex,bookItem);
                                            } 
                                       }
                                   })
                                })
                              }

                              
                          })

                          

                        }


                     }else {
                       ShowMessage(winResult.Description)
                     }
                });
            }
              
          },
          //模拟下载事件
          download(e,sectionid,item,index,pIndex) {
              CloseMenueStrip();
              // 验证有没有用户信息和激活码
              var hasUserId = volidUserId(true);
              if(!hasUserId) return;
              
              if(item.hasDown) {
                  e.stopPropagation();
                  this.toBookView(sectionid,item); 
              }else {
                //只要一点击就变为0
                item.startDownLoad = true;
                if(!pIndex) {
                  this.$set(this.bookListData,index,item);
                }else {
                  this.$set(this.bookListData[pIndex].Sections,index,item);
                }
              

                if(env == 'dev') {
                   var setTime = setInterval(()=>{
                        if(item.downLoadPercent >= 100) {
                           item.downLoadPercent = 100;
                           item.hasDown = true;  
                           this.$set(this.bookListData[pIndex].Sections,index,item);
                           clearInterval(setTime);
                        }else {
                           item.downLoadPercent++;
                           this.$set(this.bookListData[pIndex].Sections,index,item);
                        }
                    }, 50)
                }else if(env == 'prod') {
                    //获取图书下载地址
                  //   var resFromWinF = ApiTransfer('get','/file/stream','fileid='+item.DefaultFileId+'&isPC=true&userid='+localStorage.getItem('userId')+'&activatedcode=16267308418');
                  //       resFromWinF = JSON.parse(resFromWinF);
                  //       if(resFromWinF.Code == 200) {
                  //           item.downloadUrl = resFromWinF.Data;
                  //           var downdata = {
                  //                   downloadUrl:item.downloadUrl,
                  //                   resourceid:item.Id+'',
                  //                   type:item.Type,
                  //                   title:item.Title,
                  //                   source:item.Source,
                  //                   userid:localStorage.getItem('userId')
                  //                }
                  //           item.nativeUrl = DownLoad(JSON.stringify(downdata));
                  //           //开始下载
                  //           var setTime = setInterval(() => {
                  //               if (item.downLoadPercent >= 100) {
                  //                   item.downLoadPercent = 100;
                  //                   item.hasDown = true;

                  //                   clearInterval(setTime);
                  //               } else {
                  //                   item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                  //               }
                  //               this.$set(this.bookListData, index, item)
                  //           }, 500)                             
                  //       }else {
                  //           ShowMessage(resFromWinF.Description);
                  //       }
                  // }

                  var data = {
                      fileid:item.DefaultFileId,
                      isPC:true,
                      type:2,
                      userid:localStorage.getItem('userId'),
                      resourceid:item.Id,
                      source:item.Source,
                      title:item.Title,
                  }
                  //下面是配合winform异步获取数据
                  // ApiTransfer('get','/file/stream',JSON.stringify(data),(resFromWinF)=>{
                  //     resFromWinF = JSON.parse(resFromWinF);
                  //     if(resFromWinF.Code == 200) {
                  //         item.downloadUrl = resFromWinF.Data;
                  //         var downdata = {
                  //                 downloadUrl:item.downloadUrl,
                  //                 resourceid:item.Id+'',
                  //                 type:item.Type,
                  //                 title:item.Title,
                  //                 source:item.Source,
                  //                 userid:localStorage.getItem('userId')
                  //              }
                  //         // item.nativeUrl = DownLoad(JSON.stringify(downdata));
                          
                  //         DownLoad(JSON.stringify(downdata),(nativeUrl)=>{
                  //             item.nativeUrl = nativeUrl;
                  //             //开始下载
                          
                  //             GetDownLoadProgress(item.downloadUrl,(progress)=>{
                  //                   if (Math.floor(progress) >= 100) {
                  //                       item.downLoadPercent = 100;
                  //                       item.hasDown = true;
                  //                   } else {
                  //                       item.downLoadPercent = Math.floor(progress);
                  //                   }


                  //                   // document.getElementById('downloadBtn'+index).innerText = progress;
                  //                   this.$set(this.bookListData, index, item)
                  //             })
                  //         })

                          
                  //         // var setTime = setInterval(() => {
                  //         //     if (item.downLoadPercent >= 100) {
                  //         //         item.downLoadPercent = 100;
                  //         //         item.hasDown = true;

                  //         //         clearInterval(setTime);
                  //         //     } else {
                  //         //         item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                  //         //     }
                  //         //     this.$set(this.bookListData, index, item)
                  //         // }, 500)                             
                  //     }else {
                  //         ShowMessage(resFromWinF.Description);
                  //     }
                  // });
                  //多线程异步下载
                  DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
                      if(err) {
                        item.startDownLoad = false;
                        OpenForm(480,500,'/index.html#/userCenter','个人信息');
                        localStorage.setItem('fromWhere',3);
                      }else {
                        item.nativeUrl = nativeUrl;

                        //获取下载进度
                        if (Math.floor(progress) >= 100) {
                            item.downLoadPercent = 100;
                            item.hasDown = true;

                        } else {
                            item.downLoadPercent = Math.floor(progress);
                        }


                        // document.getElementById('downloadBtn'+index).innerText = progress;
                      }
                        if(!pIndex) {
                          this.$set(this.bookListData,index,item);
                        }else {
                          this.$set(this.bookListData[pIndex].Sections,index,item);
                        }
                      
                  });

                }
              }  
          },
          //右键操作,打开menu
          openContextMenu(e,type) {
               if( type == -1){
                 e.preventDefault();
                 return;
               }; 
           
               this.conMenuLeft = e.pageX;
               this.conMenuTop = e.pageY;
               this.conMenuShow = true;

               this.aimNode = null;

               // 先将某些按钮止于不可用
                this.menuListDisable.copy = false
                this.menuListDisable.read = false
                this.menuListDisable.download = false
             
               //判断复制按钮能否使用
               if(document.getSelection().toString() !== '') {
                  this.copySection = document.getSelection().toString();
                  this.menuListDisable.copy = true;
               }

               //判断阅读按钮能否使用，先讨论没有小节的图书
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

            
               //下面讨论有小节的图书
               if(e.target.nodeName == 'DIV' && e.target.className == 'el-collapse-item') {
                  this.aimNode = e.target.children[0].children[3];
               }else if(e.target.nodeName == 'DIV' && e.target.className == 'el-collapse-item__header') {
                  this.aimNode = e.target.children[3];
               }else if(e.target.nodeName == 'I' && e.target.parentNode.className == 'el-collapse-item__header') {
                  this.aimNode = e.target.nextSibling.nextSibling
               }else if(e.target.nodeName == 'DIV' && e.target.parentNode.className == 'el-collapse-item__header') {
                  this.aimNode = e.target.nextSibling.nextSibling.nextSibling.nextSibling
               }else if(e.target.nodeName == 'BUTTON') {
                  this.aimNode = e.target;
               }else if(e.target.nodeName == 'SPAN') {
                  this.aimNode = e.target.parentNode;
               }

              
              if(this.aimNode && this.aimNode.parentNode && this.aimNode.parentNode.className == 'el-collapse-item__header') {
                  this.readText = '阅读该节';
                  this.downText = '下载该节';
              }else {
                  this.readText = '阅读该章';
                  this.downText = '下载该章';
              }

              if(this.aimNode) {
                 if(this.aimNode.innerText.trim() == '点击下载') {
                     this.menuListDisable.download = true;
                     this.menuListDisable.read = false; 
                 }else if(this.aimNode.innerText.trim()== '阅 读') {
                     this.menuListDisable.read = true ;
                     this.menuListDisable.download = false;
                     this.menuListDisable.readAll = true ;
                 } 
              }

          },
          //点击右键菜单中的选项的操作
          closeMenuAndDo(e,operate) {
              if(e.target.className !== '') return;
              switch (operate) {
                case 'copy':
                      //写入剪贴板
                      Clip(this.copySection);
                  break;
                case 'collect':
                    this.collectBook();
                  break;
                case 'read':
                     var bookData = null;
                     //有小节的图书展示是后面新增的需求
                     if(this.aimNode.nodeName == 'BUTTON') {
                         bookData = this.aimNode.getAttribute('data-bookData');
                     }else if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
                         bookData = this.aimNode.children[0].children[0].getAttribute('data-bookData');
                     }


                     if(bookData) {
                         bookData = JSON.parse(bookData)
                         this.toBookView(bookData.Id,bookData);
                     }
                  break;
                case 'download':
                     var bookData = null;
                     
                     if(this.aimNode.nodeName == 'BUTTON') {
                         bookData = this.aimNode.getAttribute('data-bookData');

                         var index = 0;
                         var pIndex = 0;

                         bookData = JSON.parse(bookData)
                         this.bookListData.forEach((pitem,pindex1)=>{
                            if(pitem.Sections) {
                               pitem.Sections.forEach((citem,cindex)=>{
                                   if(citem.Id == bookData.Id) {
                                      index = cindex;
                                      pIndex = pindex1;
                                   }
                               })
                            }
                           
                         })

                         this.download(e,bookData.Id,bookData,index,pIndex);

                     }else if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
                         bookData = this.aimNode.children[0].children[0].getAttribute('data-bookData');
                         if(bookData) {
                             var index = 0;
                             bookData = JSON.parse(bookData)
                             this.bookListData.forEach((item,index1)=>{
                                if(item.Id == bookData.Id) index = index1;
                             })

                             this.download(e,bookData.Id,bookData,index);
                         }
                     }

                  break;      
                default:
                  // statements_def
                  break;
              }
          },
          //点击章节名称进行的跳转
          beforeToBookView(row) {
             if(row.Sections) return;
             if(!row.hasDown) {
                this.$message({
                  message: '请先下载该章节！',
                  type: 'warning'
                });
             }else {
                this.toBookView(row.Id,row);
             }
          },
         toBookView(sectionid,item) {
            //因为设计改动，导致层级结构改变，这里采用循环找出当前节的父级的parentid
            if(!item.ParentId) {
               this.bookListData.forEach((pitem,pindex)=>{
                   if(pitem.Sections) {
                      pitem.Sections.forEach((secItem,secIndex)=>{
                            if(secItem.Id == sectionid) item.ParentId = pitem.ParentId
                      })
                   }
                })
            }
            
            if(env == 'dev') {
               location.href  = './static/reader.html?sectionid='+sectionid;
            }else if(env == 'prod') {
               SaveArgument('sectionId='+sectionid+'&secret='+item.Secret+'&bookSrc='+item.nativeUrl+'&parentId='+item.ParentId)
               loadForm('/static/reader.html','图书阅读',item.Title,false);
            }
         } 
    },
    mounted() {
        // ShowDevTools()                           
        if(env == 'dev'){
           this.bookId = this.$route.query.bookId;
         }else if(env=="prod"){
            this.bookId = GetArgument().split("bookId=")[1].split("&&")[0];
         }
      
        this.setWindow();
        this.getBookDetail();
        var _this = this;

        window.onresize = () => {
            this.setWindow();
        }
    },
    updated() {
        var container =  this.$refs.bookDetail;
         if(!container)  return;
        //用于设置模态框中多选框的样式
        var listofCheckBox = container.getElementsByClassName('el-checkbox-button__inner');

        for (let i = 0; i < listofCheckBox.length; i++) {
            listofCheckBox[i].style.borderRadius = '10px';
            listofCheckBox[i].style.padding = '5px 15px';
        }
      
        // var listOfIcon = container.getElementsByClassName('el-table__expand-icon');
        var listOfIcon = container.getElementsByClassName('el-icon-arrow-right');
        for(var i = 0 ; i < listOfIcon.length ; i ++) {
            listOfIcon[i].style.display  = 'none'
        }

        var listOfColGroup = container.getElementsByTagName('colgroup');
        for(var i = 0 ; i < listOfColGroup.length ; i ++) {
            listOfColGroup[i].children[0].setAttribute('width', '0');
        }

        //下面是根据UI调整element组件的样式
        
        
        var listOfColExpandedPadding = container.getElementsByClassName('el-table__expanded-cell');
        for(var i = 0 ; i < listOfColExpandedPadding.length ; i ++) {
            listOfColExpandedPadding[i].style.padding = '20px 0px 20px 50px';
        }


    }
}
</script>

<style scoped>
.book-detail {
    min-width: 350px;
    overflow-y: scroll;
    overflow-x: hidden;
}

.book-detail-head {
    height: auto;
    width: 96%;
    position: relative;
}

.book-thumb-img {
    float: left;
    margin: 40px 40px 40px 20px;
    width:160px;
    height:210px;
    box-shadow: 5px 5px 5px #ddd;
}

.book-thumb-img img {
    width:100%;
    height:100%;

}

.book-thumb-detail {
    float: left;
    margin-bottom:10px;
    width: 75%;
    height: 100%;
    line-height: 24px;
    color: #666;
}


.book-thumb-detail h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 40px 0 20px 0;
}

.book-thumb-detail p {
    font-size: 14px
}

.book-thumb-detail p:nth-child(3) {
    line-height: 24px;
    height: 72px;
    overflow: hidden;
    margin: 20px 40px 40px 0;
}


.section-list-mulu {
  margin: 20px auto;
  width: 96%;
}

.book-sections {
  margin: 0 auto;
  width: 96%;
  height: auto
}

.book-sections a {
  color:#666;
}

.book-sections a:hover {
  color:#2b579a;
}
/* .collectImg,.collectImg1{
    width: 32px;
    height: 32px;
    position: absolute;
    right:100px;
    top:40px;
    cursor: pointer;
  }
  .collectImg1{
  }
  .collectImg:hover{
    width: 32px;
    height: 32px;
  }
*/
  .collectImg,.collectImg1{
    width: 32px;
    height: 32px;
    position: absolute;
    right:100px;
    top:40px;
    background-image: url("../../assets/收藏.png");
    cursor: pointer;
  }
  .collectImg1{
     background-image: url("../../assets/收藏1.png");
  }
  .collectImg:hover{
    width: 32px;
    height: 32px;
    background-image: url("../../assets/收藏1.png");
  }


.el-table {
     font-size: 12px;
    /* min-width: 542px;
    overflow: auto; */
  }

  .el-collapse {
    border: none !important
  }



  @media screen and (max-width: 1018px){
    .book-detail-head {
      width: 100%;
    }
    .book-thumb-detail {
      padding-left: 20px;
      width: 95%;
    }

    .section-list-mulu {
      padding-left: 20px;
    }

    .collectImg,.collectImg1 {
      right:35px;
    }


    .book-thumb-img {
        margin-bottom:0 ;
        width:240px;
        height: 300px;
    }
    .bookdetail-description {
      width: 
    }


}


@media screen and (min-width: 553px) and (max-width: 1018px) {
    .section-list-mulu {
      padding-left: 0px;
    }
}

</style>
