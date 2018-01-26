<template>
	<div class="mark"
	:style="{height:winHeight+'px'}"
	@contextmenu.prevent="openContextmenu($event)" 
	@click="conMenuShow=false"
	>
		<h3>我的书签</h3>
		<table cellspacing="0" style="width: 100%;margin-bottom: 15px;">
			<thead>
				<tr style="background-color:#eef1f6;">
					<th style="width:30%;border-right:1px solid #ddd;">章节</th>
					<th style="width:50%;border-right:1px solid #ddd;">摘要</th>
					<th style="width:20%;border-right:1px solid #ddd;"> 时间&nbsp;&nbsp;
						<img  v-if="!isUP" src="../../../static/images/der.png"
						 @click="changeOrder()">
						<img  v-else src="../../../static/images/der2.png"
						 @click="changeOrder()">
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="dataList.length!=0" 
				v-for="(item,index) in dataList"
				:resourceId="(item.ResourceId)"
				:bookmarkId="(item.Id)"
				:IsFavorite="(item.IsFavorite)"
				@click="download(item)"
				
				>   
				    <td @click.stop="" >
				       <div class="td-div1" class="has-checkbox">
				         <input type="checkbox" style="margin-right:10px;margin-left:10px" :id="'label'+index" v-model="item.isChecked">
				         <div style="width:90%">
				         	<label :for="'label'+index">{{item.Title}}</label>
				         </div>
				       </div>
				    </td>
					<td><div class="td-div2">{{item.Abstracts}}</div></td>
					<td><div class="td-div3">{{item.CreateTime}}</div></td>
				</tr>
				<tr v-if="dataList.length==0">
					<td colspan="3" class="no-content">暂无书签</td>
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
	        layout="total, sizes, prev, pager, next, jumper"
	        :total="totalCount">
	      </el-pagination>
	    </div>

        <div class="loading-content" style="background:black" v-show="downloadLoading">
             
        </div>

        <div class="loading-content load-other" v-show="downloadLoading" v-cloak>
             <p>正在为您下载 {{downLoadFileName}}，请稍候...{{downLoadPercent}} %</p>
        </div>

         <!-- 右键菜单 -->
	    <ul class="context-menu" v-if="conMenuShow" :style="{left:conMenuLeft+'px',top:conMenuTop+'px'}">  
	      <li @click="deleteFavorite()" :class="contextObj.del?'':'menu-disabled'">删除</li>  
	      <li @click="collected()"> {{contextObj.collect?'取消收藏':'收藏'}} </li>  
	      <!-- <li @click="reading()" :class="contextObj.reading?'':'menu-disabled'">{{showWord}}</li>   -->
	    </ul> 



	</div>
</template>

