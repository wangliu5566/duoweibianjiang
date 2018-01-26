<template>
	<div class="mark" @contextmenu.prevent="" @click="conMenuShow = false">
        
        <div style="margin: 10px 0 10px 0">
        	<el-button  @click="addNote">新建笔记</el-button>
        </div>

		<table cellspacing="0">
			<thead>
				<tr style="background-color:#f2f2f2;">
					<th style="width: 25%;" class="cell1">笔记标题</th>
					<th style="width: 55%;" class="cell2">笔记内容摘要</th>
					<th style="width:20%;">时间</th>
				</tr>
			</thead>
			<tbody  @contextmenu.prevent="openContextmenu($event)">
				<tr 
				v-if="dataList.length!=0" 
				v-for="(item,index) in dataList"
				:noteId="(item.Id)"
				@click="editNote(item.Id,item.Contents,item.Title)"
				>   
					<td style="width: 25%;" class="cell1" @click.stop="" >
					  <div class="td-div1" class="has-checkbox">
						   <input type="checkbox" style="margin-right:10px;margin-left:10px" :id="'label'+index" v-model="item.isChecked">
						   <div style="width:90%">
					         	<label :for="'label'+index">{{item.Title}}</label>
					         </div>
					   </div>
					</td>
					<td style="width: 55%; " class="cell2">{{trimHtmlTag(item.Abstracts)}}</td>
					<td style="text-align: center;">{{item.CreateTime}}</td>
				</tr>
				<tr v-if="dataList.length==0">
					<td colspan="3" style="text-align: center;line-height: 60px;">暂无笔记</td>
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
		 <div class="block" style="text-align: right" v-if="totalCount>0">
	      <el-pagination
	        @size-change="handleSizeChange"
	        @current-change="handleCurrentChange"
	        :current-page="currentPage"
	        :page-sizes="[10, 20, 30, 40]"
	        :page-size="pageCount"
	        layout="total, sizes, prev, pager, next, jumper"
	        :total="totalCount">
	      </el-pagination>
	    </div>

         <div class="loading-content" v-show="loading">
             <img src="../../assets/loading.gif" alt="">
        </div>

         <ul class="context-menu" v-if="conMenuShow" :style="{left:conMenuLeft+'px',top:conMenuTop+'px'}">  
		     <li @click="deleteNote()">删除</li>  
		     <li @click="editNote()">编辑</li>  
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
				loading:false,
				pageCount:20,
		        currentPage:1,
		        totalCount:0,
		        conMenuShow:false,
		        conMenuLeft:0,
		        conMenuTop:0,
		        contextObj:{
		        	del:true,
		        	collect:false,
		        	reading:true,
		        },
		        aimNode:null,
		        noteId:"",

		        flag:false,
			}
		},
		mounted(){
			this.setWindow();


			setInterval(()=>{
              if(localStorage.getItem('isNeedNoteListReload')) {
              	 localStorage.removeItem('isNeedNoteListReload');
                 window.location.reload();
              }
			},500)
			// ShowDevTools();
			window.onresize = ()=>{
		       this.setWindow();
	        },
			this.getData();
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
		        this.getData()
	      	},
	       //点击页数，请求第几页
	      	handleCurrentChange(val) {
		        this.currentPage=val;
		        this.isChecked = false;
		        this.getData()
	      	},
	      	//全选
	        checkAll() {
	          this.dataList.forEach((item,index)=>{
	              item['isChecked'] = this.isChecked ? true : false;
	              this.$set(this.dataList,index,item);
	          }) 
	        },
			getData(){
				//验证有没有用户信息
                var hasUserId = volidUserId();
                if(!hasUserId) return;

				this.loading=true
				if(env=="dev"){
					this.$http("/notebook/list",{
						params:{
							userid:localStorage.getItem('userId'),
							resourceid:"",
							whole:true,
							range:"",
							position:""
						}
					})
					.then((res)=>{
						this.dataList=res.data.Data.ItemList
						console.log(this.dataList)
						this.totalCount=res.data.Data.RecordCount
						this.loading=false
					})
					.catch((err)=>{
						console.log(err)
					})
				}else if(env=="prod"){
					var data ={
							userid:localStorage.getItem('userId'),
							// userid:100,
							resourceid:"",
							whole:true,
							range:"",
							position:"",
						}


			   //      setTimeout(()=>{
			   //      	this.loading=false;
      //                   var winResult = ApiTransfer('get','/notebook/list',conbineData(data));
	     //                winResult = JSON.parse(winResult)
						// if(winResult.Success){
						// 	this.dataList = winResult.Data.ItemList
						// 	this.totalCount = winResult.Data.RecordCount
							
						// }
			   //      },500)	
			   //      
			       

			       //下面是配合winform异步获取数据
                    ApiTransfer('get','/notebook/list',JSON.stringify(data),(winResult)=>{
                        this.loading = false;
                         winResult = JSON.parse(winResult)
						if(winResult.Success){
							this.dataList = winResult.Data.ItemList
							console.log(winResult)
							this.totalCount = winResult.Data.RecordCount;
							if(this.dataList.length == 0){
					                  console.log(1)
					                  console.log(this.dataList)
					                  this.flag = true;
					                  $('.emputy').css('backgroundColor','#eee');
					                  $('#checkall').css('backgroundColor','gray');
					              }else if(this.dataList.length != 0){
					                  this.flag = false;
					              }
							this.dataList.forEach((item,index)=>{
			                           item['isChecked'] = false;
		                            })
						}
                    });
				}
				
			},
			  //右键功能
		    openContextmenu(e){
		    	 if(this.dataList.length != 0) this.conMenuShow=true;
		      	
		      	 if(this.winWidth-e.pageX<120){
		            this.conMenuLeft=this.winWidth-120;
		         }else{
		            this.conMenuLeft=e.pageX;
		         }
		         if(this.winHeight-e.pageY<60){
		            this.conMenuTop=this.winHeight-60;
		         }else{
		             this.conMenuTop = e.pageY;
		         }


		        if(e.target.nodeName=="DIV" ){
		        	this.noteId = e.target.parentNode.parentNode.getAttribute("noteId")
		        }else if(e.target.nodeName=="TD"){
		        	this.noteId = e.target.parentNode.getAttribute("noteId")
		        }else if(e.target.nodeName=="INPUT"){
		        	this.noteId = e.target.parentNode.parentNode.parentNode.getAttribute("noteId")
		        }else if(e.target.nodeName=="LABEL"){
		        	this.noteId = e.target.parentNode.parentNode.parentNode.parentNode.getAttribute("noteId")
		        }



		   //      <td style="width: 25%;" class="cell1" @click.stop="" >
					//   <div class="td-div1" class="has-checkbox">
					// 	   <input type="checkbox" style="margin-right:10px;margin-left:10px" :id="'label'+index" v-model="item.isChecked">
					// 	   <div style="width:90%">
					//          	<label :for="'label'+index">{{item.Title}}</label>
					//          </div>
					//    </div>
					// </td>


	         	
	         	// this.contextObj.collect = !!this.aimNode.parentNode.getAttribute("IsFavorite");
		      },
		      //新建笔记
		      addNote() {
                //打开笔记界面
			       if(env == 'dev') {
			           window.location.href = ymUrl + '/static/noteEditor.html';
			        }else if(env == 'prod') {
			           loadForm('/static/noteEditor.html','笔记','新增笔记',true);
			        } 
		      },
		      //删除
		      deleteNote(){
		      	this.conMenuShow=false;
		      	if(env == 'dev') {
                   this.$http.post("/notebook/delete",{
						ids:this.noteId
					})
					.then((res)=>{
						this.conMenuShow=false;
						if(res.data.Description=="成功"){
							this.$message({
					          showClose: true,
					          message: '笔记删除成功'
					        });
					        this.getData()
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
                     ApiTransfer('post','/notebook/delete',JSON.stringify({
	                    userid:localStorage.getItem('userId'),
	                    ids:this.noteId,
	                  }),(winResult)=>{
	                      winResult=JSON.parse(winResult)
	                      console.log(winResult)
	                 if(winResult.Success){
	                   
	                   this.$message({
	                          type: 'success',
	                          message: '删除成功!'
	                        });
	                   this.getData();
	                   this.isChecked = false;
	                  }else {
	                    ShowMessage(winResult.Description)
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
		              message: '请选择要删除的笔记!'
		            });
		         return
		       }

	           delStr = delObjectids.join(',');

	          // 对象编号，对象类型，创建时间|对象编号，对象类型，创建时间
	          if(env == 'prod') {
	              ApiTransfer('post','/notebook/delete',JSON.stringify({
	                    userid:localStorage.getItem('userId'),
	                    ids:delStr,
	                  }),(winResult)=>{
	                      winResult=JSON.parse(winResult)
	                      console.log(winResult)
	                 if(winResult.Success){
	                   
	                   this.$message({
	                          type: 'success',
	                          message: '删除成功!'
	                        });
	                   this.getData();
	                   this.isChecked = false;
	                  }else {
	                    ShowMessage(winResult.Description)
	                  }
	              });
	           }
	        },
		      editNote(noteId,contents,title){
		      	this.conMenuShow=false; 
		      	var data = {
		      		noteId:null,
		      		contents:'',
		      		title:''
		      	}
		      	if(!noteId) {
		      		console.log(this.noteId);
		      	   //右键
                   if(!this.noteId) return;
                   
                   this.dataList.forEach((item,index)=>{
                      if(this.noteId == item.Id) {
                         data = {
				      		noteId:item.Id,
				      		contents:item.Contents,
				      		title:item.Title
				      	}
                      }
                   })
            
		      	}else {
                   var data = {
			      		noteId:noteId,
			      		contents:contents,
			      		title:title
			      	}
		      	}
		      	
		        if(env == 'dev') {
	               location.href  = encodeURI('./static/noteUpdate.html?notteData='+JSON.stringify(data));
	            }else if(env == 'prod') {
	               SaveArgument('noteData='+JSON.stringify(data))
	               loadForm('/static/noteUpdate.html','笔记',data.title,true);
	            } 
		      },
		      // 处理摘要
		      trimHtmlTag(html) {
			        html = html.replace(/<head>[^>]*<\/head>/g, "");//去掉head
			        html = html.replace(/<!--[\s\S]*?-->/g, "");//去掉注释
			        html = html.replace(/<![\s\S]*?>/g, "");
			        html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");//去掉样式
			        html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");//去掉js
			        html = html.replace(/<w:[^>]+>[\s\S]*?<\/w:[^>]+>/g, "");//去掉word标签
			        html = html.replace(/<img[^>]*/g, "");
			        html = html.replace(/<audio>[\s\S]*?<\/audio>/g, "");
			        html = html.replace(/<video>[\s\S]*?<\/video>/g, "");
			        html = html.replace(/<a>[\s\S]*?<\/a>/g, "");
			        html = html.replace(/<xml>[\s\S]*?<\/xml>/g, "");
			        html = html.replace(/<html[^>]*>|<body[^>]*>|<\/html>|<\/body>/g, "");
			        html = html.replace(/\r\n|\n|\r/g, "");//去掉换行
			        html = html.replace(/<br[^>]*>/g, "");
			        html = html.replace(/<p[^>]*>[\s\S]*?<\/p>/g, '');
			        html = html.replace(/<p[^>]*/g, '');
			        html = html.replace(/<[^>]+>/g, "");
			        return html.trim();
			    }
		}
	}
</script>

<style lang="less">
	.mark{
		 padding: 0 4% 30px 4%;
           overflow-y: visible;

		h3{
			overflow:hidden;
			width: 100%;
			line-height: 50px;
			text-align: center;
		}

		table{
			width: 100%;
			border:1px solid #ddd;
			border-bottom:none;
			min-width: 460px;
                overflow:hidden;
			margin-bottom: 15px;
		}

		tbody,thead,tr{
			width: 100%;
		}

		th{
			border-bottom:1px solid #ddd;
			line-height: 40px;
			font-size: 14px;
		}

		td{
			padding:0 15px;
			height: 40px;
			overflow:hidden;
			border-bottom:1px solid #ddd;
			cursor: pointer;
			font-size: 14px;
			max-width: 1200px;
			text-align: center;
		}
		
		 tbody tr:hover{
	      background: #e4ebf5;
	    }

	    .cell1,.cell2{
	    	border-right:1px solid #ddd;
	    }
		.has-checkbox {
	         display: flex;
	         justify-content: center;
	         align-items: center;
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