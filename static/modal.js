(function(){

  openModal()
  // document.addEventListener('click', ()=>{
  //     CloseMenueStrip();
  // }, false)



  //关闭程序清除用户数据
  clearLocalStorage = function(type) {
      if(type == 1) {
          localStorage.removeItem('userId');
      }else if(type == -1) {
          localStorage.removeItem('searchArr');
      } 
  }

  //禁止这个页面的右键
  $('body').on('contextmenu',function(e){
     e.preventDefault();
  })

  // ShowDevTools();
  
  var isBC=false;//默认公元后
  var current =1;
  var totalcount=1;
  var pageSize=5;
  var totalPage=Math.ceil(totalcount/pageSize)
  var isMale = false;

  // var deviceInfo = JSON.parse(GetDeviceInfo());

  var isCloseAllWindowForLogin = false;
  //这个参数是用作从切换账号跳转过来的登录，需要关闭所有窗口
  
  //index - 窗口编号
  //bool - 登录窗口与切换账号窗口使用
  //err - 修改个人信息里激活码使用
	selectedModal = function(index,err,bool=false){
    if(bool) isCloseAllWindowForLogin = true;

		if(index==1){
	      $("#loginReg").modal("show")
           $("#login").show();
           $("#reg").hide();
           $("#exchangeUsers").hide();
           $("#checkUpdate").hide();
           $("#forgetPSD").hide();
           $("#updatePSD").hide();
           $("#title1").show();
           $("#title2").hide();
           // $("#title3").hide();
           // $("#title4").hide();
           
           
		}else if(index==2){
           $("#loginReg").modal("hide")
		       $("#annals").modal("show")
           $("#selectedAnnals").find("div").eq(0).addClass('wordActive').siblings().removeClass("wordActive");
           $("#annals1").show();
           $("#annals2").hide();
           $("#annals3").hide();
           $("#setPage").hide();
           $("#tbody").children().remove();
           $(".noContent").html();
		}else if(index==3){
          $("#loginReg").modal("hide")
          $("#annals").modal("hide")
          $("#updateInfo").modal("show");

          $('#activeCode').val('');
          //获取用户详情
            getUserInfo();

           if(err) {
            $('#updateInfoSuccess').hide();
            $('#activeCode').focus();
            $('#updateInfoFail').show();
            $('#updateInfoFail').find('span').text(err);
           } 
    }else if(index==4){
          //账户切换
           $("#loginReg").modal("show")
           $("#login").hide();
           $("#reg").hide();
           $("#exchangeUsers").show();
           $("#checkUpdate").hide();
           $("#forgetPSD").hide();
           $("#updatePSD").hide();
           $("#title1").hide();
           $("#title2").hide();
           // $("#title3").hide();
           var AllUser = GetAllUser();
           AllUser=JSON.parse(AllUser)
           renderUser(AllUser)
           // $("#title4").show();
    }else if(index==5){
           //检查更新
          $("#loginReg").modal("show")
           $("#login").hide();
           $("#reg").hide();
           $("#exchangeUsers").hide();
           $("#checkUpdate").show();
           $("#forgetPSD").hide();
           $("#updatePSD").hide();
           $("#title1").hide();
           $("#title2").hide();
           // $("#title3").hide();
           checkupdate();
           $('#updateProgress').hide();
           $('#progressText').hide();


           // $("#title4").hide();
    }else if(index==6){
           //修改密码
           $("#loginReg").modal("show")
           $("#login").hide();
           $("#reg").hide();
           $("#exchangeUsers").hide();
           $("#checkUpdate").hide();
           $("#forgetPSD").hide();
           $("#updatePSD").show();
           $("#title1").hide();
           $("#title2").hide();
           // $("#title3").show();
           // $("#title4").hide();
    }

	}



  //初始化所有密码框事件，不允许输入空格
  var pwdInputs = [];
      pwdInputs.push($("input[name='loginPass']"));
      pwdInputs.push($("input[name='regPass']"));
      pwdInputs.push($("input[name='regPass1']"));
      pwdInputs.push($("input[name='forgetPass']"));
      pwdInputs.push($("input[name='forgetPass1']"));
      pwdInputs.push($("input[name='updatePass']"));
      pwdInputs.push($("input[name='updatePass1']"));

      pwdInputs.forEach(function(item,index){
         $('#loginReg').on('keydown',$(item),function(e) {
            if(e.keyCode == 32) e.preventDefault();
         })
      })





  function renderUser(data){
    data.forEach(function(item,index){
      var userHTML=""
      if(item.Id == localStorage.userId){
        $(".account-cur").find('img').attr("src",item.UserFace=="http://api.borderland.kingchannels.cn:8100"?'./images/个人中心.png':item.UserFace);
        $(".account-cur").find('span').html(item.NickName);
      }else{
        
        var userFace=item.UserFace===""?'./images/个人中心.png':item.UserFace;

        var account =item.MobileNumber ?item.MobileNumber:(item.Email?item.Email:(item.OpenId?item.OpenId:''));
        var pwd = item.PassWord?item.PassWord:'';
// <img src="'+userFace+'">
        userHTML = '<div class="account-other account-other-hover"><img src="'+userFace+'"><span psd="'+pwd+'" MobileNumber="'+account+'">'+item.NickName+'</span><i class="del-user" userid="'+item.Id+'"> X </i></div>'
        $('.exchangeUsersCont').append($(userHTML));

      }
    })
    
  }

  
  //渲染删除按钮
  $('.exchangeUsersCont').on('mouseenter','.account-other-hover',function(){
     $(this).find('.del-user').show();
  }).on('mouseleave','.account-other-hover',function(){
     $(this).find('.del-user').hide();
  })


  //删除单个用户
  $('.exchangeUsersCont').on('click','.del-user',function(e){
     e.stopPropagation();
     var userid = parseInt($(this).attr('userid'));

     var isDeleted = DeleteUser(userid);

     if(isDeleted == 'OK') {
        $(this).parent().remove();
     }
  })
    



  $('.exchangeUsersCont').on('click','.account-other',function(){
     if($(this).hasClass("account-cur")){
        $(this).css('cursor','default');
        return
     };
    //切换账号

    var data = {};
    var winResult = null;
    //这里要区分三方登录用户和非三方，非三方用openid登录
    if($(this).find('span').attr('psd') === '') {
       //此时是第三方
       data = {
          openId:$(this).find('span').attr('MobileNumber'),
          platformid:3
       }

       var winResult = Login("post", "/passport/oauthLoginPC",JSON.stringify(data),'','',true,$(this).find('span').attr('MobileNumber'));

    }else {
       data = {
          account:$(this).find('span').attr('MobileNumber'),
          password:$(this).find('span').attr('psd'),
          // deviceid:deviceInfo.DeviceId
       }

       var winResult = Login('post','/passport/login',JSON.stringify(data),data.account,data.password,true,'');

       // if(winResult) return;
    }

    
      winResult=JSON.parse(winResult)
      $("input[name='loginSublime']").attr('disabled',false);
      if(winResult.Success){
          if(winResult.Data.State==1){   //State==1:为正常客户
                  $("#loginReg").modal("hide")
                  localStorage.setItem("userId",winResult.Data.Id);
                  localStorage.setItem("userInfo",JSON.stringify(winResult.Data));
                  // localStorage.setItem("userName",$(this).find('span').attr('MobileNumber'));
                  // localStorage.setItem("password",$(this).find('span').attr('psd'));
                  // ShowMessage('欢迎您,'+winResult.Data.NickName);
                   CloseForm();
            }else{
              console.log(winResult.Description)
              // ShowMessage(winResult.Description)
            }
          }else{
              
              $('#exchangeUserFail').css('display','flex');

              if(winResult.Description.indexOf('密码错误') != -1) {
                 $('#exchangeUserFail').find('span').text('密码错误，请重新登录！');
                 
                 setTimeout(()=>{
                    selectedModal(1,'',true);
                  }, 2000)
                 
              }else {
                 $('#exchangeUserFail').find('span').text(winResult.Description);
              }
              
              setTimeout(()=>{
                $('#exchangeUserFail').hide();
              }, 3000)
         }
    })



	//登录注册切换
	$("#title1").on("click",'span',function(){
		$("#title1").show();
		$("#title2").hide();
		$("#forgetPSD").hide()
		// $("#title3").hide();
		$("#updatePSD").hide()
		var inx =$("#title1").find("span").index($(this))
		$(this).addClass('active').siblings().removeClass('active');
		if(inx==0){
			$("#login").show();
			$("#reg").hide();
		}else{
			$("#login").hide();
			$("#reg").show();
  
		}
	})

	//跳转到忘记密码页面
	$("#goForgetPSD").on('click',function(){
		$("#forgetPSD").show()
		$("#title2").show();
		$("#title1").hide();
		$("#reg").hide();
		$("#login").hide();
		// $("#title3").hide();
		$("#updatePSD").hide();
    $("#loginForm  .has-feedback").find('input').val('');

	})

	//忘记密码返回登录
	$("#returnPage").on('click',function(){
		$("#title2").hide();
		$("#title1").show();
		$("#reg").hide();
		$("#login").show();
		$("#forgetPSD").hide()
		// $("#title3").hide();
		$("#updatePSD").hide()
	})
   

   //输入框的聚焦事件
    $('#loginForm').on('focus','input',function(e) {
        $('#loginSuccess').hide();
        $('#loginFail').hide();
    }) 

	//登录
	function  login(){
        if(env=="dev"){
            $.ajax({  
                url: baseUrl+"/passport/login",  
                type: "POST",  
                data: {
                  account:$("#loginForm").find("input[name='loginPhone']").val(),
                  password:hex_sha1($("#loginForm").find("input[name='loginPass']").val())
                },  
                success: function (res) {  
                  res=JSON.parse(res)
                  $("input[name='loginSublime']").attr('disabled',false);
                  if(res.Success){
                     if(res.Data.State==1){   //State==1:为正常客户
                        localStorage.setItem("userId",res.Data.Id);
                        $("#loginReg").modal("hide")
                      }else{
                       ShowMessage(res.Description)
                      }
                  }else{
                      ShowMessage(res.Description)
                  }
                } 
            }); 
        }else if(env=="prod"){
          var data = {
              account:$("input[name='loginPhone']").val(),
              password:hex_sha1($("input[name='loginPass']").val()),
              // deviceid:deviceInfo.DeviceId
          }


            var winResult = Login('post','/passport/login',JSON.stringify(data),$("input[name='loginPhone']").val(),hex_sha1($("input[name='loginPass']").val()),isCloseAllWindowForLogin,'');
            
            if(winResult == '') {
               $('#loginSuccess').hide();
               $('#loginFail').show();
               $('#loginFail').find('span').text('网络不好，请稍后再试！');
               $("input[name='loginSublime']").attr('disabled',false);
               return;
            }

            console.log(winResult);
            // var winResult = Login('post','/passport/login','account='+$("input[name='loginPhone']").val()+'&password='+hex_sha1($("input[name='loginPass']").val()),$("input[name='loginPhone']").val(),hex_sha1($("input[name='loginPass']").val()));
            winResult=JSON.parse(winResult)
            $("input[name='loginSublime']").attr('disabled',false);
            if(winResult.Success){
                if(winResult.Data.State==1){   //State==1:为正常客户
                    // $("#loginReg").modal("hide")
                    $('#loginSuccess').show();
                    $('#loginFail').hide();
                    localStorage.setItem("userId",winResult.Data.Id);
                    localStorage.setItem("userInfo",JSON.stringify(winResult.Data));
                    // localStorage.setItem("userName",$("input[name='loginPhone']").val());
                    // localStorage.setItem("passWord",hex_sha1($("input[name='loginPass']").val()));
                    // ShowMessage('欢迎您,'+winResult.Data.NickName);
                     var t = setTimeout("CloseForm()",1200);
                  }else{
                     $('#loginSuccess').hide();
                     $('#loginFail').show();
                     $('#loginFail').find('span').text(winResult.Description);
                  }
              }else{
                     $('#loginSuccess').hide();
                     $('#loginFail').show();
                     $('#loginFail').find('span').text(winResult.Description);
              }

            isCloseAllWindowForLogin = false;  
        }
		 
	}

	//第三方登录
	$(".iconImg").on("click",'a',function(e){
    e.preventDefault();
    var index = $(this).index();
    //修改窗口宽度
    switch (index) {
      case 0:
        //微信
        ChangeWindowProperty(650,500);
        break;
      case 1:
        //微博
        ChangeWindowProperty(635,500);
        break;  
      case 2:
        //QQ
        ChangeWindowProperty(635,560);
        break;   
      default:
        // statements_def
        break;
    }
    
    location.href = $(this).attr('href');
	})



	var remainTime=10;
	var regPhone =$("input[name='regPhone']").val();
	var forgetPhone =$("input[name='forgetPhone']").val();
		
	//获取验证码 -注册页面
	getCode = function(phoneValue){
		var reg=/^1[3|4|5|7|8][0-9]{9}$/;
    var myMail=/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
    
         if(phoneValue.match(reg)==null&&phoneValue.match(myMail)==null){
          regInfo(false,"请填写有效的电话或邮箱!");

         }else{
           $(".getCodeCSS").attr({"disabled":"disabled"}).css("background",'#eee')
        	if(phoneValue.indexOf("@")!=-1){  //验证邮箱
           		getMailCode(phoneValue,1);
            }else{   //验证手机
                if(env=="dev"){
                    $.ajax({  
                        url: baseUrl+"/user/checkphonenumber",  
                        type: "POST",  
                        data: {
                            phonenumber:phoneValue
                        },  
                        success: function (res) {  
                            res = eval('(' + res + ')')
                              if(res.Success){ 
                              ShowMessage('该用户已注册，请直接登录');
                              $(".getCodeCSS").css("background",'#fff').attr("disabled",false)
                           }else{  //发送验证码
                                remainTime=60;
                                timer = setInterval(reduceTime,1000)
                                $(".showWord").show();

                                getPhoneCode(phoneValue,1)
                            }
                         } 
                    });  
                }else if(env=="prod"){

                    var data = {
                        phonenumber:phoneValue
                    }

                    //下面是配合winform异步获取数据
                    ApiTransfer('post','/user/checkphonenumber',JSON.stringify(data),(winResult)=>{
                        winResult=JSON.parse(winResult)
                        if(winResult.Success){
                           $(".getCodeCSS").attr({"disabled":false}).css("background",'#fff');
                           
                           regInfo(false,"该用户已注册，请直接登录");
                        }else{  //发送验证码
                            remainTime=60;
                            timer = setInterval(reduceTime,1000)
                            
                             
                            $('#regSuccess').show();
                            $('#regSuccess').find('span').text('验证码已发送至您的手机！');
                            $('#regFail').hide();
                            // regInfo(true,"验证码已发到该手机/该邮箱，请查收",1);

                            getPhoneCode(phoneValue,1)
                        }
                    });


                }
          		
          }
        }
	}

	//获取验证码 -修改密码忘记密码
	getCode1 = function(phoneValue,type){
	     	var reg=/^1[3|4|5|7|8][0-9]{9}$/;
        var myMail=/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
         if(phoneValue.match(reg)==null&&phoneValue.match(myMail)==null){
             forgetOrUpdatePwdInfo(type,'请填写有效的电话或邮箱');
         }else{
            $(".getCodeCSS").attr({"disabled":"disabled"}).css("background",'#eee')
        	  if(phoneValue.indexOf("@")!=-1){  //验证邮箱
           		 getMailCode(phoneValue,type);
            }else{   //验证手机
                if(env=="dev"){
                    $.ajax({  
                        url: baseUrl+"/user/checkphonenumber",  
                        type: "POST",  
                        data: {
                            phonenumber:phoneValue
                        },  
                        success: function (res) {  
                            res = eval('(' + res + ')')
                          if(!res.Success){ 
                            forgetOrUpdatePwdInfo(type,'该用户还未注册');
                            $(".getCodeCSS").css("background",'#fff').attr("disabled",false)

                           }else{  //发送验证码
                                remainTime=60;
                                timer = setInterval(reduceTime,1000)
                                $(".showWord").show();
                                getPhoneCode(phoneValue,type);  //0-未知，1-注册，2-找回密码，3-修改密码，4-修改手机，5-系统通知"
                                
                           }
                        } 
                    });  
                }else if(env=="prod"){
                   //  var winResult = ApiTransfer('post','/user/checkphonenumber','phonenumber='+phoneValue);
                   //  winResult=JSON.parse(winResult)
                   //  if(!winResult.Success){ 
                   //      ShowMessage('该用户还未注册');
                   //      $(".getCodeCSS").css("background",'#fff').attr("disabled",false)
                   //  }else{  //发送验证码
                   //      remainTime=60;
                   //      timer = setInterval(reduceTime,1000)
                   //      $(".showWord").show();
                   //      getPhoneCode(phoneValue,2);  //0-未知，1-注册，2-找回密码，3-修改密码，4-修改手机，5-系统通知"
                        
                   // }

                   var data = {
                       phonenumber:phoneValue
                   }

                   //下面是配合winform异步获取数据
                    ApiTransfer('post','/user/checkphonenumber',JSON.stringify(data),(winResult)=>{
                        winResult=JSON.parse(winResult)
                        if(!winResult.Success){ 
                            forgetOrUpdatePwdInfo(type,'该用户还未注册');
                            $(".getCodeCSS").css("background",'#fff').attr("disabled",false)
                        }else{  //发送验证码
                            remainTime=60;
                            timer = setInterval(reduceTime,1000)
                            // $(".showWord").show();

                            $('#forgetSuccess').show();
                            $('#forgetSuccess').find('span').text('验证码已发送至您的手机！');
                            $('#forgetFail').hide();

                            $('#updateSuccess').show();
                            $('#updateSuccess').find('span').text('验证码已发送至您的手机！');
                            $('#updateFail').hide();

                            getPhoneCode(phoneValue,type);  //0-未知，1-注册，2-找回密码，3-修改密码，4-修改手机，5-系统通知"
                            
                       }
                    });
                }
          		
            }
        }
	}
	
	  //获取验证码倒计时
     function  reduceTime(){
        if(remainTime<1){
          remainTime=0;
          clearInterval(timer)
           $(".getCodeCSS").attr({"disabled":false}).css("background",'#fff')
          $(".getCodeCSS").val('重新获取验证码');
          $(".showWord").hide();
        }else{
          remainTime=remainTime-1;
          $(".getCodeCSS").val(remainTime+'秒');
        }
     }

     //手机请求验证码
     function getPhoneCode(phoneValue,type){
        if(env=="dev"){
            $.ajax({  
                url: baseUrl+"/sms/send",  
                type: "POST",  
                data: {
                    phonenumber:phoneValue,
                    type:type
                },  
                success: function (res) {  
                    res = eval('(' + res + ')');
                  if(!res.Success){ 
                    ShowMessage(res.data.Description)
                    }
                } 
            });  
        }else if(env=="prod"){
            // var winResult = ApiTransfer('post','/sms/send','type='+type+"&phonenumber="+phoneValue);
            // winResult=JSON.parse(winResult)
            // if(!winResult.Success){ 
            //     ShowMessage(winResult.Description)
            // }
            
            var data = {
                type:type,
                phonenumber:phoneValue
            }
            //下面是配合winform异步获取数据
            ApiTransfer('post','/sms/send',JSON.stringify(data),(winResult)=>{
                winResult=JSON.parse(winResult)
                if(!winResult.Success){ 
                    forgetOrUpdatePwdInfo(type,winResult.Description);
                }else {

                }
            });
        }
     	
     }

     //邮箱请求验证码
     function getMailCode(phoneValue,type){
        if(env=="dev"){
            $.ajax({  
                url: baseUrl+"/email/send",  
                type: "POST",  
                data: {
                    type:type,
                    email:phoneValue
                },  
                success: function (res) {  
                    res = eval('(' + res + ')');
                    if(res.Success){ 
                        remainTime=60;
                        timer = setInterval(reduceTime,1000)
                        $(".getCodeCSS").html(remainTime+'秒');
                        $(".showWord").show();
                    }else{
                        ShowMessage(res.Description);
                    }
                } 
            });
        }else if(env=="prod"){
            // var winResult = ApiTransfer('post','/email/send','type='+type+'&email='+phoneValue);
            // winResult=JSON.parse(winResult)
            // if(winResult.Success){ 
            //     remainTime=60;
            //     timer = setInterval(reduceTime,1000)
            //     $(".getCodeCSS").html(remainTime+'秒');
            //     $(".showWord").show();
            // }else{
            //     ShowMessage(winResult.Description)
            // }
            var data = {
                type:type,
                email:phoneValue
            }

            //下面是配合winform异步获取数据
            ApiTransfer('post','/email/send',JSON.stringify(data),(winResult)=>{
                winResult=JSON.parse(winResult)
                if(winResult.Success){ 
                    remainTime=60;
                    timer = setInterval(reduceTime,1000)
                    $(".getCodeCSS").html(remainTime+'秒');
                    $(".showWord").hide();

                      $('#regSuccess').show();
                      $('#regSuccess').find('span').text('验证码已发送至您的邮箱！');
                      $('#regFail').hide();

                      $('#forgetSuccess').show();
                      $('#forgetSuccess').find('span').text('验证码已发送至您的邮箱！');
                      $('#forgetFail').hide();

                      $('#updateSuccess').show();
                      $('#updateSuccess').find('span').text('验证码已发送至您的邮箱！');
                      $('#updateFail').hide();

                }else{
                    regInfo(false,winResult.Description);
                    forgetOrUpdatePwdInfo(type,winResult.Description);
                    $(".getCodeCSS").css("background",'#fff').attr("disabled",false);
                }
            });
        }
    }
  

  //显示修改失败信息
  function forgetOrUpdatePwdInfo(type,text) {
      switch (type) {
        case 2:
          $('#forgetShowWord').hide();
          $('#forgetSuccess').hide();
          $('#forgetFail').show();
          $('#forgetFail').find('span').text(text);
          break;
        case 3:
          $('#updateShowWord').hide();
          $('#updateSuccess').hide();
          $('#updateFail').show();
          $('#updateFail').find('span').text(text);
          break;  
        default:
          // statements_def
          break;
      }
  }  


  //输入框的聚焦事件
  $('#regForm').on('focus','input',function(e) {
         $('#regSuccess').hide();
         $('#regFail').hide();
  }) 

	//注册
	function  register(){
        //因为特殊原因，单独验证两次密码是否一致
        if($("input[name='regPass']").val() != $("input[name='regPass1']").val()) {
            regInfo(false,'两次密码不一致');
            $("input[name='regSublime']").attr('disabled',false);
            return;
        }

        if(env=="dev"){
            $.ajax({  
                url: baseUrl+"/passport/register",  
                type: "POST",  
                data: {
                    account:$("#regForm").find("input[name='regPhone']").val(),
                    password:hex_sha1($("#regForm").find("input[name='regPass']").val()),
                    validatecode:$("#regForm").find("input[name='regCode']").val(),
                    activatedcode:$("#activeCode").val()
               },  
                success: function (res) {  
                    res = eval('(' + res + ')');
                    $("input[name='regSublime']").attr('disabled',false);
                    if(!res.Success){
                        ShowMessage(res.Description)
                    }else{
                        ShowMessage(res.Description)
                        $("#title1").show();
                        $("#login").show();
                        $("#title2").hide();
                        $("#reg").hide();
                        $("#forgetPSD").hide();
                        // $("#title3").hide();
                        $("#updatePSD").hide()
                        $("#loginPhone").val($("input[name='regPhone']").val());
                    }
                  
                } 
            });  
        }else if(env=="prod"){

            var pass = $("input[name='regPass']").val();
            var reg = /\/s/g;
            var newPass = pass.replace(reg,'');
            var data = {
                account:$("#regPhone").val(),
                password:hex_sha1(newPass),
                validatecode:$("input[name='regCode']").val(),
                activatedcode:$("input[name='codeNumber']").val()
            }

            console.log(data)

            //下面是配合winform异步获取数据
            ApiTransfer('post','/passport/register',JSON.stringify(data),(winResult)=>{
                  winResult=JSON.parse(winResult)
                   $("input[name='regSublime']").attr('disabled',false);
                  if(!winResult.Success){

                      regInfo(false,winResult.Description);
                  }else{
                      
                      regInfo(true);

                      setTimeout(()=>{
                         OpenLoginForm();
                         CloseForm();

                         // $("#title1").find("span").eq(0).addClass('active');
                         // $("#title1").find("span").eq(1).removeClass('active');

                         // $("#title1").show();
                         // $("#login").show();
                         // $("#title2").hide();
                         // $("#reg").hide();
                         // $("#forgetPSD").hide();
                         // // $("#title3").hide();
                         // $("#updatePSD").hide()
                         // $("#loginPhone").val($("#regPhone").val());
                         
                         // //清空注册框
                         // $("#regPhone").val('');
                         // $("input[name='regPass']").val('');
                         // $("input[name='regPass1']").val('');
                         // $("input[name='regCode']").val('');
                         // $("input[name='codeNumber']").val('');

                          // 销毁注册验证
                          // $("#regForm").data('bootstrapValidator').destroy();
                          // $('#regForm').data('bootstrapValidator', null);
                          // formValidator();
                      }, 2000)
                  }
            });


        }
		
	}

  function regInfo(result,text='注册成功！',type) {
      if(type) {
         $("#regShowWord").hide();
         return;
      }

      if(result) {
         $("#regShowWord").hide();
         $('#regSuccess').show();
         $('#regSuccess').find('span').text(text);
         $('#regFail').hide();
      }else {
         $("#regShowWord").hide();
         $('#regSuccess').hide();
         $('#regFail').show();
         $('#regFail').find('span').text(text);
      }
  }

  
  //输入框的聚焦事件
  $('#forgetForm').on('focus','input',function(e) {
         $('#forgetSuccess').hide();
         $('#forgetFail').hide();
  }) 

  //输入框的聚焦事件
  $('#updateForm').on('focus','input',function(e) {
         $('#updateSuccess').hide();
         $('#updateFail').hide();
  }) 


	//忘记密码修改密码
	function  updatePassWord(phone,code,pass,type){ //type為2忘記密碼，3為修改密碼
      var reg = /\/s/g;
      var fPass = $("#forgetPass").val(); 
      var fNewPass = fPass.replace(reg,'');

      var fPass1 = $("#forgetPass1").val(); 
      var fNewPass1 = fPass1.replace(reg,'');

      var uPass = $("#updatePass").val(); 
      var uNewPass = uPass.replace(reg,'');

      var uPass1 = $("#updatePass1").val(); 
      var uNewPass1 = uPass1.replace(reg,'');
      console.log(uNewPass,uNewPass1) 
    if(type==2){
        if(fNewPass!=fNewPass1){
          forgetOrUpdatePwdInfo(type,'两次密码不一致');
          $("input[name='forgetSublime']").attr('disabled',false);
        }else{
           fun1(phone,code,pass,type)
        }
    }else if(type==3){
       if(uNewPass!=uNewPass1){
          forgetOrUpdatePwdInfo(type,'两次密码不一致');
          $("input[name='updateSublime']").attr('disabled',false);
        }else{
           fun1(phone,code,pass,type)
        }
    }
   
		
	}

  function fun1(phone,code,pass,type){
        if(env=="dev"){
            $.ajax({  
                url: baseUrl+"/passport/resetpassword",  
                type: "POST",  
                data: {
                    account:phone,
                    type:type,
                    password:hex_sha1(pass),
                    validatecode:code
                },  
                success: function (res) {  
                    res = eval('(' + res + ')');
                     $("input[name='forgetSublime']").attr('disabled',false);
                     $("input[name='updateSublime']").attr('disabled',false);
                    if(!res.Success){
                        forgetOrUpdatePwdInfo(type,res.Description);
                    }else{
                        ShowMessage(res.Description);
                        $("#loginReg").modal("hide");
                    }
                  
                } 
            });  
        }else if(env=="prod"){
            // var winResult = ApiTransfer('post','passport/resetpassword','account='+phone+'&type=2&password='+hex_sha1(pass)+'&validatecode='+code);
            // winResult=JSON.parse(winResult)
            //  $("input[name='forgetSublime']").attr('disabled',false);
            //  $("input[name='updateSublime']").attr('disabled',false);
            // if(!winResult.Success){
            //     ShowMessage(winResult.Description)
            // }else{
            //     ShowMessage(winResult.Description);
            //     CloseForm();
            // }
            var reg = /\/s/g;
            var newPass = pass.replace(reg,'');

            var data = {
                account:phone,
                type:type,
                password:hex_sha1(newPass),
                validatecode:code
            }


            //下面是配合winform异步获取数据
            ApiTransfer('post','passport/resetpassword',JSON.stringify(data),(winResult)=>{
                winResult=JSON.parse(winResult)
                 $("input[name='forgetSublime']").attr('disabled',false);
                 $("input[name='updateSublime']").attr('disabled',false);
                if(!winResult.Success){
                    forgetOrUpdatePwdInfo(type,winResult.Description);
                }else{

                    switch (type) {
                        case 2:
                          $('#forgetShowWord').hide();
                          $('#forgetSuccess').show();
                          $('#forgetSuccess').find('span').text('修改成功！');
                          $('#forgetFail').hide();
                          break;
                        case 3:
                          $('#updateShowWord').hide();
                          $('#updateSuccess').show();
                          $('#updateSuccess').find('span').text('修改成功！');
                          $('#updateFail').hide();
                          
                          break;  
                        default:
                          // statements_def
                          break;
                      }
                     
                     var t = setTimeout(()=>{
                            CloseForm();
                      },2000);
                      
                  }
            });
        }
  }
    // function successTime(){
    //         $("#loginReg").modal("show");
    //         $("#login").show();
    //         $("#updatePSD").hide();
    //         var t = setTimeout("successTime()",1000);
    // }
	// 验证登录
	$("#loginForm").bootstrapValidator({
　　　　message: 'This value is not valid',
        feedbackIcons: {
　　　　　　　　valid: 'glyphicon glyphicon-ok',
　　　　　　　　invalid: 'glyphicon glyphicon-remove',
// 　　　　　　　　validating: 'glyphicon glyphicon-refresh'
　　　　　　　　   },
        fields: {
            loginPhone: {
                validators: {
                      callback: {
                            message: '请填写有效的电话或邮箱',
                            callback: function(value, validator) {
                             var reg =  /^1[3|4|5|7|8][0-9]{9}$/;
                             var myMail =/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
                             var items = $("#loginForm").find("input[name='loginPhone']").val();
                             if(items.match(reg)==null&&items.match(myMail)==null){
                             	return false;
                             }else{
                             	return true;
                             }
                         }
                    }
                }
            },
            loginPass: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    },
                     numeric: {
                            message: '密码只能为数字'
                    },
                    stringLength: {
                            min: 6,
                            message: '密码至少6位数'
                        },
                  
                }
            }
        }
    })
    .on('success.form.bv', function(e) {
    	   e.preventDefault();
    	   login()
    })

	// 验证注册
	$("#regForm").bootstrapValidator({
　　　　message: 'This value is not valid',
        feedbackIcons: {  
　　　　　　　　valid: 'glyphicon glyphicon-ok',   
　　　　　　　　invalid: 'glyphicon glyphicon-remove',  
　　　　　　　　validating: 'glyphicon glyphicon-refresh'  
　　　　　　　　   },
        fields: {    
            regPhone: {
                validators: {
                      callback: {
                            message: '请填写有效的电话或邮箱',
                            callback: function(value, validator) {
                             var reg =  /^1[3|4|5|7|8][0-9]{9}$/;
                             var myMail =/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
                               var items = $("#regForm").find("input[name='regPhone']").val();
                             if(items.match(reg)==null&&items.match(myMail)==null){
                             	return false;
                             }else{
                             	return true;
                             }
                         }
                    }
                }
            },
            regCode: {
                validators: {
                    notEmpty: {
                        message: '验证码不能为空'
                    },
                    stringLength: {
                            min: 6,
                            max: 6,
                            message: '请输入6位数的验证码'
                        },
                }
            },
            regPass: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    },
                    stringLength: {
                            min: 6,
                            max: 12,
                            message: '密码为6-12位数字'
                        },
                   numeric: {
                            message: '密码只能为数字'
                    }  
                }
            },
            // regPass1: {
            //     validators: {
            //     	notEmpty: {
            //             message: '密码不能为空'
            //         },
            //     	//  identical:{
            //     	// 	 field: 'regPass',//需要进行比较的input name值
            //      //     	 message: '两次密码不一致'
            //     	// },
            //       numeric: {
            //                 message: '密码只能为数字'
            //         } 
            //     }
            // }
        }
    })
    .on('success.form.bv', function(e) {
	   e.preventDefault();
    	register()
    })

    //忘记密码
    $("#forgetForm").bootstrapValidator({
　　　　message: 'This value is not valid',
        feedbackIcons: {  
　　　　　　　　valid: 'glyphicon glyphicon-ok',   
　　　　　　　　invalid: 'glyphicon glyphicon-remove',  
　　　　　　　　validating: 'glyphicon glyphicon-refresh'  
　　　　　　　　   },
        fields: {    
            forgetPhone: {
                validators: {
                      callback: {
                            message: '请填写有效的电话或邮箱',
                            callback: function(value, validator) {
                             var reg =  /^1[3|4|5|7|8][0-9]{9}$/;
                             var myMail =/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
                               var items = $("#forgetForm").find("input[name='forgetPhone']").val();
                             if(items.match(reg)==null&&items.match(myMail)==null){
                             	return false;
                             }else{
                             	return true;
                             }
                         }
                    }
                }
            },
            forgetCode: {
                validators: {
                    notEmpty: {
                        message: '验证码不能为空'
                    },
                    stringLength: {
                            min: 6,
                            max: 6,
                            message: '请输入6位数的验证码'
                        },
                }
            },
            forgetPass: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    },
                    stringLength: {
                            min: 6,
                            max:12,
                            message: '密码为6-12位数字'
                        },
                  numeric: {
                            message: '密码只能为数字'
                    } 
                }
            },
            // forgetPass1: {
            //     validators: {
            //     	notEmpty: {
            //             message: '密码不能为空'
            //         },
            //     	//  identical:{
            //     	// 	 field: 'psdPass',//需要进行比较的input name值
            //      //     	 message: '两次密码不一致'
            //     	// },
            //       numeric: {
            //                 message: '密码只能为数字'
            //         } 
            //     }
            // }
        }
    })
    .on('success.form.bv', function(e) {
	   e.preventDefault();
    	updatePassWord($("#forgetPhone").val(),$("#forgetCode").val(),$("#forgetPass").val(),2)
    })

     //修改密码
    $("#updateForm").bootstrapValidator({
　　　　message: 'This value is not valid',
        feedbackIcons: {  
　　　　　　　　valid: 'glyphicon glyphicon-ok',   
　　　　　　　　invalid: 'glyphicon glyphicon-remove',  
　　　　　　　　validating: 'glyphicon glyphicon-refresh'  
　　　　　　　　   },
        fields: {    
            updatePhone: {
                validators: {
                      callback: {
                            message: '请填写有效的电话或邮箱',
                            callback: function(value, validator) {
                             var reg =  /^1[3|4|5|7|8][0-9]{9}$/;
                             var myMail =/^[A-z0-9_]{3,12}@[A-z0-9]{2,12}(\.com|\.cn|\.com\.cn)$/;
                             var items = $("#updateForm").find("input[name='updatePhone']").val();

                             if(items.match(reg)==null&&items.match(myMail)==null){
                             	return false;
                             }else{
                             	return true;
                             }
                         }
                    }
                }
            },
            updateCode: {
                validators: {
                    notEmpty: {
                        message: '验证码不能为空'
                    },
                    stringLength: {
                            min: 6,
                            max: 6,
                            message: '请输入6位数的验证码'
                        },
                }
            },
            updatePass: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    },
                    stringLength: {
                            min: 6,
                            max:12,
                            message: '密码为6-12位数字'
                        },
                   numeric: {
                            message: '密码只能为数字'
                    } 
                }
            },
            // updatePass1: {
            //     validators: {
            //     	notEmpty: {
            //             message: '密码不能为空'
            //         },
            //     	//  identical:{
            //     	// 	 field: 'updatePass',//需要进行比较的input name值
            //      //     message: '两次密码不一致'
            //     	// },
            //       numeric: {
            //            message: '密码只能为数字'
            //       } 
            //     }
            // }
        }
    })
    .on('success.form.bv', function(e) {
	    e.preventDefault();
    	updatePassWord($("#updatePhone").val(),$("#updateCode").val(),$("#updatePass").val(),3)
    })



    //纪年换算
    ADtoCanlendar = function(index){
       $("#tbody").children().remove();
        $("#setPage").hide();
        $(".inputBob1").val("");
        $(".noContent").html("");
    	if(index==1){
    		$("#selectedAnnals").find("div").eq(0).addClass('wordActive').siblings().removeClass("wordActive");
    		$("#annals1").show();
           $("#annals2").hide();
    		$("#annals3").hide();
    	}else if(index==2){
    		$("#selectedAnnals").find("div").eq(1).addClass('wordActive').siblings().removeClass("wordActive");
    		$("#annals2").show();
           $("#annals1").hide();
    		$("#annals3").hide();
    	}else if(index==3){
          $("#selectedAnnals").find("div").eq(2).addClass('wordActive').siblings().removeClass("wordActive");
          $("#annals3").show();
          $("#annals1").hide();
          $("#annals2").hide();
      }

       current = 1;
    }

    //输入框的enter事件
    $('#importYear').on('keyup',function(e) {
        if(e.keyCode == 13) {
            changeYear1Method(current);
        }
    })

    $('#importYear').on('focus',function(){
        $('#bcToReInput').hide();
    })

    //公元纪年到年号纪年
    changeYear1 = function(changeCur = 1){
        if($('#importYear').val() == '') {
           $('#bcToReInput').show();
           $('#bcToReInput').text('请输入公元纪年！');
           return;
        }else if($('#importYear').val() <= 0) {
           $('#bcToReInput').show();
           $('#bcToReInput').text('请输入正整数！');
           return;
        }
       // $("#tbody").children().remove();
       current = changeCur;
      if($.trim($("#importYear").val())==""){
        ShowMessage("请输入公元纪年！")
      }else{
        if(env=="dev"){
             $.ajax({  
                url: baseUrl+"/annal/annalconvert",  
                type: "GET",  
                data: {
                  type:1,
                  year:$("#importYear").val(),
                  isbc:isBC
                },  
                success: function (res) {  
                  res = eval('(' + res + ')');
                  if(res.Success){
                    renderTable(res.Data.ItemList);
                      $("#showHistory1").html(res.Data.Period)
                    if(res.Data.ItemList.length>0){
                        $("#branches1").html(res.Data.ItemList[0].Branches)
                      }else{
                        $("#branches1").html('')
                      }
                    if(res.Data.RecordCount>10){
                      $("#setPage").show();

                       totalcount=res.Data.RecordCount
                      totalPage=Math.ceil(totalcount/pageSize)
                      setPage(current, totalPage, 'pages', 'changeYear1');
                      $("#curpage").html(current);
                      $("#totalpage").html(totalPage)
                    }else{
                       $("#setPage").hide();
                    }
                  }
                } 
            });
        }else if(env=="prod"){
          // var winResult = ApiTransfer('get','/annal/annalconvert','type=1&year='+$("#importYear").val()+'&isbc='+isBC);
          // winResult=JSON.parse(winResult)
          // if(winResult.Success){
          //     renderTable(winResult.Data.ItemList);
          //      $("#showHistory1").html(winResult.Data.Period)
          //     if(winResult.Data.ItemList.length>0){
          //       $("#branches1").html(winResult.Data.ItemList[0].Branches)
          //     }else{
          //       $("#branches1").html('')
          //     }
          //     if(winResult.Data.RecordCount>10){
          //       $("#setPage").show();
          //        totalcount=winResult.Data.RecordCount
          //       totalPage=Math.ceil(totalcount/pageSize)
          //       setPage(current, totalPage, 'pages', 'changeYear1');
          //       $("#curpage").html(current);
          //       $("#totalpage").html(totalPage)
          //     }else{
          //        $("#setPage").hide();
          //     }
          // }else{
          //   ShowMessage(winResult.Description)
          // }
          
            changeYear1Method(current);

        }
       
      }
    }

    function changeYear1Method(current) {
        var data = {
                type:1,
                year:$("#importYear").val(),
                isbc:isBC,
                ps:pageSize,
                cp:current
            }

          //下面是配合winform异步获取数据
        ApiTransfer('get','/annal/annalconvert',JSON.stringify(data),(winResult)=>{
            winResult=JSON.parse(winResult)
            if(winResult.Success){
                renderTable(winResult.Data.ItemList);
                 $("#showHistory1").html(winResult.Data.Period)
                if(winResult.Data.ItemList.length>0){
                  $("#branches1").html(winResult.Data.ItemList[0].Branches)
                }else{
                  $("#branches1").html('')
                }
                if(winResult.Data.RecordCount>pageSize){
                  $("#setPage").show();
                   totalcount=winResult.Data.RecordCount
                  totalPage=Math.ceil(totalcount/pageSize)
                  setPage(current, totalPage, 'pages', 'changeYear1');
                  $("#curpage").html(current);
                  $("#totalpage").html(totalPage)
                }else{
                   $("#setPage").hide();
                }
            }else{
               $('#bcToReInput').show();
               $('#bcToReInput').text(winResult.Description);
            }

        });
    }


    //输入框的enter事件
    $('#importYear1').on('keyup',function(e) {
        if(e.keyCode == 13) {
            changeYearMethod(current);
        }
    })

    //输入框的聚焦事件
    $('#importYear1').on('focus',function(e) {
        $('#reToBcInput').hide();
    })

    
    // 显示年号纪年到公元纪年
    changeYear = function(changeCur = 1){
        if($('#importYear1').val() == '') {
           $('#reToBcInput').show();
           $('#reToBcInput').text('请输入年号！');
           return;
        }else if($('#importYear1').val() <= 0) {
           $('#reToBcInput').show();
           $('#reToBcInput').text('请输入正整数！');
           return;
        }

        current = changeCur;
        // $("#tbody").children().remove();
    		if($.trim($("#importYear1").val())==""){
    			ShowMessage("请输入年号！")
    		}else{
            if(env=="dev"){
              $.ajax({  
                    url: baseUrl+"/annal/annalconvert",  
                    type: "GET",  
                    data: {
                       type:2,
                       regin:numTransition($("#importYear1").val()).regin,
                       num:numTransition($("#importYear1").val()).num,
                       ps:pageSize,
                       cp:current
                    },  
                    success: function (res) {  
                      res = eval('(' + res + ')');
                      if(res.Success){
                          renderTable(res.Data.ItemList);
                          $("#showHistory2").html("");
                          $("#branches2").html("");
                          if(res.Data.RecordCount>10){
                            $("#setPage").show();
                            totalcount = res.Data.RecordCount
                            totalPage = Math.ceil(totalcount/pageSize)
                            setPage(current, totalPage, 'pages', 'changeYear');
                            $("#curpage").html(current);
                            $("#totalpage").html(totalPage)
                          }else{
                             $("#setPage").hide();
                          }
                      }
                    } 
                });
            }else if(env=="prod"){
              // var winResult = ApiTransfer('get','/annal/annalconvert',
              //   'type=2&regin='+numTransition($("#importYear1").val()).regin+'&num='+numTransition($("#importYear1").val()).num+'&ps='+pageSize+'&cp='+current);
              // winResult=JSON.parse(winResult)
              // if(winResult.Success){
              //     renderTable(winResult.Data.ItemList);
              //     $("#showHistory2").html("");
              //     $("#branches2").html("");
              //     if(winResult.Data.RecordCount>10){
              //       $("#setPage").show();
              //       totalcount=winResult.Data.RecordCount
              //       totalPage=Math.ceil(totalcount/pageSize)
              //       setPage(current, totalPage, 'pages', 'changeYear');
              //       $("#curpage").html(current);
              //       $("#totalpage").html(totalPage)
              //     }else{
              //        $("#setPage").hide();
              //     }
              // }
              
              changeYearMethod(current)
            }
		    }
    }

    function changeYearMethod(current) {
        var data = {
                type:2,
                regin:numTransition($("#importYear1").val()).regin,
                num:numTransition($("#importYear1").val()).num,
                ps:pageSize,
                cp:current
            }

        //下面是配合winform异步获取数据
        ApiTransfer('get','/annal/annalconvert',JSON.stringify(data),(winResult)=>{
              winResult=JSON.parse(winResult)
              if(winResult.Success){
                  renderTable(winResult.Data.ItemList);
                  console.log(winResult.Data);

                  $("#showHistory2").html("");
                  $("#branches2").html("");
                  if(winResult.Data.RecordCount>pageSize){
                    $("#setPage").show();
                    totalcount=winResult.Data.RecordCount;
                    totalPage=Math.ceil(totalcount/pageSize);

                    setPage(current, totalPage, 'pages', 'changeYear');
                    $("#curpage").html(current);
                    $("#totalpage").html(totalPage)
                  }else{
                     $("#setPage").hide();
                  }
              }
        });
    }


    $('#moreSolutionInputs').on('focus','input',function() {
       $('#moreSolutionInput').hide();
    })


    //多条件换算
    changeYear2=function(current){
      if($('#importYear2').val() == ''&& $('#importYear3').val() == ''&& $('#importYear4').val() == '') {
           $('#moreSolutionInput').show();
           $('#moreSolutionInput').text('请输入查询条件！');
           return;
       }

      $("#tbody").children().remove();
      if($.trim($("#importYear2").val())=="" && $.trim($("#importYear3").val())==""&&$.trim($("#importYear4").val())==""){
        ShowMessage("请输入条件！")
      }else{
        if(env=="dev"){
             $.ajax({  
                url: baseUrl+"/annal/annalconvert",  
                type: "GET",  
                data: {
                  type:3,
                  dynasty:$("#importYear2").val(),
                  emperor:$("#importYear3").val(),
                  regin:numTransition($("#importYear4").val()).regin,
                  num:numTransition($("#importYear4").val()).num,
                  ps:pageSize,
                  cp:current
                },  
                success: function (res) {  
                  res = eval('(' + res + ')');
                  if(res.Success){
                      renderTable(res.Data.ItemList);
                      $("#showHistory3").data('Period',res.Data.Period)
                      $("#showHistory3").html('')
                      $("#branches3").html("")
                      $("#BC3").html("")
                      if(res.Data.RecordCount>10){
                        $("#setPage").show();
                        totalcount=res.Data.RecordCount
                        totalPage=Math.ceil(totalcount/pageSize)
                        setPage(current, totalPage, 'pages', 'changeYear2');
                        $("#curpage").html(current);
                        $("#totalpage").html(totalPage)
                      }else{
                         $("#setPage").hide();
                      }
                  }
                } 
            });
         }else if(env=="prod"){
          //   var winResult = ApiTransfer('get','/annal/annalconvert',
          //   'type=3&dynasty='+$("#importYear2").val()+'&emperor='+$("#importYear3").val()+'&regin='+numTransition($("#importYear4").val()).regin+'&num='+numTransition($("#importYear4").val()).num+'&ps='+pageSize+'&cp='+current);
          //   winResult=JSON.parse(winResult)
          //   if(winResult.Success){
          //       renderTable(winResult.Data.ItemList);
          //       $("#showHistory3").data('Period',winResult.Data.Period)
          //       $("#showHistory3").html('')
          //       $("#branches3").html("")
          //       $("#BC3").html("")
          //       if(winResult.Data.RecordCount>10){
          //           $("#setPage").show();
          //           totalcount=winResult.Data.RecordCount
          //           totalPage=Math.ceil(totalcount/pageSize)
          //           setPage(current, totalPage, 'pages', 'changeYear2');
          //           $("#curpage").html(current);
          //           $("#totalpage").html(totalPage);
          //       }else{
          //           $("#setPage").hide();
          //       }
          // }
          
           var data = {
               type:3,
               dynasty:$("#importYear2").val(),
               emperor:$("#importYear3").val(),
               regin:numTransition($("#importYear4").val()).regin,
               num:numTransition($("#importYear4").val()).num,
               ps:pageSize,
               cp:current
           }
          //下面是配合winform异步获取数据
            ApiTransfer('get','/annal/annalconvert',JSON.stringify(data),(winResult)=>{
                  winResult=JSON.parse(winResult)
                  if(winResult.Success){
                      renderTable(winResult.Data.ItemList);
                      $("#showHistory3").data('Period',winResult.Data.Period)
                      $("#showHistory3").html('')
                      $("#branches3").html("")
                      $("#BC3").html("")
                      if(winResult.Data.RecordCount>pageSize){
                          $("#setPage").show();
                          totalcount=winResult.Data.RecordCount
                          totalPage=Math.ceil(totalcount/pageSize)
                          setPage(current, totalPage, 'pages', 'changeYear2');
                          $("#curpage").html(current);
                          $("#totalpage").html(totalPage);
                      }else{
                          $("#setPage").hide();
                      }
                }
            });
         }
       
      }
    }


    //点击tr显示公元纪年
    $("#tbody").on("click",'tr',function(){
      if($("#annals2").css('display')=="block"){ //年号到公关
        var showNum = $(this).attr('IsBC')=="true"?'公元前':'公元'
        $("#showHistory2").html(showNum+$(this).attr('Year')+'年')
        $("#branches2").html($(this).attr('Branches'))
        $(this).css("background","#e4ebf5").siblings().css("background","#fff")
      }else if($("#annals3").css('display')=="block"){  //多条件
        $("#showHistory3").html($("#showHistory3").data('Period'))
        $("#branches3").html($(this).attr('Branches'))
        $("#BC3").html( $(this).attr('IsBC')=="true"?'公元前':'公元'+$(this).attr('Year')+'年')
        $(this).css("background","#e4ebf5").siblings().css("background","#fff")
      }
    })

    // numTransition('二时三年康熙')
    function numTransition(str){
      str=str.toString();
      //先检测是否是汉字
        var obj1={
          regin:"",
          num:''
        };
        var regStr = new RegExp("[\\u4E00-\\u9FFF]+","g");
        var regNum = new RegExp(/\d/g);

        if(regStr.test(str)){   //检测到有汉字
            if(regNum.test(str)){  //汉字中有数字
                obj1.regin = str.match(regStr)[0]
                obj1.num =parseInt(str.replace(str.match(regStr)[0],""))
            }else{  //汉字中没有数字
              if(str.indexOf("元年")!=-1){
                  obj1.regin = str.slice(0,str.indexOf("元年"))
                  obj1.num=1;
              }else{
                  str=str.replace("年","");
                  var arr1=["一","二","三","四","五","六","七","八","九","十"]
                  var arr2=[1,2,3,4,5,6,7,8,9,10]
                  var arr =[];
                  for(var i=0;i<str.length;i++){
                    if(arr1.indexOf(str[i])!=-1){
                      arr.push(str[i])
                    }else{
                      obj1.regin+=str[i];
                    }
                  }

                  if(arr.length==1){
                     obj1.num = parseInt(arr2[arr1.indexOf(arr[0])])
                  }else if(arr.length==2){
                    if(arr[0]=="十"){
                      obj1.num =parseInt(10+ arr2[arr1.indexOf(arr[1])])
                    }else if(arr[1]=="十"){
                       obj1.num =parseInt(10*arr2[arr1.indexOf(arr[0])])
                    }
                  }else if(arr.length==3){
                    obj1.num =parseInt(10*arr2[arr1.indexOf(arr[0])]+arr2[arr1.indexOf(arr[2])])
                  }
              }
            }
        }else{  //没有汉字
          obj1.regin="";
          obj1.num = str;
        }
　　　　  return obj1;
    }

    //是否公元前
    conformBC =function(index){
    	if(index==1){
    		isBC=false;
    	}else{
    		isBC=true;
    	}
    }

    function renderTable(data){
    	var innerHtml="";
		$("#tbody").html('');
    	if(data.length==0){
    		innerHtml+="<tr><td colspan='3'>暂无数据</td></tr>"
    	}else{
        if($("#annals1").css('display')=="block"){
          for(var i=0;i<data.length;i++){
            innerHtml+="<tr style='cursor:default'><td>"+data[i].Dynasty+"</td><td>"+data[i].Emperor+"</td><td>"+data[i].Reign+"</td></tr>"
          }
        }else{
            for(var i=0;i<data.length;i++){
              innerHtml+="<tr style='cursor:pointer' Branches="+data[i].Branches+" Year="+data[i].Year+" isBC="+data[i].IsBC+"><td>"+data[i].Dynasty+"</td><td>"+data[i].Emperor+"</td><td>"+data[i].Reign+"</td></tr>"
            }
        }
    	
    	}
    
    	$("#tbody").html(innerHtml)
    }


    // 修改个人资料
   selectMale = function (index){
      if(index==1){
          isMale=true;
      }else if(index==2){
          isMale=false;
      }
   }

   // 获取用户详情
    function getUserInfo(){
      if(env=="dev"){
         $.ajax({  
            url: baseUrl+"/user/detail",  
            type: "GET",  
            data: {
                id:localStorage.userId
            },  
            success: function (res) {  
              res = eval('(' + res + ')');
              if(res.Success){
                 $("#inputAccount").val(res.Data.NickName)
                 if(res.Data.Sex=="男"){
                   isMale=true;
                 }else{
                   isMale=false;
                 }
              }
            } 
        });  
       }else if(env=="prod"){
            // var winResult = ApiTransfer('get','/user/detail','id='+localStorage.userId);
            // winResult=JSON.parse(winResult)
            // if(winResult.Success){
            //   $(".headPng").find("img").attr('src',winResult.Data.UserFace==""?'../static/images/photo.png':winResult.Data.UserFace)
            //   isMale = winResult.Data.Sex=="女"?false:true;
            //   if(isMale){
            //     $("#isMaleChecked").find("input[name='male']").eq(0).attr("checked",'checked')
            //   }else{
            //     $("#isMaleChecked").find("input[name='male']").eq(1).attr("checked",'checked')
            //   }
            //   $("#inputAccount").val(winResult.Data.NickName)
            //   $("#activeCode").val(winResult.Data.ActivatedCode?winResult.Data.ActivatedCode:'')
            //      if(winResult.Data.Sex=="男"){
            //        isMale=true;
            //      }else{
            //        isMale=false;
            //      }
            // }
            
            var data = {
                id:localStorage.userId
            }


            //下面是配合winform异步获取数据
            ApiTransfer('get','/user/detail',JSON.stringify(data),(winResult)=>{
                winResult=JSON.parse(winResult)
                if(winResult.Success){
                  $(".headPng").find("img").attr('src',winResult.Data.UserFace==""?'../static/images/photo.png':winResult.Data.UserFace)
                  isMale = winResult.Data.Sex=="女"?false:true;
                  if(isMale){
                    $("#isMaleChecked").find("input[name='male']").eq(0).attr("checked",'checked')
                  }else{
                    $("#isMaleChecked").find("input[name='male']").eq(1).attr("checked",'checked')
                  }
                  $("#inputAccount").val(winResult.Data.NickName)

                  $("#activeCode").val(winResult.Data.ActivatedCode?winResult.Data.ActivatedCode:'')
                     if(winResult.Data.Sex=="男"){
                       isMale=true;
                     }else{
                       isMale=false;
                     }
                }
            });
       }
     
   }

   //输入框的聚焦事件
   $('#updateInfoContent').on('focus','input',function(e) {
         $('#updateInfoSuccess').hide();
         $('#updateInfoFail').hide();
   }) 

   

   // 更改信息 ;
   $('#updateInfoBtn').on('click',function(){
      if(env=="prod"){
        var sex1= isMale?'男':'女'

            var data = {
                userid:localStorage.getItem('userId'),
                nickname:$('#inputAccount').val(),
                sex:sex1,
                activatedcode:$("#activeCode").val()
            }

            //下面是配合winform异步获取数据
            ApiTransfer('post','/user/update',JSON.stringify(data),(winResult)=>{
                winResult=JSON.parse(winResult)
                if(winResult.Success){
                    $('#updateInfoSuccess').show();
                    $('#updateInfoSuccess').find('span').text('修改成功！');
                    $('#updateInfoFail').hide();
                    //如果修改成功，重新登录更新数据
                    var allUserInfo = GetAllUser();
                    allUserInfo = JSON.parse(allUserInfo);

                    var data = {};

                    allUserInfo.forEach((item,index)=>{
                        if(item.Id == localStorage.getItem('userId')) {
                           data = {
                                account:item.MobileNumber?item.MobileNumber:item.Email,
                                password:item.PassWord,
                                // deviceid:deviceInfo.DeviceId
                            }
                        }
                    })
                    
                    var winResult1 = Login('post','/passport/login',JSON.stringify(data),data.account,data.password,false,'');

                      winResult1 = JSON.parse(winResult1)

                      if(winResult1.Success){
                          if(winResult1.Data.State==1){   //State==1:为正常客户
                              setTimeout(()=>{
                                CloseForm();
                              },1500)
                          }else{
                              $('#updateInfoSuccess').hide();
                              $('#updateInfoFail').show();
                              $('#updateInfoFail').find('span').text(winResult1.Description);
                          }
                      }else{
                          $('#updateInfoSuccess').hide();
                          $('#updateInfoFail').show();
                          $('#updateInfoFail').find('span').text(winResult1.Description);
                      }
                }else{

                    $('#updateInfoSuccess').hide();
                    $('#updateInfoFail').show();

                    $('#updateInfoFail').find('span').text(winResult.Description);
                }
            });
        }
   })
   

   //正在上传头像不允许关闭
   forbidClose = function(bool) {
      if(bool) {
         // $('#updateInfoSuccess').hide();
         // $('#updateInfoFail').show();
         // $('#updateInfoFail').find('span').text('正在上传头像，请稍候...');
      }else {
         // $('#updateInfoSuccess').hide();
         // $('#updateInfoFail').hide();
      }
   }
   
   var isUploading = false;

   $("#upload").on('click',function(){
      if(isUploading) return;

      EnableCloseBtn(true);
      isUploading = true;
      $('#updateInfoSuccess').show();
      $('#updateInfoSuccess').find('span').text('正在上传头像，请稍候...');
      $('#updateInfoBtn').attr('disabled',true);
      $('#updateInfoFail').hide();
      // var winResult = ApiTransfer('post','/user/setuserface','userid='+localStorage.userId,'图片|*.jpg;*.png;*.gif');
      // winResult = JSON.parse(winResult);
      // if(winResult.Success){
      //    $(".headPng").find("img").attr('src',winResult.Data);
      // }else{
      //    ShowMessage(winResult.Description)
      // }
      
      UpLoadFile('图片|*.jpg;*.png;*.gif',(imgUrlData)=>{
          console.log(imgUrlData);
          imgUrlData = JSON.parse(imgUrlData);

          if(imgUrlData.Code == 200) {
             $(".headPng").find("img").attr('src',imgUrlData.Data);
             SetUserFace(imgUrlData.Data);
             $('#updateInfoSuccess').hide();
             $('#updateInfoFail').hide();
          }else {
            $('#updateInfoSuccess').hide();
            $('#updateInfoFail').show();
            $('#updateInfoFail').find('span').text(imgUrlData.Description);
          }


          EnableCloseBtn(false);
          isUploading = false;

          $('#updateInfoBtn').attr('disabled',false);
      });
      
      
     
   })


   //----------------------下面是检查更新 ----------------------------
