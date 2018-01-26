<template>
	<div class="downLoad"
	:style="{height: winHeight+'px',width: innerWidth*0.9 + 'px',margin:'0 auto'}"
	@contextmenu.prevent="openContextmenu($event)" 
	@click="closeContextAndFilter">
		<h3>下载管理</h3>

		<p class="p1">已下载 ({{totalCount}})</p>
		<p class="p1"><el-button @click="delAll" :disabled="flag" class="emputy">清空</el-button></p>
		
		<table cellspacing="0" style="width: 100%;margin-bottom: 15px;">
			<thead>
				<tr style="background-color:#ddd;">
					<th class="th1">类型&nbsp;&nbsp;
						<img src="../../../static/images/selected.png"
						@click.stop="showType1 = !showType1"
						>
						<ul class="showType" v-if="showType1">
							<li @click="selectedType(0)">全部</li>
							<li @click="selectedType(2)">图书</li>
							<li @click="selectedType(3)">地图</li>
						</ul>
					</th>
					<th style="width:30%;border-right:1px solid #ddd;">名称</th>
					<th style="width:35%;border-right:1px solid #ddd;">来源</th>
					<th style="width:20%;border-right:1px solid #ddd;">时间&nbsp;&nbsp;
						<img  v-if="!isUP" src="../../../static/images/der.png"
						@click="changeOrder()">
						<img  v-else src="../../../static/images/der2.png"
						@click="changeOrder()">
					</th>
				</tr>
			</thead>
			<tbody >
			<!-- :type="item.ObjectType==2?item.ExplicitWord.Type==1?2:4:''" -->
				<tr 
				v-if="dataList.length!=0" 
				v-for="item in dataList" 
				:key="item.DownLoadTime"
				:objectId="item.ResourceId"
				:objectType="item.Type"
				:createTime='item.DownLoadTime'
				:data-item="JSON.stringify(item)"
				@click="toView(item)"
				>   
				    <td @click.stop="" >
				    <div class="td-div1" class="has-checkbox">
				       <input type="checkbox" style="margin-right:10px;" :id="'label'+index" v-model="item.isChecked">
				       <label :for="'label'+index">{{item.Type==2?"图书":"地图"}}</label>
				      </div>
				    </td>
					<td><div>{{item.Title}}</div></td>
					<td><div>{{item.Source?item.Source:'暂无'}}</div></td>
					<td>{{item.DownLoadTime}}</td>
				</tr>
				<tr v-if="dataList.length==0">
					<td colspan="4" class="no-content">暂无下载列表</td>
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
		 <div class="block" style="text-align: right;margin-bottom: 50px;" v-if="totalCount > 10">
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
	      <li @click="delOne()" :class="contextObj.del?'':'menu-disabled'">删除</li>  
	      <!-- <li @click="collected()"> {{contextObj.collect?'取消收藏':'收藏'}} </li>   -->
	      <li @click="reading()" :class="contextObj.reading?'':'menu-disabled'">{{showWord}}</li>  
	      <!-- <li @click="goDetailPage()" :class="contextObj.detail?'':'menu-disabled'">查看详情</li>   -->
	    </ul> 
	</div>
</template>

