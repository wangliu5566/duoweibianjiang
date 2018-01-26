<template>
	<div>
		<div class="small-title">
			<span @click="ADtoCanlendar(1)" :class="{'currentColor':paramObj.type==1}">公元纪年到年号纪年</span><span>|</span>
			<span @click="ADtoCanlendar(2)" :class="{'currentColor':paramObj.type==2}">年号纪年到公元纪年</span>
		</div>	
		<!-- 显示公元纪年到年号几年 -->
		<div v-if="paramObj.type==1">
			<div class="input-div">
				<span><el-input v-model="paramObj.year" placeholder="请输入公元纪年"
				  	icon="circle-cross"
	  				:on-icon-click="clearInput" style="width:80%;"></el-input>&nbsp; 年</span>
  				<el-radio-group v-model="paramObj.isbc">
					<el-radio class="radio" label="false">公元</el-radio>
	  				<el-radio class="radio" label="true">公元前</el-radio>
	  			</el-radio-group>
	  			<el-button type="default" size="small" class="btn" @click="changeYear(1)">换算</el-button>
			</div>
			<div class="history">
				<span>历史时期：{{period}}</span>
				<span>干&nbsp;&nbsp;支：{{branches}}</span>
	  			<span>&nbsp;</span>
			</div>
		</div>
		<!-- 显示年号几年到公元纪年 -->
		<div v-if="paramObj.type==2">
			<div class="input-div">
				<span><el-input v-model="paramObj.regin" placeholder="请输入年号"
				  	icon="circle-cross"
	  				:on-icon-click="clearInput" style="width:80%;"></el-input></span>
	  			<el-button type="default" size="small" class="btn" @click="changeYear(2)">换算</el-button>
			</div>
			<div class="history">
				<span>公元纪年：{{period}}</span>
				<span>干&nbsp;&nbsp;支：{{branches}}</span>
	  			<span>&nbsp;</span>
			</div>
		</div>

		<div class="table">
				<el-table
				    :data="tableDatas1"
				    stripe
				    style="width: 100%">
				    <el-table-column
				      prop="Dynasty"
				      label="政权">
				    </el-table-column>
				    <el-table-column
				      prop="Emperor"
				      label="君主">
				    </el-table-column>
				    <el-table-column
				      prop="Reign"
				      label="年号">
				    </el-table-column>
				  </el-table>
			</div>
		
	</div>
</template>

<script type="text/javascript">
	import { MessageBox } from 'element-ui'
	export default{
		data(){
			return{
				period:'',//历史时期
				branches:"",//干支
				paramObj:{
					type:"1",//1是显示'公元纪年到年号几年',2是显示'年号几年到公元纪年'
					year:"",//type为1时需要上传的公元纪年
					regin:"",//type为2时需要上传的年号
					isbc:'false',//true是公元前，false不是公元前
				},
		        tableDatas1: [],
			}
		},
		methods:{
			clearInput(){
				this.paramObj.year="";
				this.paramObj.regin="";
			},
			ADtoCanlendar(index){
				this.paramObj.type=index;
			},
			changeYear(index){
				if(index==1){
					if(this.paramObj.year==""){
						  this.$message({
					          showClose: true,
					          message: '请输入公元纪年！'
					        });
					}else{
						this.submitData();
					}
				}else if(index==2){
					if(this.paramObj.regin==""){
						this.$message({
					          showClose: true,
					          message: '请输入年号！'
					        });
						
					}else{
						this.submitData();
					}
				}
			},
			submitData(){
				this.$http.get('/annal/annalconvert/',{
					 params:{
					    type:this.paramObj.type,
					    year:this.paramObj.year,
					    regin:this.paramObj.regin,
					    isbc:this.paramObj.isbc=="false"?false:true

					  }
				})
				.then((response)=>{
				  if(response.statusText=="OK"){
				  	if(response.data.Data.ItemList!=0){
			  			this.period=response.data.Data.Period;
				  		this.branches=response.data.Data.ItemList[0].Branches;
			  			this.tableDatas1=response.data.Data.ItemList;
				  	}else{
				  		this.period="";
				  		this.tableDatas1=[];
				  		this.branches="";
				  	}
				  }
				})
				.catch((err)=>{
				    console.log(err);
				});

			}
		}
	}

</script>

<style type="text/css" scoped>
	.small-title{ display: flex; justify-content:space-around;font-size: 16px;margin-bottom: 22px;color:#999;}
	span{cursor: pointer;}
	.currentColor{color:#333;}
	.input-div{display: flex;justify-content: space-between;background-color: rgba(242, 242, 242, 1);margin:0 -20px;padding:10px 20px;border-bottom: 1px solid #ccc;align-items:center;}
	.history,.table{display: flex;justify-content: space-between;background-color: rgba(242, 242, 242, 1);margin:0 -20px;padding:20px 20px 10px;}
	.table{margin:0 -20px -30px;padding:10px 20px 30px;}
	.btn{background-color: rgba(143, 169, 169, 1);color:white;}
	input{height: 25px;}
</style>