<script type="text/javascript">
	export default{
		data(){
			return{
				winHeight:'',
   				winWidth:'',
				dataList:[],
				loading:true,
				pageCount:15,
		        currentPage:1,
		        totalCount:0,
		        isUP:false,
	            aimNode:null,
	            resourceId:0,   //右击存的该章节id
		        bookmarkId:0,   //右击时存的id,
		        conMenuShow:false,
		        conMenuLeft:0,
		        conMenuTop:0,
		        contextObj:{
		        	del:true,
		        	collect:false,
		        	reading:true,
		        },
		        showWord:"阅读",
		        downLoadFileName:'',
		        downLoadPercent:0,
		        downloadLoading:false,
		        isChecked:false,

		        flag:false,
		        checkTimer:null
			}
		},
		mounted(){
			// ShowDevTools();
			this.setWindow();
			window.onresize = ()=>{
		       this.setWindow();
	        }
	        //获取初始数据
			this.getInitialData(); //


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
		methods:{
			 setWindow() {
		        this.winWidth = window.innerWidth;
		        this.winHeight = window.innerHeight;
		      },
		      //切换每页的条数
		       handleSizeChange(val) {
		        this.pageCount=val;
		        this.isChecked = false;
		        this.getInitialData()
		      },
		       //点击页数，请求第几页
		      handleCurrentChange(val) {
		        this.currentPage=val;
		        this.isChecked = false;
		        this.getInitialData()
		      },
		      //时间升序降序
		      changeOrder(){
		      	this.isUP=!this.isUP;
		      	this.dataList = this.dataList.reverse();
		      },
		      //全选
	         checkAll() {
	          this.dataList.forEach((item,index)=>{
	              item['isChecked'] = this.isChecked ? true : false;
	              this.$set(this.dataList,index,item);
	            }) 
	         },
		     //获取数据
		     getInitialData(){
		      	this.loading=true;
		      	if(env=="dev"){
			      	this.$http("/bookmark/user_bookmark_list",{
						params:{
							userid:localStorage.getItem('userId'),
							ps:this.pageCount,//每页条数
		              		cp:this.currentPage,//当前页
						}
					})
					.then((res)=>{
						this.loading=false;
						this.dataList=res.data.Data.ItemList
						this.totalCount=res.data.Data.RecordCount
					})
					.catch((err)=>{
						console.log(err)
					})
				}else if(env=="prod"){
		      		var data={
						userid:localStorage.getItem('userId'),
						// userid:100,
						ps:this.pageCount,//每页条数
	              		cp:this.currentPage,//当前页
					}

					// setTimeout(()=>{
					// 	var winResult = ApiTransfer('get','/bookmark/user_bookmark_list',conbineData(data));
			  //           winResult=JSON.parse(winResult)
			  //           this.loading=false;
			  //           if(winResult.Success){
			  //           	 this.dataList=winResult.Data.ItemList
					// 		this.totalCount=winResult.Data.RecordCount
			  //           }
					// },500)

                   
                   //下面是配合winform异步获取数据
                    ApiTransfer('get','/bookmark/user_bookmark_list',JSON.stringify(data),(winResult)=>{
                            winResult=JSON.parse(winResult)
				            this.loading=false;
				            if(winResult.Success){
				            	 this.dataList=winResult.Data.ItemList;
								 this.totalCount=winResult.Data.RecordCount;
                                 if(this.dataList.length == 0){
								    this.flag = true;
								    this.dataList = [];
								    return;
							     }

							      this.flag = false;
                                  var listIds = [];
								  this.dataList.forEach((item,index)=>{
			                         item['hasDown'] = false;
			                         item['isChecked'] = false;
			                         listIds.push(item.ResourceId);
			                      })


								//向后台发送缓存验证,获取已经下载过的文件

			                      //获取已下载的数据
			                      // var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
			                      //     hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
			                      // if(hasDownLoadedContent.length == 0) return; 

			                      // hasDownLoadedContent.forEach((getItem,getIndex)=>{
			                      //    this.dataList.forEach((bookItem,bookIndex)=>{
			                      //        if(getItem.ResourceId == bookItem.ObjectId) {
			                      //            bookItem['hasDown'] = true;
			                      //            bookItem['nativeUrl'] = getItem.FilePath;
			                      //        }
			                      //    })
			                      // })


			                      //异步获取下载
		                          GetDownLoadedResources(listIds.join(','),localStorage.getItem('userId'),(hasDownLoadedContent)=>{
		                              hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
		                              if(hasDownLoadedContent.length == 0) return; 

		                              hasDownLoadedContent.forEach((getItem,getIndex)=>{
				                         this.dataList.forEach((bookItem,bookIndex)=>{
				                             if(getItem.ResourceId == bookItem.ResourceId) {
				                                 bookItem['hasDown'] = true;
				                                 bookItem['nativeUrl'] = getItem.FilePath;
				                                
				                             }
				                         })
				                      })
		                          })
				            }
                      });

		      	}
		      },
		     //验证是否下载过该章节/地图
		    isFileDownLoad(item,downloadFn) {
		        //异步获取下载,根据文件id
		        
		        GetDownLoadedResources(item.ResourceId+'',localStorage.getItem('userId'),(hasDownLoadedContent) => {
		          hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
		          if (hasDownLoadedContent.length == 0) {
		            //需要重新下载
		            downloadFn();
		          }else {
		             item.nativeUrl = hasDownLoadedContent[0].FilePath;

                     this.toBookView(item);
		          } 
		        })
		    }, 
		     //下载或跳转文章阅读
		     download(item){
		        this.isFileDownLoad(item,()=>{
                    this.downLoadPercent = 0;
		      		this.downloadLoading = true;
		      		this.downLoadFileName = item.Title;

	                var data = {
	                	fileid:item.FileId,
	                	isPC:true,
	                	userid:localStorage.getItem('userId'),
	                    resourceid:item.ResourceId,
	                    source:null,
	                    title:item.Title,
	                    type:2
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
		        })	

	      },
	      toBookView(item){
	      	console.log(item)
	      	 var data = {
                 resourceid:item.ResourceId,
                 userid:localStorage.getItem('userId')
	      	 }
	      	 
      	     if(env=="dev"){
		       location.href  = './static/reader.html?sectionid='+this.objectId;
		     }else if(env=="prod"){

		     	ApiTransfer('get','/resource/detail',JSON.stringify(data),(winResult)=>{
	                winResult=JSON.parse(winResult)
	                if(winResult.Success){
	                   SaveArgument('sectionId='+item.ResourceId+'&secret='+winResult.Data.Secret+'&bookSrc='+item.nativeUrl+'&parentId='+winResult.Data.ParentId);

	                   localStorage.setItem('notePosition',JSON.stringify(item));
           	           loadForm('/static/reader.html','图书阅读',winResult.Data.Title,true);
	                }else{  //发送验证码
	                   ShowMessage(winResult.Description)
	                }
	             });
		       
		     }
	      },
		      //右键功能
		     openContextmenu(e){
		      	 if(this.winWidth-e.pageX<120){
		            this.conMenuLeft=this.winWidth-120;
		         }else{
		            this.conMenuLeft=e.pageX;
		         }
		        this.conMenuTop = e.pageY;

		        if(e.target.parentNode.nodeName=="TD"){
		        	this.conMenuShow=true;
		        	this.bookmarkId =e.target.parentNode.parentNode.getAttribute("bookmarkId")
		        	this.resourceId =e.target.parentNode.parentNode.getAttribute("resourceId")
		        	this.contextObj.collect =e.target.parentNode.parentNode.getAttribute("IsFavorite")

		        }else if(e.target.nodeName=="TD"){
		        	this.conMenuShow=true;
		        	this.bookmarkId =e.target.parentNode.getAttribute("bookmarkId")
	         		this.resourceId =e.target.parentNode.getAttribute("resourceId")
	         		this.contextObj.collect =e.target.parentNode.getAttribute("IsFavorite")
		        }else{
		        	this.conMenuShow=false;
		        }
	         	
		      },
		      //删除
		      deleteFavorite(){
		        	if(env=="dev"){
		        		this.$http.post("/bookmark/delete",{
							bookmarkids:this.bookmarkId,
						})
						.then((res)=>{
							this.conMenuShow=false;
							if(res.data.Success){
								this.$message({
						            type: 'success',
						            message: '删除成功!'
						          })
								this.getInitialData()
							}
						})
						.catch((err)=>{
							console.log(err)
						})
		        	}else if(env=="prod"){
		        		var data={
			            	bookmarkids:this.bookmarkId,
			            }
                        
                        //下面是配合winform异步获取数据
	                    ApiTransfer('post','/bookmark/delete',JSON.stringify(data),(winResult)=>{
	                            winResult=JSON.parse(winResult)
					            if(winResult.Success){
									 this.getInitialData();
									 this.$message({
							            type: 'success',
							            message: '删除成功!'
							         });

							         this.isChecked = false;
								}
	                    });
		         	}	
		      },
		      //删除选中、
	         delHasChecked() {
	           var delObjectids = [];
	           var delStr = '';
	           this.dataList.forEach((item,index)=>{
	              if(item.isChecked){
	                delObjectids.push(item.Id);
	              }
	           })

	           if(delObjectids.length == 0) {
	           	  this.$message({
                      type: 'error',
                      message: '请选择要删除的书签!'
                    });
	           	  return
	           }

	           delStr = delObjectids.join(',');

	          // 对象编号，对象类型，创建时间|对象编号，对象类型，创建时间
	          if(env == 'prod') {
	              ApiTransfer('post','/bookmark/delete',JSON.stringify({
	                    userid:localStorage.getItem('userId'),
	                    bookmarkids:delStr,
	                  }),(winResult)=>{
	                      winResult=JSON.parse(winResult)
	                 if(winResult.Success){
	                   this.$message({
	                          type: 'success',
	                          message: '删除成功!'
	                        });
	                   this.getInitialData();
	                   this.isChecked = false;
	                  }else {
	                    ShowMessage(winResult.Description)
	                  }
	              });
	           }
	         },
		      //收藏取消收藏
		      collected(){
		      	this.conMenuShow=false;
		      	if(env=='dev'){
		      		this.$http.post("/favorite/createorcancel",{
						userid:localStorage.getItem('userId'),
						objectid:this.resourceId,
						objecttype:1,
					})
					.then((res)=>{
						this.conMenuShow=false;
						if(res.data.Success){
							this.$message({
					          showClose: true,
					          message:res.data.Description
					        });
							this.getInitialData();
						}
					})
					.catch((err)=>{
						console.log(err)
					})
		      	}else if(env=="prod"){
		      		 var data={
		             	userid:localStorage.getItem('userId'),
						objectid:this.resourceId,
						objecttype:1,
		            }
		   //          var winResult = ApiTransfer('post','/favorite/createorcancel',conbineData(data));
		   //          winResult=JSON.parse(winResult)
		   //          this.conMenuShow=false;
					// if(winResult.Success){
					// 	this.$message({
				 //          showClose: true,
				 //          message:winResult.Description
				 //        });
					// 	this.getInitialData();
					// }


					//下面是配合winform异步获取数据
                    ApiTransfer('post','/favorite/createorcancel',JSON.stringify(data),(winResult)=>{
                        winResult=JSON.parse(winResult)
			            this.conMenuShow=false;
						if(winResult.Success){
							this.$message({
							  type:'success',	
					          showClose: true,
					          message:winResult.Description
					        });
							this.getInitialData();
						}
                    });

		      	}
		      },
		      //阅读
		      reading(index){
		      	this.conMenuShow=false;

		      },
			},
		  	watch:{
	       		  'setWindow':function(newValue) {
		                this.setWindow();
				   },
			}
	}
</script>

<style lang="less">
	.mark{
		/* width:84%; */
		padding: 0 4% 30px 4%;
		overflow-y: visible;
		min-width: 630px;

		h3{
			overflow:hidden;
			width: 100%;
			line-height: 50px;
			text-align: center;
		}

		table{
			border:1px solid #ddd;
			min-width: 460px;
                // overflow:hidden;
		}

		th{
			border-bottom:1px solid  #ddd;
			padding:10px 20px;
			background:#f2f2f2;
		}

		td{
			padding:10px 15px;
			overflow:hidden;
			border-right:1px solid #ddd;
			cursor: pointer;
			border-top:1px solid #ddd;
			text-align: center;
		}

		td div{
			 max-height: 40px;
		     line-height: 20px;
		     overflow:hidden;
		}

		.has-checkbox {
             display: flex;
             justify-content: space-between;
             align-items: center;
		}


		 thead tr{
	      border-right:1px solid #ddd;
	    }
	
		 tbody tr:hover{
	       background:#e4ebf5
	    }

	    .load-other {
		    opacity: 1;
		    background: transparent;
		    color:white;
		    font-size: 18px;
		}

	    .no-content{
		    text-align: center;
		    line-height: 60px;
		    background:#fff
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
	    justify-content: flex-start;
	    align-items: center;
	    width: 15%;
	    margin-left: 16px;
	    input {
	      margin-left: 10px;
	      margin-right: 10px;
	      /* background-color:white; */
	    }
	  }
	}
</style>