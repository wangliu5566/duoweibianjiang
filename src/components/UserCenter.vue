<template>
  <div :style="{height:winHeight-1 + 'px',width:winWidth +'px'}" class="user-center-cont" @contextmenu.prevent="">
  	<div class="user-center-main" >
	    <div class="menu">
	      <div class="user-cover">
	        <div class="user-cover-main">
	          <img :src="userInfo.UserFace?userInfo.UserFace:'./static/images/photo.png'" alt="用户头像">
	        </div>
	        <p class="text-center">
	          <span class="upload-btn" @click="uploadCoverImg" v-if="!isUploadingCoverImg">修改头像</span>
	          <span class="upload-btn" style="color:#ccc" v-else>正在上传...</span>
	        </p>
	      </div>
	      <div class="user-menu">
	        <ul>
	          <li v-for="(item,index) in menuDatas" :key="item+index" :class="index==defaultIndex?'selected':''" @click="exchangeDefaultIndex(index)">
	            {{item}}
	          </li>
	        </ul>
	      </div>
	    </div>

	    <div class="main">
		    	<!-- 基本信息 -->
		      <div v-if="defaultIndex==0" class="user-basic">
		        <p class="title">用户名</p>
		        <el-input 
		        v-model="userInfo.NickName" 
		        placeholder="输入用户名"
		        @focus="userInfoCanUpdate = false"
		        @blur="userInfoCanUpdate = !userInfo.NickName?true:false"
		        ></el-input>
		        <el-radio-group v-model="userInfo.Sex" class="radio-group-sex" @change="changeUserSex">
		        	<!-- userInfoCanUpdate = true -->
		          <el-radio label="男">男</el-radio>
		          <el-radio label="女">女</el-radio>
		        </el-radio-group>
				<el-button  
				class="sumbit-btn" 
				style="margin-bottom:-44px" 
				:disabled="userInfoCanUpdate"
				@click="updateUserInfo(false)"
				>
				修 改
				</el-button>
		      </div>


		      <!-- 绑定手机/邮箱 -->
		      <div v-if="defaultIndex==1" class="bind-phone-email">
		      	<div v-if="!hasBindPhone" ref="getCodeInput">
		      		<el-input 
		      		v-model="bindPhoneInput" 
		      		placeholder="手机号或邮箱" 
		      	    @focus="phoneAndEmailCanUpdate = false"
		            @blur="phoneAndEmailCanUpdate = !bindPhoneInput?true:false"
		      		>
		      			
		      		</el-input>
			      	<el-input 
			      	type="number" 
			      	v-model="bindValidCodeInput" 
			      	placeholder="验证码" 
			        @focus="phoneAndEmailCanUpdate = false"
		            @blur="phoneAndEmailCanUpdate = !bindValidCodeInput?true:false"
			      	>
			      		
			      	</el-input>

			      	<span class="get-code" :style="{color:isGetValidCoding?'#aaa':'#2b579a',cursor:isGetValidCoding?'default':'pointer'}" @click="getValidCode">{{validStateText}}</span>
		      	</div>
		      	<div v-else class="has-bind-phone">
		      		<span style="font-size:18px">{{bindPhone}}</span>
		      	</div>
		      	<el-button v-show="!hasBindPhone" class="sumbit-btn" @click="bindAccount" :disabled="phoneAndEmailCanUpdate">立刻绑定</el-button>
		      </div>


			<!-- 社交账户绑定 -->
			  <div v-if="defaultIndex==2" class="bind-three-parties">

				<div class="each-line" v-for="(item,index) in thirdPlat">
					<div class="each-line-bg each-line-wx">
						<img :src="item.platId == 1?'./static/images/qq_small.png':(item.platId == 2?'./static/images/wb_small.png':'./static/images/wx_small.png')" :alt="item.nickname">
					</div>
					<span class="each-line-title">
						{{item.nickname}}
					</span>
					<div class="each-line-handle">
						<el-button v-if="!item.isBind" @click="bindThird(index)" >立刻绑定</el-button>
						<span v-else style="color:#999;padding-right:20px">已绑定</span>
					</div>
				</div>
			</div>


			<!-- 激活码 -->
			<div v-if="defaultIndex==3" class="bind-code">
				<el-input 
				v-model="bindActiviCode" 
				type="number" 
				placeholder="激活码"
				@focus="activeCanUpdate = false"
		        @blur="activeCanUpdate = !bindActiviCode?true:false"
				>
					
				</el-input>
				<div class="code-notice">
					<div class="cover">
						<img src="../assets/喇叭.png" alt="广播">
					</div>
					<p class="notice-main">机构激活码可以下载阅读图书和地图，请填写激活码！</p>
				</div>
				<el-button class="sumbit-btn" @click="updateUserInfo(true)" :disabled="activeCanUpdate">修 改</el-button>
			</div>
            

            <div class="oparate-info" v-show="showOparateInfo">
            	<p v-if="isSuccess"><img src="../assets/注册成功.png" alt=""><span style="color:#2b579a">{{oparateInfoText}}</span></p>
            	<p v-else><img src="../assets/注册失败.png" alt=""><span style="color:rgb(201,0,0)">{{oparateInfoText}}</span></p>
            </div>
	    </div>
	  </div>

	   <div class="loading-content loading-other" v-show="loading">
            <img src="../assets/loading.gif" alt="">
            <span>上传头像中，请稍等！</span>
        </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      winWidth:window.innerWidth,
	  winHeight:window.innerHeight, 
	  userInfo:{},
	  userFace:'',	 
      //默认侧边栏开启index
      defaultIndex: 0,
      //侧边栏
      menuDatas: ['用户信息', '手机/邮箱绑定', '社交账户绑定', '激活码'],


      //激活码
      code:'',
      hasBindPhone:false,
      bindPhone:'290079770@qq.com',
      bindPhoneInput:'',
      bindValidCodeInput:'',
      bindActiviCode:'',
      // 1-QQ，2-微博，3-微信
      thirdPlat:[
	      {
            nickname:'微信',
            isBind:false,
            platId:3
	      },
	      {
            nickname:'微博',
            isBind:false,
            platId:2
	      },
	      {
            nickname:'QQ',
            isBind:false,
            platId:1
	      },
      ],
      //验证码
      validStateText:'获取验证码',
      isGetValidCoding:false,
      isSuccess:true,
      showOparateInfo:false,
      oparateInfoText:'操作成功',
      showOparateInfoTimer:null,
      isUploadingCoverImg:false,
      loading: false,

      userInfoCanUpdate:true,
      phoneAndEmailCanUpdate:true,
      activeCanUpdate:true
    }
  },
  methods:{

  	setWindow() {
	    this.winWidth = window.innerWidth;
	    this.winHeight = window.innerHeight;
	  },

	//左侧点击改变index
	exchangeDefaultIndex(index) {
       	this.defaultIndex = index;
       	this.showOparateInfo = false; 
	},
	//获取用户数据
	getUserInfo() {
	      if(env == 'prod') {
            ApiTransfer('get','/user/detail',JSON.stringify({id:localStorage.getItem('userId')}),(winResult)=>{
            	winResult = JSON.parse(winResult);
                if(winResult.Success) {
		          	this.userInfo = winResult.Data;
		          	//验证是否已绑定手机
		          	this.hasBindPhone = this.userInfo.MobileNumber? true :(this.userInfo.Email?true:false);
		          	if(this.hasBindPhone) this.bindPhone = this.userInfo.MobileNumber? this.userInfo.MobileNumber : this.userInfo.Email;
		          	 
		          	//验证是否是第三方，OauthList-> array -> PlatformId -> 1-QQ，2-微博，3-微信
	                if(this.userInfo.OauthList) {
	                   this.userInfo.OauthList.forEach((item,index)=>{
	                      this.thirdPlat.forEach((titem,tindex)=>{
	                          if(item.PlatformId == titem.platId) {
	                             titem.nickname = item.NickName?item.NickName:'未获取到昵称';
	                             titem.isBind = true;
	                          }
	                      })
	                   })
	                }

		          	//验证是否有激活码
		          	this.bindActiviCode = this.userInfo.ActivatedCode ? this.userInfo.ActivatedCode:(this.userInfo.UserType == 1?'您是管理员，不需要激活码！':'')
	            }else {
                this.showOparateInfoBymes(false,winResult.Description);
	            }
            });
	      }else if(env == 'dev') {
	      	 this.$http("/user/detail",{
		       params:{
			        id:localStorage.getItem('userId'),
			      }
			    })
		       .then((res)=>{
		          if(res.data.Success) {
		          	this.userInfo = res.data.Data;
		console.log(this.userInfo)
		          	//验证是否已绑定手机
		          	this.hasBindPhone = this.userInfo.MobileNumber? true :(this.userInfo.Email?true:false);
		          	if(this.hasBindPhone) this.bindPhone = this.userInfo.MobileNumber? this.userInfo.MobileNumber : this.userInfo.Email;
		          	 
		          	//验证是否是第三方，OauthList-> array -> PlatformId -> 1-QQ，2-微博，3-微信
	                if(this.userInfo.OauthList) {
	                   this.userInfo.OauthList.forEach((item,index)=>{
	                      this.thirdPlat.forEach((titem,tindex)=>{
	                          if(item.PlatformId == titem.platId) {
	                             titem.nickname = item.NickName?item.NickName:'未获取到昵称';
	                             titem.isBind = true;
	                          }
	                      })
	                   })
	                }

		          	//验证是否有激活码
		          	this.bindActiviCode = this.userInfo.ActivatedCode ? this.userInfo.ActivatedCode:(this.userInfo.UserType == 1?'您是管理员，不需要激活码！':'')
		          }else {
	                this.showOparateInfoBymes(false,res.data.Description);
		          }
		       })
		      .catch((err)=>{
		         console.log(err)
		      })
	      }
	  },
	  //触发修改用户性别
	  changeUserSex() {
        this.userInfoCanUpdate = false;
	  },
	  //修改个人信息和激活码
	  updateUserInfo(isupdateActiveCode = false) {
	  	 if(isupdateActiveCode) {
	  	 	if(!this.userInfo.MobileNumber && !this.userInfo.Email) {
	  	 		this.showOparateInfoBymes(false,'请先绑定手机号或邮箱！');
	            return;
	         }

	        if(this.bindActiviCode == '') {
               this.showOparateInfoBymes(false,'请输入激活码！');
	           return;
	        } 
             
            if(this.bindActiviCode == this.userInfo.ActivatedCode) {
            	this.showOparateInfoBymes(false,'请输入新的激活码！');
                return;
            } 

	        this.bindActivatedCode();
	        return;
	  	 }
         
         if(!this.userInfo.NickName) {
            this.showOparateInfoBymes(false,'用户昵称不能为空！');
	        return;
         }

	  	 var data = {
	  	 	nickname:this.userInfo.NickName,
	  	 	sex:this.userInfo.Sex,
	  	 	age:this.userInfo.Age,
	  	 	profession:this.userInfo.Profession,
	  	 	userid:localStorage.getItem('userId')
	  	 }

	  	 if(env == 'dev') {
            this.$http.post("/user/update",data)
		       .then((res)=>{
		          if(res.data.Success) {
		          	this.showOparateInfoBymes(true,'修改成功！');
		          }else {
		          	this.showOparateInfoBymes(false,res.data.Description);
		          }
		       })
		      .catch((err)=>{
		         console.log(err)
		      })
	  	 }else if(env == 'prod') {
              ApiTransfer('post','/user/update',JSON.stringify(data),(winResult)=>{
                winResult=JSON.parse(winResult)
                if(winResult.Success) {
		          this.showOparateInfoBymes(true,'修改成功！');
		          if(isupdateActiveCode) {
				      this.activeCanUpdate = true;
		          }else this.userInfoCanUpdate = true;

		          this.reLogin();
		        }else {
		          this.showOparateInfoBymes(false,winResult.Description);
		        }
             }); 
	  	 }

	  	  
	  },

	  //修改用户头像
	  uploadCoverImg() {
         this.isUploadingCoverImg = true;
         this.loading = true;
         EnableCloseBtn(true);

         setTimeout(()=>{
         	UpLoadFile('图片|*.jpg;*.png;*.gif',(imgUrlData)=>{

		          imgUrlData = JSON.parse(imgUrlData);
	              console.log(imgUrlData)
		          if(imgUrlData.Code == 200) {
		          	 this.userInfo.UserFace = imgUrlData.Data;
		          	 console.log('in')
		             SetUserFace(imgUrlData.Data);
		          }else {
		             this.showOparateInfoBymes(false,imgUrlData.Description);
		          }

		          EnableCloseBtn(false);
		          this.loading = false;
	              this.isUploadingCoverImg = false;

		      })
         },100)
	  },
	  //绑定激活码
	  bindActivatedCode() {
	  	 if(env == 'dev') {
            this.$http.post("/user/BindActivatedCode",{activatedcode:this.bindActiviCode,userid:localStorage.getItem('userId')})
		       .then((res)=>{
		       	  console.log(res.data)
		          if(res.data.Success) {
		          	 this.showOparateInfoBymes(true,'绑定成功！');
		          }else {
		          	this.showOparateInfoBymes(false,res.data.Description);
		          }
		       })
		      .catch((err)=>{
		         console.log(err)
		      }) 
	  	 }else if(env == 'prod') {
              ApiTransfer('post','/user/BindActivatedCode',JSON.stringify({activatedcode:this.bindActiviCode,userid:localStorage.getItem('userId')}),(winResult)=>{
                  winResult=JSON.parse(winResult)

                  if(winResult.Success) {
		          	 this.showOparateInfoBymes(true,'绑定成功！');
		          	 this.reLogin();
		          }else {
		          	this.showOparateInfoBymes(false,winResult.Description);
		          }
             }); 
	  	 }    
	  },
	  //获取验证码
	  getValidCode() {
         if(!this.isGetValidCoding) {
            //验证手机号或邮箱是否符合规则
            const reg=/^1[3|4|5|7|8][0-9]{9}$/;
            const myMail=/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
            
            // bindPhoneInput
            // bindValidCodeInput
            if(this.bindPhoneInput.match(reg) == null&&this.bindPhoneInput.match(myMail)==null){
	          this.showOparateInfoBymes(false,'请填写有效的电话或邮箱');
	          return;
	        }

	        let isPhoneOrMail = 1    //1-手机号 2-邮箱
            if(myMail.test(this.bindPhoneInput)) {
               isPhoneOrMail = 2;
            }
            //验证通过，请求验证码
            this.requsetValidCode(isPhoneOrMail);

         }
	  },
	  //验证通过，请求验证码
      requsetValidCode(type) {
         //1-手机号 2-邮箱
         switch (type) {
         	case 1:
         		//手机号需要验证是否被使用过，如果被使用过，就不允许直接绑定该手机
         	    this.getPhoneCode();
         		break;
         	case 2:
         		this.getMailCode(); 
         		break;	
         	default:
         		// statements_def
         		break;
         }

      },
      //手机请求验证码
     getPhoneCode(){
	    if(env == 'dev') {
            this.$http.post("/sms/send",{phonenumber:this.bindPhoneInput,type:1})
		       .then((res)=>{
		       	  console.log(res.data)
		          if(res.data.Success) {
	          	    //开始倒计时
		          	this.isGetValidCoding = true;
		          	this.showOparateInfoBymes(true,'验证码已发送至您的手机/邮箱！');
		            let time = 59;
                    
		            let timer = setInterval(()=>{
		              this.validStateText = time +' 秒';
		              time --;
		              if(time < 0) {
		              	 this.validStateText = '再次获取';
		              	 this.isGetValidCoding = false;
		                 clearInterval(timer); 
		              }
		            }, 1000)   
		          }else {
		          	this.showOparateInfoBymes(false,res.data.Description);
		          }
		       })
		      .catch((err)=>{
		         console.log(err)
		      })
	  	 }else if(env == 'prod') {
              ApiTransfer('post','/sms/send',JSON.stringify({phonenumber:this.bindPhoneInput,type:1}),(winResult)=>{
                  winResult=JSON.parse(winResult)

                  if(winResult.Success) {
		          	    //开始倒计时
			          	this.isGetValidCoding = true;
			          	this.showOparateInfoBymes(true,'验证码已发送至您的手机！');
			            let time = 59;

			            let timer = setInterval(()=>{
			              this.validStateText = time +' 秒';
			              time --;
			              if(time < 0) {
			              	 this.validStateText = '再次获取';
			              	 this.isGetValidCoding = false;
			                 clearInterval(timer); 
			              }
			            }, 1000)   
		          }else {
		          	this.showOparateInfoBymes(false,winResult.Description);
		          }
             }); 
	  	 }          

     },

     //邮箱请求验证码
     getMailCode(){
	    if(env == 'dev') {
            this.$http.post("/email/send",{email:this.bindPhoneInput,type:1})
		       .then((res)=>{
		       	  console.log(res.data)
		          if(res.data.Success) {
		          	    //开始倒计时
			          	this.isGetValidCoding = true;
			            let time = 59;

			            let timer = setInterval(()=>{
			              this.validStateText = time +' 秒';
			              time --;
			              if(time < 0) {
			              	 this.validStateText = '再次获取';
			              	 this.isGetValidCoding = false;
			                 clearInterval(timer); 
			              }
			            }, 1000)  	
		          }else {
		          	this.showOparateInfoBymes(false,res.data.Description);
		          }
		       })
		      .catch((err)=>{
		         console.log(err)
		      })
	  	 }else if(env == 'prod') {
              ApiTransfer('post','/email/send',JSON.stringify({email:this.bindPhoneInput,type:1}),(winResult)=>{
                  winResult=JSON.parse(winResult)

                  if(winResult.Success) {
		          	    //开始倒计时
			          	this.isGetValidCoding = true;
			          	this.showOparateInfoBymes(true,'验证码已发送至您的邮箱！');
			            let time = 59;

			            let timer = setInterval(()=>{
			              this.validStateText = time +' 秒';
			              time --;
			              if(time < 0) {
			              	 this.validStateText = '再次获取';
			              	 this.isGetValidCoding = false;
			                 clearInterval(timer); 
			              }
			            }, 1000)  	
		          }else {
		          	this.showOparateInfoBymes(false,winResult.Description);
		          }
             }); 
	  	 }      

    },
    //绑定账号
    bindAccount() {
    	if(this.bindPhoneInput == '' || this.bindValidCodeInput == '') {
           this.showOparateInfoBymes(false,'手机邮箱或验证码不能为空！');
           return;
    	}

    	if(this.bindValidCodeInput.length !== 6) {
           this.showOparateInfoBymes(false,'验证码为6位数字！');
           return;
    	}


    	const reg=/^1[3|4|5|7|8][0-9]{9}$/;
        const myMail=/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
        
        if(this.bindPhoneInput.match(reg) == null&&this.bindPhoneInput.match(myMail)==null){
          this.showOparateInfoBymes(false,'请填写有效的电话或邮箱');	
          return;
        }

	   
	   if(env == 'dev') {
         this.$http.post("/passport/bindacount",{account:this.bindPhoneInput,userId:localStorage.getItem('userId'),validateCode:this.bindValidCodeInput})
		       .then((res)=>{
		       	  console.log(res.data)
		          if(res.data.Success) {
		          	 this.showOparateInfoBymes(true,'绑定成功！');
	                 this.getUserInfo();
		          }else {
		          	this.showOparateInfoBymes(false,res.data.Description);
		          }
		       })
		      .catch((err)=>{
		         console.log(err)
		      })  
	  	 }else if(env == 'prod') {
              ApiTransfer('post','/passport/bindacount',JSON.stringify({account:this.bindPhoneInput,userId:localStorage.getItem('userId'),validateCode:this.bindValidCodeInput}),(winResult)=>{
                  winResult=JSON.parse(winResult)

                  if(winResult.Success) {
		          	 this.showOparateInfoBymes(true,'绑定成功！');
	                 this.getUserInfo();
	                 this.reLogin();
		          }else {
		          	this.showOparateInfoBymes(false,winResult.Description);
		          }
             }); 
	  	 }      
    },

    //绑定第三方
    bindThird(index) {
    	var href = '';
      //修改窗口宽度
	    switch (index) {
	      case 0:
	        //微信
	        ChangeWindowProperty(650,500);
            Go3rdPartyOAuthBind(3);
	        href = "http://demo.api.borderland.kingchannels.cn/ThirdPartyPassport/Authorize?id=wechat&method=bind"+localStorage.getItem('userId');
	        break;
	      case 1:
	        //微博
	        ChangeWindowProperty(635,500);
	        Go3rdPartyOAuthBind(2);
	        href = 'http://demo.api.borderland.kingchannels.cn/ThirdPartyPassport/Authorize?id=weibo&method=bind'+localStorage.getItem('userId');
	        break;  
	      case 2:
	        //QQ
	        ChangeWindowProperty(635,560);
	        Go3rdPartyOAuthBind(1);
	        href = 'http://demo.api.borderland.kingchannels.cn/ThirdPartyPassport/Authorize?id=qq&method=bind'+localStorage.getItem('userId');
	        break;   
	      default:
	        // statements_def
	        break;
	    }
	    
	    location.href = href;
    },

    showOparateInfoBymes(isSuccess,oparateInfoText) {
       this.oparateInfoText = oparateInfoText;
       this.isSuccess = isSuccess;
       this.showOparateInfo = true;	

       if(this.showOparateInfoTimer) clearTimeout(this.showOparateInfoTimer);

       this.showOparateInfoTimer = setTimeout(()=>{
          this.showOparateInfo = false;
       }, 3000)
       
    },

    //每次提交了修改后就重新登录，刷新切换账号里的账号信息
    reLogin() {

    	// //如果修改成功，重新登录更新数据
        var allUserInfo = GetAllUser();
        allUserInfo = JSON.parse(allUserInfo);

        var data = {};
        var winResult = null;

        allUserInfo.forEach((item,index)=>{
            if(item.Id == localStorage.getItem('userId')) {
            	//这里要区分三方登录用户和非三方，非三方用openid登录
			    if(!item.MobileNumber && item.OpenId) {
			       //此时是第三方
			       data = {
			          openId:item.OpenId,
			          platformid:3
			       }

			       winResult = Login("post", "/passport/oauthLoginPC",JSON.stringify(data),'','',false,data.openId);

			    }else {
			       data = {
                    account:item.MobileNumber?item.MobileNumber:item.Email,
                    password:item.PassWord
                   }

			       winResult = Login('post','/passport/login',JSON.stringify(data),data.account,data.password,false,'');
			    }
            }
        })


 
      }

	},
  created() {
    //在created中进行激活码判断，因为有可能这个页面是在用户点击下的时候进入的，根据情况展示绑定手机号或绑定激活码
    if(localStorage.getItem('fromWhere')) {
       let fromWhere = localStorage.getItem('fromWhere');
       // fromWhere - '1' 手机用户，未绑定激活码   - '2' 第三方用户，去绑定手机号
       switch (fromWhere) {
       	case '1':
       		this.defaultIndex = 3;
       		this.showOparateInfoBymes(false,'您还未绑定激活码，请绑定！');
       		break;
       	case '2':
       		this.defaultIndex = 1;
       		this.showOparateInfoBymes(false,'您还未绑定手机/邮箱，请绑定！');
       		break;	
       	case '3':
       		this.defaultIndex = 3;
       		this.showOparateInfoBymes(false,'您未绑定激活码或激活码已过期！');
       		break;	
       	default:
       		// statements_def
       		break;
       }

       localStorage.removeItem('fromWhere');
    }
  },	
  mounted() {
  	// ShowDevTools();

  	this.getUserInfo(); 
  	window.onresize = () => {
        this.setWindow();
    }
  },
  updated() {
  	//解决验证码覆盖邮箱过长的bug
  	if(this.defaultIndex == 1) {
       this.$refs.getCodeInput.children[0].children[0].style.paddingRight = '100px';
  	}

  }	
}

