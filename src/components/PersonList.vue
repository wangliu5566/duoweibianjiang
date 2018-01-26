<template>
  <div class="personList" 
   :style="{height:winHeight+'px'}"
   @click="conMenuShow=false"
   @contextmenu.prevent="openContextMenu($event)">
    <!-- 搜索 -->
    <div class="book-cont-head">
        <!-- <el-button type="primary" @click="toSection">章节列表</el-button> -->
        <b></b>
        <span style="position:relative">
            <el-input 
              placeholder="请输入人物名字或关键字" 
              icon="search" v-model="personName" 
              :on-icon-click="handleIconClick"
              @keyup.enter.native="handleIconClick"
              >
            </el-input>
            <i class="el-icon-close close-search" @click="resetSearchKey"></i>
        </span>
    </div>  

    <p style="margin-bottom:10px" v-show="isShowSearchResult">
        与“<span class="search-text-color">{{showSearchKeyword}}</span>”相关检索结果：共<span class="search-text-color">{{totalCount}}</span>条
    </p>
    
    <table  cellspacing="0" style="width: 100%;">
      <thead>
         <tr>
          <th style="width: 20%;">人物名称</th>
          <th :class="showDynasty?'line2BG line-2':'line-2'"
          @click="ascendingOrder()"
          >
            
              <span style="display: flex;justify-content: space-between;align-items: center;">
               <span style="display: flex;justify-content: flex-start;align-items: center;">
                 时期 
                 <i class="order" v-if="!isUP"  @click.stop="ascendingOrder()"></i>
                 <i class="order1" v-else  @click.stop="ascendingOrder()"> </i>
               </span>
              <i class="typeIcon" @click.stop="showDynastyClick"></i>
              </span>
               <div class="checkBox" v-show="showDynasty">
                <p>朝代筛选</p>
                <div class="options">
                    <div class="check-box" v-model="checkAll">
                      <label @click.stop="allChange">
                        <span class="check-input" :class="checkAll?'selectThis':''"></span>
                        <span class="check-label">全选</span>
                      </label>
                    </div>
                    <div class="check-group">
                      <div class="check-box" v-for="(item,index) in dynastyArr" :key="item.createId">
                        <label @click.stop="clickThis(item.Id,index,item.isChecked)">
                          <span class="check-input" :class="item.isChecked?'selectThis':''"></span>
                          <span class="check-label">{{item.Title}}</span>
                        </label>
                        <span class="choiceOne" @click.stop="selectOnly(item.Id,index)">仅筛选此项</span>
                      </div>
                    </div>
                </div>
                <div class="confirmOK">
                  <span @click.stop="submitDynasty">确定</span>
                  <span @click.stop="showDynasty=false">取消</span>
                </div>
            </div>
          </th>
          <th style="width: 60%;">简介</th>
        </tr>
      </thead>
      <tbody>
         <tr v-if="tableData.length!=0" 
             v-for="item in tableData" 
             @click="goPersonDetail(item.Id,item.Title)"
             @contextmenu.prevent="openContextMenu($event)"
             :thisId="item.Id"
             :thisTitle="item.Title"
             v-show="item.Abstracts!='' && item.Abstracts!=0 "
          >
          <td>{{item.Title?item.Title:"暂无"}}</td>
          <td>{{item.Dynasty?item.Dynasty:"暂无"}}</td>
          <td v-if="item.Abstracts==''">暂无简介</td>
          <td v-if="item.Abstracts!=''">
            <div> {{item.Abstracts}}</div>
          </td>
        </tr>
        <tr v-if="tableData.length==0">
          <td colspan="3" style="text-align: center">暂无数据</td>
        </tr>
      </tbody>   
    </table>

     <div class="block" style="text-align: right">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[15, 20, 30, 40]"
        :page-size="pageCount"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount">
      </el-pagination>
    </div>
    
    <div class="loading-content" v-show="loading">
          <img src="../assets/loading.gif" alt="">
    </div>

      <!-- 右键菜单 -->
    <ul class="context-menu" v-if="conMenuShow" :style="{left:conMenuLeft+'px',top:conMenuTop+'px'}">  
      <li @click="rightDetail()">查看详情</li>  
    </ul> 

  </div>
</template>
<script>

