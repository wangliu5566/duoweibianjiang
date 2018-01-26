<template>
    <div :style="{height:winHeight +'px',minWidth:'630px'}" class="booklist" id="booklist" ref="booklist" >
        <el-row :gutter="0" type="flex" justify="center">
            <el-col :xs="1" :sm="1" :md="1" :lg="1" class="book-section">
            </el-col>
            <el-col :xs="22" :sm="22" :md="22" :lg="22" class="book-section">
                <div class="book-content">
                    <div class="book-cont-head">
                        <!-- <el-button type="primary" @click="toSection">章节列表</el-button> -->
                        <el-radio-group v-model="radio99" >
                            <el-radio-button label="图书列表"></el-radio-button>
                            <el-radio-button label="章节列表"></el-radio-button>
                        </el-radio-group>
                        <span style="position:relative">
                            <el-input
                                placeholder="请输入搜索关键字"
                                icon="search"
                                v-model="input"
                                :on-icon-click="handleIconClick"
                                @keyup.enter.native="handleIconClick"
                                >
                            </el-input>
                            <i class="el-icon-close close-search" @click="resetSearchKey"></i>
                        </span>
                    </div>


                    <p style="margin-bottom:10px" v-show="isShowSearchResult">
                        与“<span class="search-text-color">{{showSearchKeyword}}</span>”相关检索结果：共<span class="search-text-color">{{totalData}}</span>条
                    </p>

                    <table cellspacing="0" style="width: 100%;" @mousemove.prevent="">
                        <thead>
                            <tr>
                                <th style="width: 20%;">书名</th>
                                <th class="line-2">作者 </th>
                                <th style="width: 60%;">简介</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in bookListData" @click="toBookDetail(item.Id,item.Title)" :data-id="item.Id" :data-title="item.Title">
                                <td>{{item.Title}}</td>
                                <td>{{item.Author?item.Author:'暂无作者信息'}}</td>
                                <td>
                                    <div>
                                       {{item.Description?''+item.Description:'暂无简介'}}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align:center" v-show="bookListData.length == 0">
                                    暂无图书数据
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="block">
                         <el-pagination
                          @size-change="handleSizeChange"
                          @current-change="handleCurrentChange"
                          :current-page="currentPage"
                          :page-sizes="[15, 20, 30, 40]"
                          :page-size="pageSize"
                          layout="total, sizes, prev, pager, next, jumper"
                          :total="totalData">
                        </el-pagination>
                    </div>
                </div>
            </el-col>
            <el-col :xs="1" :sm="1" :md="1" :lg="1" class="book-section">
            </el-col>
        </el-row>
        
        <div class="loading-content" v-show="loading">
            <img src="../../assets/loading.gif" alt="">
        </div>

        <ul class="context-menu" :style="{left:conMenuLeft+'px',top:conMenuTop + 'px'}" v-show="conMenuShow">
            <li  ref="myContextMenuLi">查看详情</li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
            return {
                input: '',
                showSearchKeyword:'',
                bookListData: [],
                winWidth: window.innerWidth,
                winHeight: window.innerHeight,
                loading: true,
                currentPage: 1,
                totalData:400,
                pageSize:15,
                conMenuLeft:100,
                conMenuTop:100,
                conMenuShow:false,
                isShowSearchResult:false,
                radio99:'图书列表'
            }
        },

        methods: {
            //获取表格数据，包括搜索结果
            getTableData(keyword = '', ps = 20, cp = 1) {
                this.loading = true;
                if(env == 'dev') {
                    this.$http.get("/resource/list", {
                        params: {
                            keyword: keyword,
                            ps: ps, //每页条数
                            cp: cp, //当前页
                            type: 1
                        }
                    })
                    .then((res) => {
                        this.loading = false;
                        this.bookListData = res.data.Data.ItemList;
                        this.totalData = res.data.Data.RecordCount;
                    })
                    .catch((err) => {
                        this.loading = false;
                    })

                }else if(env == 'prod') {
                    var data = {
                            keyword: keyword,
                            ps: ps, //每页条数
                            cp: cp, //当前页
                            type: 1
                        }

                    ApiTransfer('get','/resource/list',JSON.stringify(data),(winResult)=>{
                            this.loading = false;
                            winResult=JSON.parse(winResult)
                            if(winResult.Success){
                              this.bookListData = winResult.Data.ItemList;
                              this.totalData = winResult.Data.RecordCount;
                            }
                    });      


                    //下面是配合winform异步获取数据
                    // ApiTransfer('get','/resource/list',conbineData(data),(winResult)=>{
                    //         this.loading = false;
                    //         winResult=JSON.parse(winResult)
                    //         if(winResult.Success){
                    //           this.bookListData = winResult.Data.ItemList;
                    //           this.totalData = winResult.Data.RecordCount;
                    //         }
                    //   });    

                   // setTimeout(()=>{
                   //    var winResult = ApiTransfer('get','/resource/list',conbineData(data));
                   //        this.loading = false;
                   //      winResult=JSON.parse(winResult)
                   //      if(winResult.Success){
                   //        this.bookListData = winResult.Data.ItemList;
                   //        this.totalData = winResult.Data.RecordCount;
                   //      }
                   //   }, 500)
                     
                 
                  }
               
            },

            // 分页
            handleSizeChange(val) {
               this.pageSize = val;
               this.getTableData(this.input, this.pageSize, this.currentPage)
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getTableData(this.input, this.pageSize, this.currentPage)
            },
            

            setHeight() {
                this.winHeight = window.innerHeight;
                this.winWidth = window.innerWidth;
            },
            handleIconClick() {
                if(this.input == '') {
                   this.isShowSearchResult = false;
                   this.showSearchKeyword = '';
                   this.getTableData(this.input, this.pageSize, this.currentPage);
                   return;
                }

                this.getTableData(this.input, this.pageSize, this.currentPage);
                this.isShowSearchResult = true;
                this.showSearchKeyword = this.input;
            },
            //重置搜索框
            resetSearchKey() {
                this.input = '';
                this.isShowSearchResult = false;
                this.showSearchKeyword = '';
                this.getTableData(this.input, this.pageSize, 1);
            },
            toSection() {
                SaveArgument('');
                this.$router.push('/sectionlist');
            },
            toBookDetail(bookid,title) {
                if(env == 'dev') {
                   this.$router.push({path:"/bookDetail",query:{bookId:bookid}})
                }else if(env == 'prod') {
                    SaveArgument('bookId='+bookid)
                    loadForm('/index.html#/bookDetail','详情',title,true)
                }
            }
        },
        mounted() {
             // ShowDevTools();
            //用于设置navmenu的高度，解决element-ui不能设置高度的bug
            this.setHeight();

            //设置窗口名称
            SetTabTitle('图书列表',GetFormId());

            this.getTableData(this.input, this.pageSize, this.currentPage);

            // setInterval(()=>{
            //     this.getTableData(this.input, this.pageSize, this.currentPage);
            // }, 3000)

            var _this = this;
            var booklistCont = document.getElementById('booklist');

            //右键操作
            document.getElementById('booklist').oncontextmenu = function(e) {
                
                e.preventDefault();
                _this.conMenuLeft = e.pageX + booklistCont.scrollLeft;
                _this.conMenuTop = e.pageY + booklistCont.scrollTop;
                _this.conMenuShow = true;
                //检测点击区域是否可执行相关操作

                if(e.target.nodeName !== 'TD' && e.target.parentNode.parentNode.parentNode.nodeName !== 'TD' &&　e.target.parentNode.nodeName !== 'TD') {
                    _this.$refs.myContextMenuLi.className = 'menu-disabled';
                }else {
                    _this.$refs.myContextMenuLi.className = '';
                }
            }
            

            //点击右键菜单中的选项的操作
            document.getElementById('booklist').onclick = function(e) {
                _this.conMenuShow = false;
                if(e.target.nodeName == 'LI' && e.target.className =='') {
                   var bookid =  null;
                   var trNode = null;
                   var onclickNode = elementFromPoint1(_this.conMenuLeft - booklistCont.scrollLeft,_this.conMenuTop - booklistCont.scrollTop,booklistCont);

                   if(onclickNode.parentNode.nodeName == 'TR') {
                      trNode = onclickNode.parentNode;
                      bookid = trNode.getAttribute('data-id');
                   }else if(onclickNode.parentNode.parentNode.parentNode.parentNode.nodeName == 'TR') {
                      trNode = onclickNode.parentNode.parentNode.parentNode.parentNode;
                      bookid = trNode.getAttribute('data-id');
                   }else if(onclickNode.parentNode.parentNode.nodeName == 'TR') {
                      trNode = onclickNode.parentNode.parentNode;
                      bookid = trNode.getAttribute('data-id');
                   }
                   
                   if(bookid) {
                      _this.toBookDetail(bookid,trNode.getAttribute('data-title'));
                   }
                }
            }

            window.onresize = () => {
                this.setHeight();
            }

        },

        watch: {
            'winHeight': function() {
                this.setHeight();
            },
            'radio99':function() {
                this.toSection();
            }
        }
}
</script>
<style lang="css" scoped>
.booklist {
    width:100%;
    overflow-y: scroll;
    position: relative;
}

