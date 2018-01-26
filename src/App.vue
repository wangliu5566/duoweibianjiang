<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  methods:{
    openOrCloseContextMenu(isopen) {
        var listOfcontextmenu = document.getElementsByClassName('context-menu');

        for(var i = 0 ; i < listOfcontextmenu.length ; i ++) {
            if(isopen) {
               listOfcontextmenu[i].style.display = 'block';
            }else {
               listOfcontextmenu[i].style.display = 'none';
            }

        }
    }
  },
  mounted() {
    ShowDevTools();
    var _this = this;
    window.onDOMMouseScroll = function() {
       _this.openOrCloseContextMenu(false);
    }
    
    window.onmousewheel = function() {
       _this.openOrCloseContextMenu(false);
    } 

    window.oncontextmenu = function() {
       _this.openOrCloseContextMenu(true);
    } 
  }
}
</script>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, '微软雅黑',sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #444;
}

th,td {
    font-size: 12px;
}

.loading-content {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    opacity: 0.7;
    background: white;
}

.context-menu {
    position: absolute;
    left: 0;
    top: 0;
    box-shadow: 2px 2px 2px #999;
    width: 100px;
    height: auto;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.context-menu li {
    padding: 0 10px;
    font-size: 14px;
    text-align: left;
    list-style: none;
    line-height: 30px;
    cursor: pointer;
}

.context-menu li:hover {
    background: #eee
}

.context-menu .menu-disabled:hover {
    background: #fff;
}

.menu-disabled {
    color:#aaa;
}

/*相关章节的来源样式*/
.mysource{
cursor: pointer;
}
  
.mysource:hover{
color:#2b579a;
}


.loginSuccess{
    width: 100px;
    margin: 30px auto;
}
.loginSuccess span{
    color:#227ab7;
    margin-left: 5px;
}
.loginFail{
     width: 200px;
    margin: 30px auto;
    text-align: center;
}
.loginFail span{
    color:rgb(201,0,0);
    margin-left: 5px;
}


input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button{
    -webkit-appearance: none !important;
    margin: 0; 
}


.close-search {
    position: absolute;
    right: 32px;
    top:13px;
    font-size: 10px;
    color:#bbb;
    cursor: pointer;
}

.close-search:hover {
    color:#777;
}

  .search-text-color {
    color:red;
    /*background:#ffef68*/
  }



</style>