//    {
//   "Success": true,
//   "Code": 200,
//   "Description": "成功",
//   "Data": {
//     "Id": null,
//     "Description": "",
//     "IsEnforced": 2,
//     "MD5": null,
//     "PlatformName": null,
//     "Type": null,
//     "Url": "http://api.borderland.kingchannels.cn/files/upload/82d/20170804174315055_187194.apk",
//     "Version": "1.5.0",
//     "VersionNumber": 50
//   }
// }

   function checkupdate() {

      //下面是配合winform异步获取数据
      ApiTransfer('get','/app/check',JSON.stringify({type:2}),(winResult)=>{
          winResult = JSON.parse(winResult)
          console.log(winResult);
          if(winResult.Success){
               $('#newVersion').text(winResult.Data.Version);
               var curVerData = GetCurrentVersion();
                   curVerData = JSON.parse(curVerData);

               $('#curVersion').text(curVerData.Version);

               if(winResult.Data.VersionNumber <= curVerData.VersionNumber) {
                  $('#goUpdate').text('已是最新');
                  $('#goUpdate').attr('disabled',true);
                  $('#goUpdate').css('background','#e4e6f5');
               }else {
                  $('#goUpdate').text('去更新');
                  $('#goUpdate').attr('disabled',false);
                  $('#goUpdate').css('background','#2b579a');

                  clickToUpdate(winResult.Data);
               };


          }else{
              ShowMessage(winResult.Description)
          }
      });
   }

   function clickToUpdate(Version) {
      $('#goUpdate').on('click',function() {
          $('#progressP').css('display','block');
          $('#updateProgress').show();
          $('#progressText').show();
          $('#goUpdate').hide();
          $('#goUpdate').attr('disabled',true);
          $('#goUpdate').css({'background':'#e4e6f5','color':'black'});
          
          DownLoadUrl(Version.Url,function(progress,nativeUrl,err){
             if(err) {
                  ShowMessage(err);
                  $('#updateProgress').hide();
                  $('#progressText').hide();
              }else {
                  $('#progressCont').css('width',Math.floor(progress*10)/10+'%');
                  $('#progressText').text(Math.floor(progress*10)/10+'%');

                  if(progress >= 100) {
                     setTimeout(()=>{
                        $('#updateProgress').hide();
                        $('#progressText').hide();

                        ExcuteUpdate(nativeUrl);
                     },2000)
                  }

              }
          })
         
      })
   }


})()