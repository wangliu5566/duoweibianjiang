<template>
  <div class="footPrint" @contextmenu.prevent="openContextmenu($event)" @click="conMenuShow=false">
    <h3>我的足迹</h3>
    <table cellspacing="0" style="width: 100%;margin-bottom: 15px;">
      <thead>
        <tr style="background-color:#ddd;">
          <th class="th1">类型
            <img src="../../../static/images/selected.png" @click.self="showType1 = !showType1">
            <ul class="showType" v-show="showType1">
              <li @click="selectedType(0)">全部</li>
              <li @click="selectedType(1)">图书</li>
              <li @click="selectedType(3)">地图</li>
              <li @click="selectedType(4)">事件</li>
              <li @click="selectedType(2)">人物</li>
            </ul>
          </th>
          <th style="width:30%;border-right:1px solid #ddd;">名称</th>
          <th style="width:35%;border-right:1px solid #ddd;">来源</th>
          <th style="width:20%;border-right:1px solid #ddd;"> 时间&nbsp;&nbsp;
            <img v-if="!isUP" src="" @click="changeOrder()">
            <img v-else src="" @click="changeOrder()">
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="dataList.length!=0" 
            v-for="(item,index) in dataList" 
            :key="item.CreateTime" 
            :objectId="item.ObjectId" 
            :objectType="item.ObjectType" 
            :type="item.ObjectType==2?item.ExplicitWord.Type==1?2:4:item.Resource.Type==1?1:item.Resource.Type==2?5:3" 
            :createTime='item.CreateTime' 
            :IsFavorite="item.ObjectType==2?item.ExplicitWord.IsFavorite:item.Resource.IsFavorite" 
            :DefaultFileId="item.ObjectType==1?item.Resource.Type==2?item.Resource.DefaultFileId:'':''" 
            :ParentId="item.ObjectType==1?item.Resource.Type==2?item.Resource.ParentId:'':''" 
            :Secret="item.ObjectType==1?item.Resource.Type==2?item.Resource.Secret:'':''" 
            @click="goDetail(item.ObjectId,item.ObjectType==2?item.ExplicitWord.Type==1?2:4:item.Resource.Type==1?1:item.Resource.Type==2?5:3,item)">
          <td @click.stop="">
          <div class="td-div1" class="has-checkbox">
            <input type="checkbox" style="margin-right:10px;" :id="'label'+index" v-model="item.isChecked">
            <!-- <span class="check-input" :id="'label'+index" v-model="item.isChecked"></span> -->
            <div>
                  <label :for="'label'+index">{{item.ObjectType==2?item.ExplicitWord.Type==1?"人物":"事件":item.Resource.Type==3?"地图":"图书"}}</label>
            </div>
            </div>
          </td>
          <td>
            <div>{{item.ObjectType==2?item.ExplicitWord.Title:item.Resource.Title}}</div>
          </td>
          <td>
            <div>{{item.ObjectType==2?item.ExplicitWord.Source?item.ExplicitWord.Source:"暂无":item.Resource.Source?item.Resource.Source:"暂无"}}</div>
          </td>
          <td>{{item.CreateTime}}</td>
        </tr>
        <tr v-if="dataList.length==0">
          <td colspan="4" class="no-content">暂无足迹</td>
        </tr>
      </tbody>
    </table>
    <div class="check-all">
      <span class="check-box-span">
          <input type="checkbox" id="checkall" v-model="isChecked" @change="checkAll" :disabled="flag"> 
          <label for="checkall"> 全选</label>
      </span>
      <el-button @click="delHasChecked" :disabled="flag" class="emputy">删除选中</el-button>
    </div>
    <!-- 分页 -->
    <div class="block" style="text-align: right;margin-bottom: 50px;" v-if="totalCount>0">
      <el-pagination 
      @size-change="handleSizeChange" 
      @current-change="handleCurrentChange" 
      :current-page="currentPage" 
      :page-sizes="[15, 20, 30, 40]"
      :page-size="pageCount" 
      layout="total, sizes, prev, pager, next, jumper" :total="totalCount">
      </el-pagination>
    </div>
    <div class="loading-content" v-show="loading">
      <img src="" alt="">
    </div>
    <!-- 右键菜单 -->
    <ul class="context-menu" v-if="conMenuShow" :style="{left:conMenuLeft+'px',top:conMenuTop+'px'}">
      <li @click="deleteFavorite()" :class="contextObj.del?'':'menu-disabled'">删除</li>
      <li @click="collected()"> {{contextObj.collect?'取消收藏':'收藏'}} </li>
      <!-- <li @click="reading()" :class="contextObj.reading?'':'menu-disabled'">{{showWord}}</li> -->
      <li @click="goDetailPage()" :class="contextObj.detail?'':'menu-disabled'">查看详情</li>
    </ul>
    <div class="loading-content" style="background:black" v-show="downloadLoading">
    </div>
    <div class="loading-content load-other" v-show="downloadLoading" v-cloak>
      <p>正在为您下载 {{downLoadFileName}}，请稍候...{{downLoadPercent}} %</p>
    </div>
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
      winWidth: 0,
      winHeight: 0,
      dataList: [],
      loading: true,
      downloadLoading: false,
      downLoadPercent: 0,
      downLoadFileName: '',
      pageCount: 15,
      currentPage: 1,
      totalCount: 0,
      isUP: false,
      showType1: false,
      dataType: 0, //请求类型的时候：0全部1图书2人物3地图4事件
      saveType: 0, //右击获取当前tr的类型：跟dataType不一样，
      objectType: 1, //1图书章节地图2人物事件
      objectId: 0, //右击时存的id,
      ParentId: 1,
      Secret: "",
      conMenuShow: false,
      conMenuLeft: 0,
      conMenuTop: 0,
      contextObj: {
        del: true,
        collect: false,
        reading: true,
        detail: true
      },
      showWord: "阅读",
      createTime: "",
      nativeUrl: "",
      isChecked: false,

      flag:false,
      checkTimer:null
    }
  },
  mounted() {
    // ShowDevTools();
    this.setWindow();
    window.onresize = () => {
      this.setWindow();
    }
    //获取初始数据
    this.getInitialData();
    

    //添加监视器，任意一个不被选中，全选框就不被选中
    this.checkTimer = setInterval(()=>{
       if(this.dataList.length == 0) return;

       for(var i = 0 ; i < this.dataList.length ; i++) {
          if(!this.dataList[i].isChecked) {
             this.isChecked = false;
             break;
          }
       }
    }, 800)


  },
  destroyed() {
    clearInterval(this.checkTimer);
  },
  methods: {
    setWindow() {
      this.winWidth = window.innerWidth;
      this.winHeight = window.innerHeight;
    },
    //切换每页的条数
    handleSizeChange(val) {
      this.pageCount = val;
      this.isChecked = false;
      this.getInitialData()
    },
    //点击页数，请求第几页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.isChecked = false;
      this.getInitialData()
    },
    //时间升序降序
    changeOrder() {
      this.isUP = !this.isUP;
      this.dataList = this.dataList.reverse();
    },
    //筛选类型
    selectedType(index) {
      this.showType1 = false;
      this.dataType = index;
      this.getInitialData();
    },
    //全选
    checkAll() {
      this.dataList.forEach((item, index) => {
        item['isChecked'] = this.isChecked ? true : false;
        this.$set(this.dataList, index, item);
      })
    },
    //获取数据
    getInitialData() {
      this.loading = true;
      if (env == 'dev') {
        this.$http("/history/list", {
            params: {
              userid: 100,
              type: this.dataType, //0全部1图书2人物3地图4事件
              ps: this.pageCount, //每页条数
              cp: this.currentPage, //当前页
            }
          })
          .then((res) => {
            this.loading = false;
            this.dataList = res.data.Data.ItemList
            this.totalCount = res.data.Data.RecordCount

            this.dataList.forEach((item, index) => {
              item['isChecked'] = false;
            })

          })
          .catch((err) => {
            console.log(err)
          })
      } else if (env == "prod") {
        var data = {
          userid: localStorage.getItem('userId'),
          type: this.dataType, //0全部1图书2人物3地图4事件
          ps: this.pageCount, //每页条数
          cp: this.currentPage, //当前页
        }
        
        //下面是配合winform异步获取数据
        ApiTransfer('get', '/history/list', JSON.stringify(data), (winResult) => {
          winResult = JSON.parse(winResult)
          this.loading = false;
          if (winResult.Success) {

            this.totalCount = winResult.Data.RecordCount
            if(winResult.Data.ItemList.length == 0) {
               this.flag = true;
               this.dataList = [];
               return;
            }

            this.flag = false;

            this.dataList= winResult.Data.ItemList
            
            this.dataList.forEach((item, index) => {
              item['hasDown'] = false;
              item['isChecked'] = false;
            })

          }


        });


      }
    },
    //右键功能
    openContextmenu(e) {
      if (this.winWidth - e.pageX < 120) {
        this.conMenuLeft = this.winWidth - 120;
      } else {
        this.conMenuLeft = e.pageX;
      }

      this.conMenuTop = e.pageY;

      if (e.target.parentNode.nodeName == "TD") {
        this.conMenuShow = true;
        this.saveType = e.target.parentNode.parentNode.getAttribute("type")
        this.objectType = e.target.parentNode.parentNode.getAttribute("objectType")
        this.objectId = e.target.parentNode.parentNode.getAttribute("objectId")
        this.createTime = e.target.parentNode.parentNode.getAttribute("createTime")
        this.contextObj.collect = !!e.target.parentNode.parentNode.getAttribute("IsFavorite");
      } else if (e.target.nodeName == "TD") {
        this.conMenuShow = true;
        this.saveType = e.target.parentNode.getAttribute("type")
        this.objectType = e.target.parentNode.getAttribute("objectType")
        this.objectId = e.target.parentNode.getAttribute("objectId")
        this.createTime = e.target.parentNode.getAttribute("createTime")
        this.contextObj.collect = !!e.target.parentNode.getAttribute("IsFavorite");

      } else {
        this.conMenuShow = false;
      }


      //查看是否能阅读和查看详情
      if (this.saveType == 1) { //1图书
        this.contextObj.reading = false;
        this.contextObj.detail = true;
        this.showWord = "阅读"
      } else if (this.saveType == 2) { //2人物
        this.contextObj.reading = false;
        this.contextObj.detail = true;
        this.showWord = "阅读"
      } else if (this.saveType == 3) { //3地图
        this.contextObj.reading = true;
        this.contextObj.detail = false;
        this.showWord = "下载"
      } else if (this.saveType == 4) { //4事件
        this.contextObj.reading = false;
        this.contextObj.detail = true;
        this.showWord = "阅读"
      } else if (this.saveType == 5) { //5章节
        this.contextObj.detail = false;
        this.contextObj.reading = true;
        this.showWord = "阅读"
      }

    },
    //删除
    deleteFavorite() {
      var myobjects = this.objectId + "," + this.objectType + "," + this.createTime

      if (env == "dev") {
        this.$http.post("/history/delete", {
            userid: localStorage.getItem('userId'),
            objects: myobjects,
          })
          .then((res) => {
            this.conMenuShow = false;
            if (res.data.Success) {
              this.getInitialData()
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            }
          })
          .catch((err) => {
            console.log(err)
          })
      } else if (env == "prod") {
        var data = {
          userid: localStorage.getItem('userId'),
          objects: myobjects,
        }

        //             var winResult = ApiTransfer('post','/history/delete',conbineData(data));
        //                 winResult=JSON.parse(winResult)
        //                 this.conMenuShow=false;
        // if(winResult.Success){
        //   this.getInitialData()
        //   this.$message({
        //            type: 'success',
        //            message: '删除成功!'
        //          });
        //    }else {
        //     ShowMessage(winResult.Description)
        //    }

        //下面是配合winform异步获取数据
        ApiTransfer('post', '/history/delete', JSON.stringify(data), (winResult) => {
          winResult = JSON.parse(winResult)
          this.conMenuShow = false;
          if (winResult.Success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getInitialData();
            this.isChecked = false;
          } else {
            ShowMessage(winResult.Description)
          }
        });


      }
    },
    //删除选中、
    delHasChecked() {
      var delObjectids = [];
      var delStr = '';
      this.dataList.forEach((item, index) => {
        if (item.isChecked) {
          delObjectids.push(item.ObjectId);
          delStr += item.ObjectId + "," + item.ObjectType + "," + item.CreateTime + '|';
        }
      })

      if(delObjectids.length == 0) {
        this.$message({
              type: 'error',
              message: '请选择要删除的足迹!'
            });
        return
      }

      delStr = delStr.slice(0, -1);

      // 对象编号，对象类型，创建时间|对象编号，对象类型，创建时间
      if (env == 'prod') {
        ApiTransfer('post', '/history/delete', JSON.stringify({
          userid: localStorage.getItem('userId'),
          objects: delStr,
        }), (winResult) => {
          winResult = JSON.parse(winResult)
          console.log(winResult)
          if (winResult.Success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getInitialData();
            this.isChecked = false;
          } else {
            ShowMessage(winResult.Description)
          }
        });
      }
    },
    //收藏取消收藏
    collected() {
      this.conMenuShow = false;
      if (env == "dev") {
        this.$http.post("/favorite/createorcancel", {
            userid: localStorage.getItem('userId'),
            objectid: this.objectId,
            objecttype: this.objectType,
          })
          .then((res) => {
            this.conMenuShow = false;
            if (res.data.Success) {
              this.$message({
                type:'success',
                showClose: true,
                message: res.data.Description
              });
              this.getInitialData();
            }
          })
          .catch((err) => {
            console.log(err)
          })
      } else if (env == "prod") {
        var data = {
          userid: localStorage.getItem('userId'),
          objectid: this.objectId,
          objecttype: this.objectType,
        }
        //  var winResult = ApiTransfer('post','/favorite/createorcancel',conbineData(data));
        //   winResult=JSON.parse(winResult)
        //   if (winResult.Success) {
        //        this.$message({
        //            showClose: true,
        //            message: winResult.Description
        //        });
        //        this.getInitialData();
        // }


        //下面是配合winform异步获取数据
        ApiTransfer('post', '/favorite/createorcancel', JSON.stringify(data), (winResult) => {
          winResult = JSON.parse(winResult)
          if (winResult.Success) {
            this.$message({
              type:'success',
              showClose: true,
              message: winResult.Description
            });
            this.getInitialData();
          }
        });


      }
    },
    //阅读
    reading(index) {
      this.conMenuShow = false;
      if (this.saveType == 5) { //章节才能阅读

      }

    },
    //左击去详情页
    goDetail(id, type, item) {
      this.objectId = id;
      this.saveType = type;
      this.downLoadFileName = !item.Resource ? 　item.ExplicitWord.Title : item.Resource.Title　;
      if (type == 5) {
        this.Secret = item.Resource.Secret;
        this.ParentId = item.Resource.ParentId;
        this.DefaultFileId = item.Resource.DefaultFileId
      } else {
        this.ParentId = "";
        this.Secret = "";
        this.DefaultFileId = item.Resource?item.Resource.DefaultFileId:'';
      }
      this.goDetailPage(item);
    },
    //右击去详情页
    goDetailPage(item) { //1图书2人物3地图4事件
      this.conMenuShow = false;
      if (this.saveType == 1) { //跳转到图书详情
        if (env == "dev") {
          this.$router.push({ path: "/bookDetail", query: { bookId: this.objectId } })
        } else if (env == "prod") {
          SaveArgument('bookId=' + this.objectId)
          loadForm('/index.html#/bookDetail', "详情", this.downLoadFileName, true)
        }
      } else if (this.saveType == 2) { //去人物详情
        if (env == "dev") {
          this.$router.push({ path: '/personDetail', query: { personId: this.objectId } })
        } else if (env == "prod") {
          SaveArgument('personId=' + this.objectId)
          loadForm('/index.html#/personDetail', '详情', this.downLoadFileName, true)
        }
      } else if (this.saveType == 3) { //先判断地图下载与否
        this.startDownLoad(item);

      } else if (this.saveType == 4) { //去事件详情
        if (env == "dev") {
          this.$router.push({ path: '/eventDetail', query: { eventId: this.objectId } })
        } else if (env == "prod") {
          SaveArgument('eventId=' + this.objectId)
          loadForm('/index.html#/eventDetail', '详情', this.downLoadFileName, true)
        }
      } else if (this.saveType == 5) { //去章节阅读
        this.download(item)
      }
    },
    toBookView(item) {
      if (env == "dev") {
        location.href = './static/reader.html?sectionid=' + this.objectId;
      } else if (env == "prod") {
        SaveArgument('sectionId=' + this.objectId + '&secret=' + this.Secret + '&bookSrc=' + item.nativeUrl + '&parentId=' + this.ParentId)
        loadForm('/static/reader.html', '图书阅读', this.downLoadFileName, true);
      }
    },
    //跳转地图阅读页面
    toMapView(item) {

      if (env == 'dev') {
        window.location.href = './static/map.html?resourceid=' + this.objectId;
      } else if (env == 'prod') {
        // ChangeDpi(item.nativeUrl, (delNativeUrl) => {
          SaveArgument('imgSrc=' + item.nativeUrl + '&resourceid=' + this.objectId);
          loadForm('/static/map.html', '地图阅读', this.downLoadFileName, true);
          
        // });
      }
    },
    //验证是否下载过该章节/地图
    isFileDownLoad(item,fileType,downloadFn) {
        // fileType - 1 章节  2 - 地图
        //异步获取下载,根据文件id
        
        GetDownLoadedResources(this.objectId+'',localStorage.getItem('userId'),(hasDownLoadedContent) => {
          hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
          if (hasDownLoadedContent.length == 0) {
            //需要重新下载
            downloadFn();
          }else {
             item.nativeUrl = hasDownLoadedContent[0].FilePath;

             switch (fileType) {
               case 1:
                 this.toBookView(item);
                 break;
               case 2:
                 this.toMapView(item);
                 break;  
               default:
                 // statements_def
                 break;
             }
          } 
        })
    },
    //下载章节
    download(item) {
      this.isFileDownLoad(item,1,()=>{
          this.downLoadPercent = 0;
          this.downloadLoading = true;

          var data = {
            fileid: this.DefaultFileId,
            isPC: true,
            userid: localStorage.getItem('userId'),
            resourceid:this.objectId,
            source:item.Resource.Source,
            title:this.downLoadFileName,
            type: 2
          }


          //多线程异步下载
          DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
                if(err) {
                    this.downloadLoading = false;
                    OpenForm(480,500,'/index.html#/userCenter','个人信息');
                    localStorage.setItem('fromWhere',3);
                }else {
                    item.nativeUrl = nativeUrl;
                    //获取下载进度
                    if (Math.floor(progress) >= 100) {
                        this.downLoadPercent = 100;
                        this.downloadLoading = false;
                        item.hasDown = true;
                        this.toBookView(item);
                    } else {
                        this.downLoadPercent = Math.floor(progress);
                    }
                }
          });
      }); 
 
    },
    //开始下载地图
    startDownLoad(item) {
       this.isFileDownLoad(item,2,()=>{
         this.downLoadPercent = 0;
         this.downloadLoading = true;
         var data = {
            resourceid: this.objectId,
            userid: localStorage.getItem('userId'),
            fileid:this.DefaultFileId,
            isPC:true,
            source:null,
            title:this.downLoadFileName,
            type: 3,
          }

          DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
            
              if(err) {
                    
                    this.downloadLoading = false;
                    OpenForm(480,500,'/index.html#/userCenter','个人信息');
                    localStorage.setItem('fromWhere',3);
                }else {
                    item.nativeUrl = nativeUrl;
                    //获取下载进度
                    if (Math.floor(progress) >= 100) {
                        this.downLoadPercent = 100;
                        this.downloadLoading = false;

                        this.toMapView(item);
                    } else {
                        this.downLoadPercent = Math.floor(progress);
                    }
                }
          });
          
       })
    },
  },
  watch: {
    'setWindow': function() {
      this.setWindow();
    }
  }
}

