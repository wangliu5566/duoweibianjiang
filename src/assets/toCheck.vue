<template>
	<div class="toCheck" :style="{height:winHeight + 'px',width:winWidth +'px'}">
		<div class="check-content">
			<!-- <h4>手机/邮箱&nbsp;激活码绑定</h4> -->
			<form id="regForm" style="margin:70px 0 30px 0;">
				  <div class="form-group" style="position: relative;">
				    <input type="text" class="form-control" name="regPhone" placeholder="手机号或邮箱" id="regPhone">
				    <input type="button" class="getCodeCSS" onclick="getCode($('#regPhone').val())" value="获取验证码" readonly>
				  </div>
				  <div class="form-group">
				    <input type="text" class="form-control" name="regCode" placeholder="验证码">
				  </div>
				   <div class="form-group">
				    <input type="text" class="form-control" name="codeNumber" placeholder="激活码">
				  </div>		  
			</form>
			<div class="form-text">
				<img src="../assets/喇叭.png" alt="">
				<p>机构激活码可以下载阅读读书和地图，请填写激活码！</p>
			</div>
			<button class="form-btn">确定</button>

			<div class="loginSuccess" ref="bindSuccess" v-if="isBindSuccess" v-show="showBindRes">
          		<img src="../assets/注册成功.png" alt=""><span>绑定成功</span>
            </div>
            <div class="loginFail" ref="bindFail" v-else v-show="showBindRes">
          		<img src="../assets/注册失败.png" alt=""><span></span>
            </div>
		</div>
	</div>
</template>

<script>
	export default{
		data(){
			return{
				winWidth:window.innerWidth,
				winHeight:window.innerHeight,
				isBindSuccess:true,
				showBindRes:true
			}
		},
		methods:{
		  setWindow() {
            this.winWidth = window.innerWidth;
            this.winHeight = window.innerHeight;
          },
		},
		mounted() {
			ShowDevTools();
			window.onresize = () => {
	            this.setWindow();
	        }
		}
	}
</script>

<style scoped>
	.toCheck{
		display: flex;
		justify-content:center;
		align-items: center;
	}
	.check-content{
		background-color: white;
		width: 480px;
		height: 470px;
		border: 1px solid #ccc;
		overflow: hidden;
	}
	.check-content h4{
		font-size: 22px;
		text-align: center;
		margin-top: 20px;
		font-weight: 500;
	}
	.form-group{
		margin-top: 10px;
		text-align: center;
	}

	#regForm .form-control {
	  width: 70%;
	  height: 36px;
	  font-size: 14px;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  padding-left: 10px;

	}
	.getCodeCSS{
	  width: 118px;
	  height: 30px;
	  position: absolute;
	  right: 14%;
	  top:5px;
	  cursor: pointer;
	  color:#5882ad;
	  background-color: #fff;
	  border:none;
	  font-size: 14px;
	}
	.form-text{
		width: 352px;
		margin: 0 auto;
	}
	.form-text img{
		margin: 10px 18px;
		float: left;
     }
     .form-text p{
     		line-height: 32px;
     }
	.form-btn{
		 width: 372px;
		 height: 42px;
		 background-color: white;
		  margin: 20px 0 0 55px;
		  font-size: 14px;
		  border:1px solid #5882ad;
		  color:#5882ad;
		  border-radius: 5px;
		  font-size: 16px;
	}	
</style>