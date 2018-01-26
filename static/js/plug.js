//序列化数据
	function conbineData(json) {
     if(!(json instanceof Object) || json instanceof Array) {
         alert('请传入json对象！');
         return
     }
     
     var str = '';

     for( var k in json) {
         str = str + k + '=' + json[k] +'&';
     }

     str = str.slice(0,str.lastIndexOf('&'));
     return str;
	}


//解决document.elementFromPoint 获取元素为null的bug
var check = false,
    isRelative = true;
    
function elementFromPoint1(x, y,element) {
    if (!document.elementFromPoint) return null;
    if (!check) {
        var sl;
        if ((sl = element.scrollTop) > 0) {
            isRelative = (document.elementFromPoint(0, sl + window.innerHeight - 1) == null);
        } else if ((sl = element.scrollLeft) > 0) {
            isRelative = (document.elementFromPoint(sl + window.innerWidth - 1, 0) == null);
        }
        check = (sl > 0);
    }
    if (!isRelative) {
        x += element.scrollLeft;
        y += element.scrollTop;
    }
    return document.elementFromPoint(x, y);
}



//清除用户数据
function clearLocalStorage(type) {
    if(type == 1) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
    }else if(type == -1) {
        localStorage.removeItem('searchArr');
    } 
}


//用作第三方登录成功后保存userId
function setUserIdByThird(winResult) {
    if(winResult.Success) {
       localStorage.setItem('userId',winResult.Data.Id);
       localStorage.setItem("userInfo",JSON.stringify(winResult.Data));
    }else {
       ShowMessage(winResult.Description);
    }
}

//验证是否已经保存用户数据
function volidUserId(isDownload=false) {

   if(!localStorage.getItem('userId') || localStorage.getItem('userId') == '') {
       OpenLoginForm();
       return false;
   }


   //这个时候用户是已经登录过的，验证该用户是否有激活，是否已经绑定第三方等，主要区分第三方用户
   if(isDownload) {
      //判断是否有用户数据，根据用户数据判断是否需要提示
      if(!localStorage.getItem('userInfo')) {
         //这里还需要判断是否是第三方用户，如果是则打开绑定手机，如果不是则打开个人中心
        var allUserInfo = GetAllUser();
        allUserInfo = JSON.parse(allUserInfo);
        var data = {};

        allUserInfo.forEach((item,index)=>{
            if(item.Id == localStorage.getItem('userId')) {
               data = item;
            }
        })

        localStorage.setItem('userInfo',JSON.stringify(data));
      }


      var userInfo = localStorage.getItem('userInfo');
      
      userInfo = JSON.parse(userInfo);
      //判断是不是第三方
      if(!userInfo.MobileNumber && !userInfo.Email) {
        OpenForm(480,500,'/index.html#/userCenter','个人信息');
        localStorage.setItem('fromWhere',2);
        return false;
      }else {
        //此时不是第三方，验证有没有激活码或激活码是否过期
        if(!userInfo.ActivatedCode && userInfo.UserType != 1) {
           OpenForm(480,500,'/index.html#/userCenter','个人信息');
           localStorage.setItem('fromWhere',1);
           return false;
        }
      }
   }

   return true;
}


//正在上传头像不允许关闭
function forbidClose(bool) {
    if(bool) {
       // $('#updateInfoSuccess').hide();
       // $('#updateInfoFail').show();
       // $('#updateInfoFail').find('span').text('正在上传头像，请稍候...');
    }else {
       // $('#updateInfoSuccess').hide();
       // $('#updateInfoFail').hide();
    }
 }


document.addEventListener('click', ()=>{
     CloseMenueStrip();
}, false)

document.addEventListener('contextmenu', (e)=>{
     e.preventDefault();
}, false)