</script>
<style scoped>
 .user-center-cont {
 	display: flex;
 	justify-content: center;
 	align-items: center;
 }

.user-center-main {
  width: 464px;
  height: 460px;
  border: 1px solid #ddd;
  background-color: #fff;
  display: flex;
  flex-flow: row;
  overflow: hidden;
}

.user-center-main .menu {
  width: 142px;
  border-right: 1px solid #dddddd;
}

.user-center-main .main {
  flex: 1;
  padding: 0 28px;
  position: relative;
}

.user-center-main .user-cover {
  height: 155px;
  border-bottom: 5px solid #f0f0f0;
}

.user-center-main .user-cover-main {
  height: 80px;
  width: 80px;
  margin: 0 auto 0;
  padding-top: 24px;

}

.user-center-main .user-cover-main img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.user-center-main .text-center {
  text-align: center;
  padding: 0;
  margin: 0;
}

.user-center-main .upload-btn {
  color: #2b579a;
  display: inline-block;
  margin-top: 10px;
  font-size: 15px;
  cursor: pointer;
}

.user-center-main .user-menu li {
  height: 36px;
  font-size: 14px;
  color: #333333;
  line-height: 36px;
  text-align: left;
  margin-bottom: 10px;
  padding-left: 30px;
  cursor: pointer;
}

