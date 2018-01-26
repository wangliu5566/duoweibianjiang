<template>
	<div>
		<div class="select">
			<span>选择需要切换的窗口（最多选择3个）</span>
			<el-button type="default" class='btn' size="small">确定</el-button>
		</div>
		 <el-checkbox-group 
		    v-model="checkedNum"
		    :min="1"
		    :max="2"
		    @change="handleCheckedChange">
		    <ul>
				<li v-for="item in options"><span></span><span>{{item}}</span><el-checkbox :label="item" :key="item" ></el-checkbox></li>
		    </ul>
		  </el-checkbox-group>
	</div>
</template>

<script type="text/javascript">
	const itemsOptions = ['1', '2', '3', '4'];
	export default{
		data(){
		  return {
	        checkedNum: [],//用来装选择了的选项
	        options: itemsOptions
	      };
		},
		mounted(){
		},
		methods:{
			handleCheckedChange(value){
				console.log(value)
				this.checkedNum=value;
			}
		}
	}
</script>


<style type="text/css" scoped>
	.select{ display: flex; justify-content:space-between;font-size: 16px;padding:15px 0;}
	.btn{background-color: rgba(143, 169, 169, 1);color:white;}
	li{border:1px solid #ccc;padding:10px 0;margin-bottom: 15px;display: flex; justify-content:space-between;padding-right: 5%;}
	.el-checkbox{width: 18px;overflow: hidden;}

</style>