<template>
	<div class="toCheck" :style="{height:winHeight + 'px',width:winWidth +'px'}">
		<div class="check-content">
			<!-- <h4>手机/邮箱&nbsp;激活码绑定</h4> -->
			<form id="regForm" style="margin:70px 0 30px 0;">
				  <div class="form-group" style="position: relative;">
				    <input type="text" class="form-control" name="regPhone" placeholder="手机号或邮箱" v-model="bindPhone">
				    <input type="button" class="getCodeCSS" :value="validCode" readonly @click="getValidCode">
				  </div>
				  <div class="form-group">
				    <input type="number" class="form-control" v-model="bindVolidCode" placeholder="验证码">
				  </div>
				   <div class="form-group">
				    <input type="number" class="form-control" v-model="bindActiveNumber" placeholder="激活码">
				  </div>		  
			</form>
			<div class="form-text">
				<img src="../assets/喇叭.png" alt="">
				<p>机构激活码可以下载阅读读书和地图，请填写激活码！</p>
			</div>
			<button class="form-btn">确定</button>

			<div class="loginSuccess" v-if="isBindSuccess" v-show="showBindRes">
          		<img src="../assets/注册成功.png" alt=""><span>{{bindSuccessText}}</span>
            </div>
            <div class="loginFail" v-else v-show="showBindRes">
          		<img src="../assets/注册失败.png" alt=""><span>{{bindFailText}}</span>
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
				showBindRes:true,
				bindSuccessText:'绑定成功',
				bindFailText:'',
				validCode:'获取验证码',
				bindPhone:'',
				bindVolidCode:'',
				bindActiveNumber:''
			}
		},
		methods:{
		  setWindow() {
            this.winWidth = window.innerWidth;
            this.winHeight = window.innerHeight;
          },
          //获取验证码
          getCode() {
			const reg=/^1[3|4|5|7|8][0-9]{9}$/;
		    const myMail=/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
		    
		         if(this.bindPhone && this.bindPhone.match(reg) == null && this.bindPhone.match(myMail) == null){
		            this.showBindRes = true;
		            this.isBindSuccess = false;
		            this.bindFailText = '请输入正确的手机号或邮箱';
		         }else{
		         	this.showBindRes = true;
		            this.isBindSuccess = true;
		            this.bindFailText = '成功！';
		         //   $(".getCodeCSS").attr({"disabled":"disabled"}).css("background",'#eee')
		        	// if(this.bindPhone.indexOf("@")!=-1){  //验证邮箱
		         //   		getMailCode(this.bindPhone,1);
		         //    }else{   //验证手机
		         //        if(env=="dev"){
		         //            $.ajax({  
		         //                url: baseUrl+"/user/checkphonenumber",  
		         //                type: "POST",  
		         //                data: {
		         //                    phonenumber:this.bindPhone
		         //                },  
		         //                success: function (res) {  
		         //                    res = eval('(' + res + ')')
		         //                      if(res.Success){ 
		         //                      ShowMessage('该用户已注册，请直接登录');
		         //                      $(".getCodeCSS").css("background",'#fff').attr("disabled",false)
		         //                   }else{  //发送验证码
		         //                        remainTime=60;
		         //                        timer = setInterval(reduceTime,1000)
		         //                        $(".showWord").show();

		         //                        getPhoneCode(this.bindPhone,1)
		         //                    }
		         //                 } 
		         //            });  
		         //        }else if(env=="prod"){

		         //            var data = {
		         //                phonenumber:this.bindPhone
		         //            }

		         //            //下面是配合winform异步获取数据
		         //            ApiTransfer('post','/user/checkphonenumber',JSON.stringify(data),(winResult)=>{
		         //                winResult=JSON.parse(winResult)
		         //                if(winResult.Success){
		         //                   $(".getCodeCSS").attr({"disabled":false}).css("background",'#fff');
		                           
		         //                   regInfo(false,"该用户已注册，请直接登录");
		         //                }else{  //发送验证码
		         //                    remainTime=60;
		         //                    timer = setInterval(reduceTime,1000)

		         //                    regInfo(false,"",1);

		         //                    getPhoneCode(this.bindPhone,1)
		         //                }
		         //            });


		         //        }
		          		
		         //  }
		        }
			}
		},
		mounted() {
			// ShowDevTools();
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
		width: 462px;
		height: 460px;
		border: 1px solid #ccc;
	    border-top: none;
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