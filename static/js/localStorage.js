//验证是否已经保存用户数据
    function volidUserId() {
       if(!localStorage.getItem('userId') || localStorage.getItem('userId') == '') {
           OpenLoginForm();
           return false;
       }

       return true;
    }