<script>
	export default{
		data(){
			return{
				winWidth:window.innerWidth,
				winHeight:window.innerHeight,
				dataList:[],
				allDataList:[],//因为下载列表是从本地数据库取的，没有走接口，所以需要把所有数据缓存下来用做分页
				loading:false,
				pageCount:15,
		        currentPage:1,
		        totalCount:0,
		        isUP:false,
		        showType1:false,
		        dataType:0,    //全部1图书2人物3地图4事件
		        conMenuShow:false,
		        conMenuLeft:0,
		        conMenuTop:0,
		        contextObj:{
		        	del:true,
		        	collect:false,
		        	reading:true,
		        	detail:true
		        },
		        showWord:"阅读",
		        isChecked:false,
		        downloadLoading:false,
		        downLoadFileName:'',
		        downLoadPercent:0,

		        flag:false,
			}
		},
		mounted(){
			// ShowDevTools();
			this.setWindow();
	      	 window.onresize = ()=>{
	           this.setWindow();
	        }
			
			//获取初始数据
			this.getInitialData(this.dataType);

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
	      
	      closeContextAndFilter() {
            this.conMenuShow=false;
            this.showType1 = false;
	      },
	       //切换每页的条数
	      handleSizeChange(val) {
	        this.pageCount=val;
	        this.isChecked = false;
	        this.getInitialDataByPage(this.pageCount,this.currentPage,this.dataType);
	      },
	       //点击页数，请求第几页
	      handleCurrentChange(val) {
	        this.currentPage=val;
	        this.isChecked = false;
	        this.getInitialDataByPage(this.pageCount,this.currentPage,this.dataType);
	      },
	      //时间升序降序
	      changeOrder(){
	      	this.isUP=!this.isUP;
	      	this.dataList = this.dataList.reverse();
	      },
	      //筛选类型
	      selectedType(index){
	      	this.dataType=index;
	      	this.currentPage = 1;
	      	this.getInitialDataByPage(this.pageCount,this.currentPage,this.dataType);
	      	this.showType=false;
	      },
	      //全选
	      checkAll() {
	          this.dataList.forEach((item,index)=>{
	              item['isChecked'] = this.isChecked ? true : false;
	              this.$set(this.dataList,index,item);
	          }) 
	      },
	      //获取数据
	      getInitialData(type = 0){
	      	 this.dataList = [];
	      	 GetAllDownLoadedResources(localStorage.getItem('userId'),(hasDownLoadedContent)=>{
                   hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                   console.log('in')
                   if(hasDownLoadedContent.length == 0){
                   	  console.log('1')
	                  this.flag = true;
	                  this.totalCount = 0;
                      return;
		            }

		            console.log(2)

		            this.flag = false;

                    this.allDataList = hasDownLoadedContent.reverse().slice(0);
                    this.totalCount = this.allDataList.length;
   
	             this.dataList =  hasDownLoadedContent;

		         
	             this.dataList.forEach((item,index)=>{
		              item['isChecked'] = false;
		         })
                  
                 this.dataList = this.dataList.splice(0,this.pageCount);
	      	 });
	      },

	      //获取数据
	      getInitialDataByPage(ps,cp,type=0) {
             GetAllDownLoadedResources(localStorage.getItem('userId'),(hasDownLoadedContent)=>{
                hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                 if(hasDownLoadedContent.length == 0){
                    this.flag = true;
                    this.dataList = [];
                    return;
	             }

		        this.flag = false; 

                this.allDataList = hasDownLoadedContent.reverse().slice(0);
                this.dataList = [];
		      	  switch (type) {
	             	case 0:
	             	    this.totalCount = this.allDataList.length;
	             		this.dataList = this.allDataList.splice((cp-1)*ps, ps);

	             		break;
	             	case 2:
	             	    this.allDataList.forEach((item,index)=>{
	                        if(item.Type == 2) this.dataList.push(item);
	             	    })

	             	    this.totalCount = this.dataList.length;

	             	    this.dataList = this.dataList.splice((cp-1)*ps, ps);

	             		break;
	             	case 3:
	             	    this.allDataList.forEach((item,index)=>{
	                        if(item.Type == 3) this.dataList.push(item);
	             	    })

	             	    this.totalCount = this.dataList.length;

	             	    this.dataList = this.dataList.splice((cp-1)*ps, ps);
	             		break;		
	             	default:
	             		// statements_def
	             		break;
	             }
	      	 });

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
	        	console.log('in')
	        	this.conMenuShow=true;
	        	this.saveType = e.target.parentNode.parentNode.getAttribute("type") 
	         	this.objectType =e.target.parentNode.parentNode.getAttribute("objectType")
	         	this.objectId =e.target.parentNode.parentNode.getAttribute("objectId")
	         	this.objectData = e.target.parentNode.parentNode.getAttribute("data-item")
	         	this.contextObj.collect = !!e.target.parentNode.parentNode.getAttribute("IsFavorite");
	        }else if(e.target.nodeName=="TD"){
	        	this.conMenuShow=true;
	        	this.saveType = e.target.parentNode.getAttribute("type") 
	         	this.objectType =e.target.parentNode.getAttribute("objectType")
	         	this.objectId =e.target.parentNode.getAttribute("objectId")
	         	this.objectData = e.target.parentNode.getAttribute("data-item");
	         	this.contextObj.collect = !!e.target.parentNode.getAttribute("IsFavorite");
	        }else{
	        	this.conMenuShow=false;
	        }


	      },
	      //删除所有
	      delAll(){
	      	 this.$confirm('是否确定清空所有下载数据?', '提示', {
	          confirmButtonText: '确定',
	          cancelButtonText: '取消',
	          type: 'warning'
	        }).then(() => {
	          this.doDelete('',true);
	        }).catch(() => {
	                   
	        });
             
	      },
	      //删除单个
	       delOne() {
              this.doDelete(this.objectId,false);
	       },
	      //删除选中、
	        delHasChecked() {
	           var delObjectids = [];
	           var delStr = '';
	           this.dataList.forEach((item,index)=>{
	              if(item.isChecked){
	                delObjectids.push(item.ResourceId);
	              }
	           })

	           if(delObjectids.length == 0) {
	           	  this.$message({
                      type: 'error',
                      message: '请选择要删除的下载!'
                    });
	           	  return
	           } 
               
	           this.doDelete(delObjectids.join(','),false);
 
	        },

	        doDelete(ids,bool) {
              DeleteDownLoadResources(ids,localStorage.getItem('userId'),bool,(delResult)=>{
	           	  if(delResult == 'true') {
	           	  	 this.$message({
			            type: 'success',
			            message: '删除成功！'
			          });

                     this.getInitialDataByPage(this.pageCount,this.currentPage,this.dataType);
                     
                     if(bool) this.totalCount = 0;
                     this.isChecked = false;
	           	  }else {
	           	  	 this.$message({
			            type: 'error',
			            message: '删除失败！'
			          });
	           	  }
	           });
	        },
	      //收藏
	      collected(){
	      	if(env == 'dev') {
	      		this.$http.post("/favorite/createorcancel",{
						userid:localStorage.getItem('userId'),
						objectid:objectId,
						objecttype:objectType,
				})
				.then((res)=>{
					this.conMenuShow=false;
					if(res.data.Success){
						// this.getInitialData()
						this.$message({
				          showClose: true,
				          message: '收藏成功'
				        });
					}else{
						this.$message({
				          showClose: true,
				          message: '请稍后再试'
				        });
					}
				})
				.catch((err)=>{
					console.log(err)
				})
	      	}else if(env == 'prod') {

	      	}
	      },
	      //阅读
	      reading(){
	      	   var hasUserId = volidUserId();
	               if(!hasUserId) return;
               
	      	   var item = JSON.parse(this.objectData);

	      	   console.log(item)
               if(item.Type == 2) {
                  //此时是章节,需要单独去请求文件secret 和 parentid
                  if(env == 'dev') {
		               location.href  = './static/reader.html?sectionid='+sectionid;
		            }else if(env == 'prod') {
                       //请求密钥和parentid
	                   //  var resFromWinfGetSecret = ApiTransfer('get','/resource/detail','resourceid='+item.ResourceId+'&userid='+localStorage.getItem('userId'));

	                   //  resFromWinfGetSecret = JSON.parse(resFromWinfGetSecret);

	                   //  if(resFromWinfGetSecret.Code == 200) {
                    //       SaveArgument('sectionId='+item.ResourceId+'&secret='+resFromWinfGetSecret.Data.Secret+'&bookSrc='+item.FilePath+'&parentId='+resFromWinfGetSecret.Data.ParentId);
		                  // loadForm('/static/reader.html','图书阅读','图书阅读');
	                   //  }else {
	                   //    ShowMessage(resFromWinfGetSecret.Description);
	                   //  } 
                        
                        var data = {
                        	resourceid:item.ResourceId,
                        	userid:localStorage.getItem('userId')
                        }

                        //下面是配合winform异步获取数据
	                    ApiTransfer('get','/resource/detail',JSON.stringify(data),(resFromWinfGetSecret)=>{
	                        resFromWinfGetSecret = JSON.parse(resFromWinfGetSecret);

		                    if(resFromWinfGetSecret.Code == 200) {
	                          SaveArgument('sectionId='+item.ResourceId+'&secret='+resFromWinfGetSecret.Data.Secret+'&bookSrc='+item.FilePath+'&parentId='+resFromWinfGetSecret.Data.ParentId);
			                  loadForm('/static/reader.html','图书阅读',resFromWinfGetSecret.Data.Title,true);
		                    }else {
		                      ShowMessage(resFromWinfGetSecret.Description);
		                    }    
	                    });

		            }
               }else if(item.Type == 3) {
                  //此时是图片
                    if(env == 'dev') {
                       window.location.href = './static/map.html?resourceid=' + resourceid;
                    }else if(env == 'prod') {
                       // ChangeDpi(item.FilePath,(delNativeUrl)=>{
                           SaveArgument('imgSrc='+item.FilePath+'&resourceid='+item.ResourceId);
                           loadForm('/static/map.html','地图阅读',item.Title,true);
                           
                       // });
                    }
               }
	      },

	      toView(item) {
	      	this.conMenuShow=false;
	      	this.objectData = JSON.stringify(item);
	      	this.reading();
	      }
		},
	  	watch:{
       'setWindow':function(newValue) {
            this.setWindow();
		   }
		}
	}