</script>
<style lang="less">
.footPrint {
  /* width: 84%; */
  padding: 0 4% 30px 4%;
  overflow-y: visible;
  min-width: 630px;

  h3 {
    overflow: hidden;
    width: 100%;
    line-height: 50px;
    text-align: center;
  }
  table {
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    min-width: 460px;
    // overflow:hidden;
  }

  th {
    border-bottom: 1px solid #ddd;
    padding: 10px 20px;
    background: #f2f2f2;
  }

  .th1 {
    width: 15%;
    border-right: 1px solid #dfe6ec;
    position: relative;
    min-width: 50px;
  }

  img {
    cursor: pointer;
    vertical-align: middle;
    float: right;
  }
  .has-checkbox {
         display: flex;
         justify-content: center;
         align-items: center;
    }
    /* .check-input {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid #bfcbd9;
    position: absolute;
    left: 5px;
    background-color: #fff;
      } */
  .showType {
    position: absolute;
    left: 60%;
    background-color: #fff;
    width: 100px;
    border: 1px solid #ddd;
  }
  .showType li {
    line-height: 30px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    text-align: center;
  }

  td {
    padding: 10px 15px;
    overflow: hidden;
    border-right: 1px solid #ddd;
    cursor: pointer;
    border-bottom: 1px solid #ddd;
    text-align: center;
  }

  td div {
    max-height: 40px;
    line-height: 20px;
    overflow: hidden;
  }

  thead tr {
    border-right: 1px solid #ddd;
  }

  tbody tr:hover {
    background: #e4ebf5
  }

  .no-content {
    text-align: center;
    line-height: 60px;
    background: #fff
  }

  .load-other {
    opacity: 1;
    background: transparent;
    color: white;
    font-size: 18px;
  }

  .check-all {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    width: 100%;
    height: 50px;
    min-width: 460px;
    overflow:hidden;
  }

  .check-box-span {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15%;
    input {
      margin-left: 10px;
      margin-right: 10px;
      /* background-color:white; */
    }
  }
}

</style>