export default {
  data() {
      return {
        winHeight:800,
        winWidth:100,
        showDynasty:false,
        isUP:false,
        personName: "",
        isShowSearchResult: false,
        showSearchKeyword:'',
        dynasty: "", //朝代
        checkAll: false,
        checkedCities:'',
        isIndeterminate: true,
        tableData:[],
        pageCount:15,
        prePageCount:15,
        currentPage:1,
        preCurPage:1,
        totalCount:0,
        type:1,//1-人物2-事件3-地区4-朝代5-方位6-分类属性
        dynastyArr:[],
        checkedNum:0,
        loading:true,
        conMenuShow:false,
        conMenuLeft:0,
        conMenuTop:0,
        menuListDisable:{
           copy:true,
           collect:true,
           read:false,
           download:false
         },
       aimNode:null,
      }
    },
    mounted(){
      // ShowDevTools();
      this.setWindow();
        window.onresize = ()=>{
           this.setWindow();
        }

      this.type=1;
      this.pageCount=15,
      this.showEventList();
    },
    watch:{
      'setWindow':function() {
            this.setWindow();
       },
      'checkedNum':function(newValue,oldValue){
        if (newValue==this.dynastyArr.length) {
          this.checkAll = true;
        }else{
          this.checkAll = false;
        }
      },
    },
    methods: {
       setWindow() {
          this.winWidth = window.innerWidth;
          this.winHeight = window.innerHeight;
        },
      //请求朝代列表
      showDynastyClick(){
        this.showDynasty=!this.showDynasty;
        this.checkAll = false;
        this.prePageCount = this.pageCount;
        this.preCurPage = this.currentPage;
        
        if(this.showDynasty){  
          var data = {
              keyword: this.personName,
              ps: 500, //每页条数
              cp: 1, //当前页
              type: 4,
              starttime: "",
              endtime: "",
            }


           //下面是配合winform异步获取数据
          ApiTransfer('get', '/explicitword/list', JSON.stringify(data), (winResult) => {
            winResult = eval('(' + winResult + ')');

            if (winResult.Success) {
                  var arr = [];
                  winResult.Data.ItemList.forEach((item, index) => {
                    if (item.Title != null) {
                      if (arr.indexOf(item.Title) == -1) {
                        //默认active为1;没有样式；2为有样式
                        item = Object.assign({}, item, { "isChecked": false });
                        arr.push(item);
                      }
                    }
                  })

                  arr.forEach((item,index)=>{
                     if(this.checkedCities.split(',').indexOf(item.LocalId) !== -1) {
                        item.isChecked = true;
                     }
                  })

                  this.dynastyArr = arr;
                  localStorage.setItem('firstName', this.dynastyArr[0].Title);
               }
          });
        }
      },
      //搜索
      handleIconClick() { 
        this.type=1;//获取事件列表
        // this.pageCount=15,
        // this.checkedCities = '',
        if(this.personName == '') {
           this.isShowSearchResult = false;
           this.showSearchKeyword = '';
           this.showEventList();
           return;
        }

        this.isShowSearchResult = true;
        this.showSearchKeyword = this.personName;
        this.showEventList();
      },
      //重置搜索框
      resetSearchKey() {
          this.personName = '';
          this.currentPage = 1;
          this.showEventList();

          this.isShowSearchResult = false;
          this.showSearchKeyword = '';
      },
      //全选朝代
      allChange() {
        this.checkAll = !this.checkAll;
        if (this.checkAll) {
          this.dynastyArr.forEach((item,index)=>{
            this.$set(item,'isChecked',true) 
          })
        }else{
          this.dynastyArr.forEach((item,index)=>{
            this.$set(item,'isChecked',false) 
          })
        }
      },
      //选择朝代
      clickThis(id,index,isChecked){
        this.$set(this.dynastyArr[index],'isChecked',!isChecked)
        if (!isChecked) {
          this.checkedNum ++ ;
        }else{
          this.checkedNum -- ;
        }
      },
      //仅筛选此项
      selectOnly(createId,index){
        this.dynastyArr.forEach((item,index)=>{
          item.isChecked = false;
        })
        this.$set(this.dynastyArr[index],'isChecked',true);

        this.checkedCities=this.dynastyArr[index].LocalId;

        console.log(this.checkedCities)
        this.checkedNum = 1;
        this.showDynasty = false;

        this.type = 1;
        // this.pageCount=15;
        this.showEventList();

      },
      //升序降序
      ascendingOrder(){
        this.isUP =!this.isUP;
        this.tableData = this.tableData.reverse();
      },
      //提交朝代 请求table列表
      submitDynasty(item){
        this.showDynasty=false;
        this.checkedCities="";
        this.dynastyArr.forEach((item)=>{
          if(item.isChecked){
            this.checkedCities=this.checkedCities+item.LocalId+","
          }
        })
        this.type=1;
        // this.pageCount=15;
        this.showEventList()
      
      },
      showEventList(){
        this.loading=true;

        if(env=="dev"){
            this.$http.get("/explicitword/list",{
              params:{
                  keyword:this.personName,
                  ps:this.pageCount,//每页条数
                  cp:this.currentPage,//当前页
                  type:this.type,
                  starttime:"",
                  endtime:"",
                  dynastyids:this.checkedCities
              }
            })
            .then((res)=>{
              this.loading=false;
              switch(this.type){
                case 1:
 
                  this.tableData=res.data.Data.ItemList;//得到table列表
                  this.totalCount=res.data.Data.RecordCount;
                  break;
                case 4:
                  var arr=[];
                  res.data.Data.ItemList.forEach((item,index)=>{
                    if(item.Title!=null){
                      if(arr.indexOf(item.Title)==-1){
                        //默认active为1;没有样式；2为有样式
                        item = Object.assign({},item,{"isChecked":false});
                        arr.push(item);
                      }
                    }
                  })
                  this.dynastyArr=arr;

                  break;
              }
            })
            .catch((err)=>{
              console.log(err)
            })
        }else if(env=="prod"){
          var data={
              keyword:this.personName,
              ps:this.pageCount,//每页条数
              cp:this.currentPage,//当前页
              type:this.type,
              starttime:"",
              endtime:"",
              dynastyids:this.checkedCities
            }

          // setTimeout(()=>{
          //     var winResult = ApiTransfer('get','/explicitword/list',conbineData(data));
          //     winResult=eval('('+winResult+')');
          //     this.loading=false;
          //     if(winResult.Success){
          //         switch(this.type){
          //             case 1:
          //                 this.tableData=winResult.Data.ItemList;//得到table列表
          //                 this.totalCount=winResult.Data.RecordCount;
          //                 break;
          //             case 4:
          //                 var arr=[];
          //                 winResult.Data.ItemList.forEach((item,index)=>{
          //                   if(item.Title!=null){
          //                     if(arr.indexOf(item.Title)==-1){
          //                       //默认active为1;没有样式；2为有样式
          //                       item = Object.assign({},item,{"isChecked":false});
          //                       arr.push(item);
          //                     }
          //                   }
          //                 })
          //             this.dynastyArr=arr;
          //             break;
          //         }
          //     }
          // },500)


          //下面是配合winform异步获取数据
          ApiTransfer('get','/explicitword/list',JSON.stringify(data),(winResult)=>{
              winResult=eval('('+winResult+')');
              this.loading=false;
              if(winResult.Success){
                  console.log(winResult)
                  switch(this.type){
                      case 1:
                          this.showDynasty = false; 
                          this.tableData=winResult.Data.ItemList;//得到table列表
                          this.totalCount=winResult.Data.RecordCount;

                          break;
                      case 4:
                          var arr=[];
                          winResult.Data.ItemList.forEach((item,index)=>{
                            if(item.Title!=null){
                              if(arr.indexOf(item.Title)==-1){
                                //默认active为1;没有样式；2为有样式
                                item = Object.assign({},item,{"isChecked":false});
                                arr.push(item);
                              }
                            }
                          })
                      this.dynastyArr=arr;
                      this.type = 1;
                      this.pageCount = this.prePageCount;
                      this.currentPage = this.preCurPage;
                      break;
                  }
              }else {
                ShowMessage(winResult.Data)
              }
          });


       }
      },
      //切换每页的条数
       handleSizeChange(val) {
        this.pageCount=val;
        this.currentPage = 1;
        this.showEventList()
      },
       //点击页数，请求第几页
      handleCurrentChange(val) {
        this.currentPage = val;
        this.showEventList()
      },
      //跳转到人物 详情
      goPersonDetail(id,title){
       if(env=="dev"){
            this.$router.push({ path: '/personDetail', query: { personId:id }})
          }else if(env=="prod"){
            SaveArgument('personId='+id.toString())
            loadForm('/index.html#/personDetail','详情',title,true)
          }
      },
      //右键功能
      openContextMenu(e){
        if(this.winWidth-e.pageX<120){
            this.conMenuLeft=this.winWidth-120;
         }else{
            this.conMenuLeft=e.pageX;
         }

        this.conMenuTop = e.pageY;
        if (e.target.nodeName == 'TD') {  //表格前两列
          this.conMenuShow=true;
          this.aimNode = e.target.parentNode;
        }else if (e.target.parentNode.nodeName== 'TD') {  //表格最后一列
          this.conMenuShow=true;
          this.aimNode = e.target.parentNode.parentNode
        }else{
          this.conMenuShow=false;
        }
        
      },
       //右键去详情页
      rightDetail(){
        if(this.conMenuShow){
          var thisId =this.aimNode.getAttribute('thisId');
          var thisTitle = this.aimNode.getAttribute('thisTitle');
          this.goPersonDetail(thisId,thisTitle)
        }
      },
    }
}
</script>
<style lang="less">
  .personList{
    padding:1% 4%;
    box-sizing: border-box;
    overflow-y: scroll;
    min-width: 630px;

    .el-input{
      margin-bottom: 15px;
    }
    table{
      border-left: 1px solid #ddd;
      border-top: 1px solid #ddd;
      margin-bottom: 20px;
    }
    th,td{
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      padding:10px 20px;
    }
    th{
      background: #f2f2f2;
      text-align: left;
      line-height: 30px;
    }
    td div{
      line-height: 20px;
      max-height: 40px;
      overflow:hidden;
    }
     tbody tr{
      background: #fff;
      cursor: pointer;
    }
 
    tbody tr:hover{
      background:#e4ebf5;
    }
     .line-2{
      width: 20%;
      position: relative;
      line-height: 30px;
      cursor: pointer;
    }

     .line-2:hover{
      background-color: #e5ebf5;
    }

    .book-cont-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        width: 100%;
    }

    .book-cont-head span {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 40%
     }

    .order,.order1{
      display: inline-block;
      width: 32px;
      height: 13px;
      background: url("../../static/images/der2.png") no-repeat; 
      background-position: 5px 0; 
      cursor: pointer;   
    }

    .order{
      background: url("../../static/images/der.png") no-repeat;
       background-position: 5px 0; 
    }

     .typeIcon{
         float: right;
        margin-right: -10px;
        display: inline-block;
        width:24px;
        height: 24px;
        background-color: #fff;
        background: url("../../static/images/selected.png") no-repeat;     
        background-position: 4px 5px;
        cursor:pointer;
        // margin-top: 5px;
    }

    .line2BG{
      background-color:#e4ebf5;
      cursor: pointer;
    }
    
     .checkBox{
      width:192%;
      position: absolute;
      top:42px;
      left:-101%;
      background: #f2f2f2;
      padding:10px 0 10px 10px;
      border:1px solid #e2e2e2;
      z-index: 9898;
    }
    .options{
      max-height: 220px;
      overflow: hidden;
      overflow-y: scroll;
      border:1px solid #e2e2e2;
    }
    .checkBox p{
      line-height: 30px;
      padding: 0 6px;
    }

    .confirmOK{
      padding-top: 10px;
      span{
      display: inline-block;
      width:45%;
      border:1px solid #e4e4e4;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      background-color: #fff;
    }
  }

  .check-box{
      width: 95%;
      margin:0;
      background:white;
      padding:6px;
      overflow:hidden;
      position: relative;
      height:18px;

      label{
        overflow:hidden;
        display: inline-block;
        position: relative;
        padding-left: 30px;
        height: 100%;
        width:60%;
        line-height: 20px;
      }
      .choiceOne{
        cursor: pointer;
        position: absolute;
        right:0;
        margin-top: -7px;
        display: inline-block;
        height: 24px;
        opacity: 0;
        background-color:#c0ccde;
         padding: 5px 12px;
        font-weight: 400;
        line-height: 27px;
      }
    }

    .check-input{
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border:1px solid #bfcbd9;
      position: absolute;
      left: 5px;
      background-color: #fff;

    }
    .check-label{
      font-weight: 400;
    }
   
  .check-box:hover{
    background-color: #e4ebf5;
       .choiceOne{
        opacity: 1;
      }
    }
   
    .selectThis{
      background-color: #bfcbd9
    }
    .not-selected{
      background-color: #fff;
    }

    .selectThis:after {
        content: '';
        display: table;
        width: 4px;
        height: 8px;
        border: 2px solid #fff;
        border-top: none;
        border-left: 0; 
        -ms-transform: rotate(45deg) scale(1);
        transform: rotate(45deg) scale(1);
        transition: all .2s ease-in-out;
        margin-left: 5px;
        margin-top: 1px;
      }

  }

</style>