.user-center-main .user-menu li:last-child {
  margin-bottom: 0;
}

.user-center-main .user-menu .selected {
  background-color: #2b579a;
  color: #fff;
}

.user-center-main .user-basic {
  font-size: 14px;
  color: #333333;
  padding-top: 10px;
  position: relative;
  height: 100%;
}

.user-center-main .user-basic .title {
  margin: 12px 0;
}

.user-center-main .el-input__inner {
  height: 44px;
}

.user-center-main .radio-group-sex{
	margin-top: 30px;
}

.user-center-main .el-radio{
	width: 120px;
}

.user-center-main .el-radio__label{
	padding-left: 23px;
	width: 100px;
}

.user-center-main .el-radio__input.is-checked .el-radio__inner{
	border-color: #2b579a;
	background-color: #fff;
}

.user-center-main .el-radio__inner::after{
	background-color: #2b579a;
	width: 10px;
	height: 10px;
}

.user-center-main .sumbit-btn{
	position: absolute;
	width: 100%;
	left: 0;
	bottom: 95px;
	/*padding: 15px;*/
	color: #2b579a;
	border-color: #2b579a;
	font-size: 18px;
}

.user-center-main .bind-phone-email{
	margin-top: 54px;
	position: relative;
	height: 100%;
}


.bind-phone-email input:nth-of-type(1) {
	padding-right: 91px !important;
}