.book-section {
    height: 850px;
    box-sizing: border-box;
}

.book-content {
    width: 100%;
    height: 100%;
}

.book-cont-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    flex-wrap: nowrap;
    min-width: 452px;
    overflow:hidden;
}



/* @media screen and (max-width: 430px) {
   .book-cont-head {
        flex-direction: column;
        align-items: flex-start;
        height: 80px
    }
    .book-cont-head span {
        margin-top: 20px
    }

    .el-input {
        margin-left: 10px;
        margin-bottom: 15px
    }

}

@media screen and (max-width: 768px) {
    .el-radio-group {
        margin-left: 20px;
    }
    .el-input {
        margin-right: 20px
    }
} */
.book-cont-head span {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.book-cont-head button {
    margin: 0 10px
}

.book-content ul {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.booklist-item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    border: 1px solid #ddd;
    height: 100px;
    width: 98%;
    /*background: #eee;*/
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

.booklist-item-cont li:nth-child(3) {
    display: flex;
    justify-content: space-between;
    height: 32px;
    /*margin: 4px;*/
}

.booklist-item-cont li:nth-child(3) p {
    width: 100%;
    height: 100%;
}

table {
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
}

th,
td {
    box-sizing: border-box;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    /*font-size: 12px;*/
    height: 45px;
    text-align: center;
}


td {
    padding: 3px 10px;
    height: 60px !important;
    overflow: hidden;
}

td:nth-child(3n) {
    text-align: left;
    /*text-indent: 20px;*/
}

td:nth-child(3n) div {
    width: 100%;
    height: 36px;
    line-height: 18px;
    overflow: hidden;
}

th {
    background: #f2f2f2;
}

tbody tr {
    background: #fff;
    cursor: pointer;
}


tbody tr:hover {
    background: #e4ebf5;
}

.line-2 {
    width: 20%;
    position: relative;
}

.el-pagination {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    margin: 20px 0;
}


</style>