</script>

<style lang="less">
	.downLoad{
		padding: 0 4% 30px 4%;
		overflow-y: visible;
		min-width: 630px;
	   
		h3{
			overflow:hidden;
			width: 100%;
			line-height: 50px;
			text-align: center;
		}

		.p1{
			margin:10px 0;
		}

		
		table{
			border-top:1px solid #ddd;
			border-left:1px solid #ddd;
			min-width: 460px;
                // overflow:hidden;
		}

		th{
			border-bottom:1px solid  #ddd;
			padding:10px 20px;
			background:#f2f2f2;
		}


		.th1{
			width:15%;
			border-right:1px solid #ddd;
			position: relative;
			min-width: 50px;
		}

		img{
			cursor: pointer;
			vertical-align: middle;
                float: right;
		}
	  .has-checkbox {
	         display: flex;
	         justify-content: center;
	         align-items: center;
	    }
		.showType{
			position: absolute;
			left: 60%;
			background-color: #fff;
			width: 100px;
			border: 1px solid #ddd;

		}
		.showType li{
			line-height: 30px;
			border-bottom: 1px solid #ddd;
			cursor: pointer;
			text-align: center;
		}

		td{
			padding:10px 15px;
			overflow:hidden;
			border-right:1px solid #ddd;
			cursor: pointer;
			border-bottom:1px solid #ddd;
			text-align: center;
		}

		td div{
			 max-height: 40px;
		     line-height: 20px;
		     overflow:hidden;
		}
			
		 thead tr{
	      border-right:1px solid #ddd;
	    }
	
		 tbody tr:hover{
	       background:#e4ebf5
	    }
		


	    .no-content{
		    text-align: center;
		    line-height: 60px;
		    background:#fff
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