.user-center-main .el-input+.el-input{
	margin-top: 10px;
}

.user-center-main .bind-phone-email .get-code{
	position: absolute;
	right: 15px;
	top: 8px;
	/*font-size: 12px;*/
	color: #2b579a;
	cursor: pointer;
}

.getting-code {
	color:red;
}

.has-bind-phone {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 340px;
}

.user-center-main .bind-three-parties{
	padding-top: 54px;
}

.user-center-main .bind-three-parties .each-line{
	display: -webkit-box;
	flex-flow: row;
	overflow: hidden;
	line-height: 32px;
	margin-bottom: 20px;
}

.each-line img {
	margin-top: 7px;
}

.user-center-main .bind-three-parties .each-line .each-line-bg{
	width: 20px;
}

.user-center-main .bind-three-parties .each-line-wx {
	height: 17px;
}

.user-center-main .bind-three-parties .each-line-qq {
	height: 20px;
}

.user-center-main .bind-three-parties .each-line-wb {
	height: 16px;
}

.user-center-main .bind-three-parties .each-line .each-line-bg img{
	width: 100%;
	height: 100%;
}

.user-center-main .bind-three-parties .each-line-title{
	padding-left: 18px;
	width: 60px;
}

.user-center-main .bind-three-parties .each-line-handle{
	flex: 1;
	text-align: right;
}

.user-center-main .bind-three-parties .each-line-handle .el-button{
	padding: 9px 12px;
	color: #2b579a;
	border-color: #2b579a;
}

.user-center-main .bind-code {
	padding-top: 54px;
	position: relative;
	height: 100%;
}

.user-center-main .bind-code .code-notice{
	display: flex;
	margin-top: 57px;
}

.user-center-main .bind-code .code-notice .cover{
	width: 58px;
	height: 100%;
}

.user-center-main .bind-code .code-notice .cover img{
	margin-left: 12px;
}

.user-center-main .bind-code .code-notice .notice-main{
	margin: 0;
	flex: 1;
}

.oparate-info {

	position: absolute;
	right: 50%;
	bottom: 125px;
	margin-right: -120px;
	text-align: center;
	width: 260px;
	height: 40px;
	font-size: 16px;
}

.oparate-info p {
	display: flex;
	justify-content: center;
	align-items: center;
}

.oparate-info img {
	margin-right: 10px;
}

.loading-other {
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.loading-other img {
	margin-bottom: 10px;
}


</style>
