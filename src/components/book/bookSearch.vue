<template>
  <div class="book-search" :style="{height:winHeight +'px'}" id="" @contextmenu.prevent="" @click="conMenuShow = false">
     <p></p>
     <div class="book-search-input">
       <el-input
          placeholder="请输入关键字"
          v-model="input"
          @keydown.native="pasteText"
          @keyup.enter.native="handleIconClick"
          @contextmenu.native="openContextmenu($event)"
          >
          

        </el-input>
        <el-button type="primary" @click="handleIconClick" >搜索</el-button>
     </div>
     <p v-show="openSearchResult">与“<span class="search-text-color">{{showInput}}</span>”相关的结果，共{{searchResult.length}}条：</p>
     <ul v-show="openSearchResult" v-if="searchResult.length !== 0" :style="{height:winHeight-200 +'px'}">
       <li v-for="(item,index) in searchResult" v-html="index+1 +'、 '+item.content " :title="item.content.replace(/<.+>/g,'')" @click="toReader(item,index)">
           
       </li>
     </ul>

     <p v-else v-show="openSearchResult" style="text-align:center">
        未搜索到相关的内容
     </p>

      <iframe :src="iframeSrc" frameborder="0" width="0" height="0" id="searchContIframe" ref="searchContIframe" align="middle"></iframe>

     <ul class="context-menu" :style="{left:conMenuLeft+'px',top:conMenuTop + 'px',overflow:'hidden'}" v-show="conMenuShow">
        <li id="myContextMenuLi" :class="canPasted?'':'menu-disabled'" style="margin-bottom:0"  @click="closeMenuAndDo($event)">粘贴</li>
     </ul>
  </div>
</template>

<script>
  export default {
    data(){
      return {
          winWidth: window.innerWidth,
          winHeight: window.innerHeight,
          input:'',
          showInput:'',
          tagList:[],
          openSearchResult:false,
          isNoneResult:false,
          iframeSrc:'',
          preIframeSrc:'',
          conMenuLeft:100,
          conMenuTop:100,
          conMenuShow:false,
          canPasted:false,
          searchResult:[],
          searchConf:{
            searchKeyword:'',
            searchIndex:0,
            clickIndex:0,
            formId:'',
            sectionId:0
          },

          isFirstEnter:true,
      }
    },
    methods:{
      setWindow() {
        this.winWidth = window.innerWidth;
        this.winHeight = window.innerHeight;
      },
      handleIconClick() {
        if(this.input == '') {
           this.openSearchResult = false;
           this.searchResult = [];
           this.searchConf.searchKeyword = '';
           this.searchConf.clickIndex = 0;
           return;
        }
        this.showInput = this.input;  
        this.showInput = this.showInput.replace(/\\/g,'');

        this.searchResult = [];

        this.searchResultList();

        this.searchConf.searchKeyword = this.input;
        this.searchConf.clickIndex = 0;
        this.openSearchResult = true;
      },
      //输入框粘贴屏蔽
      //监听粘贴事件
      pasteText(e) {
        if(e.ctrlKey && e.keyCode==86) {
           //如果有文本被选中
           this.startNode = null;

           if(document.getSelection().toString() !== '') {
              // console.log(document.getSelection())
              
            // console.log(document.getSelection().toString())
              this.selection = document.getSelection().toString();
              //获取开始和结束的位置，方便设置选区
              this.startNode = document.getSelection().anchorNode;
              this.closeMenuAndDo(e);
              return;
           }


           this.doPaste(e);
         }
       },
       //右键功能
       openContextmenu(e){
         this.conMenuShow=true;
         this.aimNode = null;
         this.conMenuLeft = e.pageX;
         this.conMenuTop = e.pageY;
         this.aimNode = null;

         this.canPasted = false;

         var clipText = GetClip();
         if(clipText) {
            this.canPasted = true;

            this.startNode = null;

            if(document.getSelection().toString() !== '') {
                // console.log(document.getSelection())
                
              // console.log(document.getSelection().toString())
              this.selection = document.getSelection().toString();
                //获取开始和结束的位置，方便设置选区
                this.startNode = document.getSelection().anchorNode;

             }
         } 
       },
       //点击右键菜单中的选项的操作
       closeMenuAndDo(e) {
          this.conMenuShow = false;
          var elInput = document.getElementsByClassName('el-input__inner')[0];

          
          if(this.startNode) {
            var selStartIndex = this.input.indexOf(this.selection);

            var selEndIndex = selStartIndex + this.selection.length;

            elInput.focus();
            elInput.setSelectionRange(selStartIndex, selEndIndex);

            this.doPaste(e,elInput,selStartIndex,selEndIndex);
            return;
          }
          
          // elInput.setAttribute('contenteditable', false);
          this.doPaste(e,elInput);
        },
       //粘贴操作的具体流程 
       doPaste(e,ele,selStartIndex,selEndIndex) {
          var clipText = GetClip();
         console.log(clipText)
          if(clipText) {
              //这个时候要处理粘贴的东西
              
              e.preventDefault();
              clipText = clipText.slice(clipText.indexOf('<p class="prevCont" style="display:none">')+41,clipText.lastIndexOf('</p>'));
              clipText = clipText.replace(/\[/g,'\\[');  
              // clipText = clipText.replace(/\</g,'\\<');  

              // <p class="prevCont" style="display:none">${preContent}</p>
              // clipText = clipText.replace(/<a[^>]*>[\s\S]*?<\/a>/g, "");
              // clipText = clipText.replace(/<p[^>]*>/g,'');
              // clipText = clipText.replace(/<\/p>/g,'');
              // clipText = clipText.replace(/<br>/g,'');
              // clipText = clipText.replace(/ /g,'');
              // clipText = this.Trim(clipText,'g');

              if(selStartIndex || selStartIndex === 0) {
                 ele.focus();
                 this.input = this.input.substr(0,selStartIndex)+clipText+this.input.substring(selEndIndex,this.input.length);
                 window.getSelection().removeAllRanges();
                 // document.execCommand('Delete');
                 return;
              }
              

              this.input += clipText;
          }

       },
       //处理复制文字多个空格问题
       Trim(str,is_global)
          {
           var result;
           result = str.replace(/(^\s+)|(\s+$)/g,"");
           if(is_global.toLowerCase()=="g")
           {
            result = result.replace(/\s/g,"");
            }
           return result;
        },
      // 搜索
      searchResultList() {
         var reg = new RegExp(this.input,'g');
         console.log(reg);
         for ( var i = 0; i < this.tagList.length ; i ++) {

            var currentFindTarget = this.tagList[i];
            if(reg.test(currentFindTarget.innerText)) {
               var random = Math.floor(Math.random()*6 + 8);

               //一段话里可能存在多个匹配项，都要取出来
               var currentSearchArr = [];
               currentSearchArr = currentFindTarget.innerText.match(reg);

               currentSearchArr.forEach((item,index)=>{
                   var str = '';
                   var fontNum = 0;

                   var aimstrIndex = this.searchIndexOfKey(currentFindTarget.innerText,item,index +1);

                   //如果是p标签或div标签，就截取一段
                   if(currentFindTarget.nodeName == 'div' || currentFindTarget.nodeName == 'p') {
                       var startStrIndex = aimstrIndex - random;
                       if (startStrIndex <= 0 ) startStrIndex = 0;

                       str = currentFindTarget.innerText.substr(startStrIndex,2* Math.floor(Math.random()*6 + 8) + 20);

                       fontNum = this.getFontNumByELe(currentFindTarget);
                   }else if(currentFindTarget.nodeName.indexOf('h') !== -1) {
                       //如果是h标签，就取所有
                       str = currentFindTarget.innerText;
                       
                       fontNum = this.getFontNumByELe(currentFindTarget);
                       // $(citem).prevAll().each((nindex, nitem)=>{
                       //   fontNum += $(nitem).text().length;
                       // });
                   }

                   // str = str.replace(/[\W]/,'');
                   this.searchResult.push({
                       content:str,
                       id:'',
                       fontNum:fontNum,
                   });

               })
            }
         };

         this.searchResult = this.delResult(this.searchResult);

      },

      //获取某个节点之前所有兄弟节点的字数
      getFontNumByELe(elm) {
          var a = [];
          var pageNum = 0;

           $(elm).prevAll().each((nindex, nitem)=>{
              pageNum += $(nitem).text().length;
           })
          return pageNum;
      },
      //获取一段字符串中特定字符串出现的索引,index为第几次出现
      searchIndexOfKey(str='',keyword='',index=1) {
           //如果没匹配到
           if(str.indexOf(keyword) == -1) return false;
           //匹配到了，但是只有一项
           if(str.split(keyword).length == 2) {
              if(index != 1) return false;
              return str.indexOf(keyword);
           }

           //此时有多项
           if(str.split(keyword).length > 2) {
              var res = str.split(keyword);

              var countOfStr = 0;
              //超出个数范围
              if(index <= 0 || index >= res.length) return false;
              if(index == 1) return str.indexOf(keyword);

              res.forEach(function(item,itemIndex){
                 if(itemIndex < index) {
                    countOfStr += item.length;
                 }
              })

              return countOfStr;
           }
      },
      //点击搜索结果
      toReader(item,index) {

         this.searchConf.searchIndex = item.fontNum;
         this.searchConf.clickIndex = index;
         this.searchConf.clickNum = item.clickNum;

         InvokeFormFuction(this.formId+'','resetPosByBookSearch('+item.fontNum+')');
      },
      //处理搜索结果
      delResult(data) {
        if(data.length == 0) {
           return data;
        }

        var reg = new RegExp(this.input,'g');
        var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var resStr = '';
        //处理首尾特殊字符
        var spechars = [];

        //给搜索关键字加颜色
        data.forEach((item,index)=>{
           resStr = '';
           item.content = item.content.replace(reg,'<span class="search-content" style="color:red">'+this.input.replace(/\\/g,'')+'</span>');
           for(var i = 0; i < 16 ; i++) {
               var a = Math.ceil(Math.random()*51);
               resStr += str[a];
           }
           //添加随机字符串id
           item.content = '<span id="'+resStr+'" data-fontNum="'+item.fontNum+'">'+item.content+'</span>';
           item.id = resStr;
        })

        return data;
      }
    },
    created() {
      // ShowDevTools();

       let iframeSrc = localStorage.getItem('iframeSrc');
       this.iframeSrc = iframeSrc.slice(iframeSrc.indexOf('iframeSrc')+10,iframeSrc.lastIndexOf('&'));

       this.formId = iframeSrc.slice(iframeSrc.indexOf('formId')+7);

       this.searchConf.formId = this.formId;
       this.searchConf.sectionId = iframeSrc.slice(iframeSrc.indexOf('sectionId')+10,iframeSrc.indexOf('&'));

       this.isFirstEnter = true;

    },
    mounted(){
      setInterval(()=>{
        if(!localStorage.getItem('iframeSrc')) {
           CloseForm();
        }

        if(localStorage.getItem('closeBookSearchBySectionId') && localStorage.getItem('closeBookSearchBySectionId') == this.searchConf.sectionId) {
           localStorage.removeItem('closeBookSearchBySectionId');
           CloseForm();
        }
      },1000)

      var _this = this;
          _this.setWindow();


      //将图书窗口和文内检索窗口绑定
      BindForm(this.formId);
          
      window.onresize = ()=>{
         _this.setWindow();
      }

      _this.$refs.searchContIframe.contentWindow.onload = function() {
         var iframeWindow = this.document;

         var itemList = iframeWindow.body.children;

         for(let i = 0 ; i < itemList.length ; i++) {
             _this.tagList.push(itemList[i]);
         }


          var listOFIframeNodes = $(iframeWindow).find('a[href^="http://"]');
          listOFIframeNodes.each(function(index,item) { 
              var preText = $(item).text().replace(/</g,'');
                  preText = preText.replace(/>/g,'');
                  preText = preText.replace('第','');

              $(item).text('<'+preText+'>');
          })
      }


      //开启一个定时器，将当前文内检索的窗口内容，保存到localstorage中
      setInterval(()=>{
         if(localStorage.getItem('searchArr')) {
            var searchArr = JSON.parse(localStorage.getItem('searchArr'));
            if(searchArr.length !== 0) {

              for(var i = 0 ; i < searchArr.length ; i ++) {
                 var item = searchArr[i];
                 if(item.formId == this.formId) {

                     searchArr[i] = this.searchConf;

                     break;
                  }

                  if(i == searchArr.length - 1 && !this.isFirstEnter) {
                     CloseForm();
                     break;
                  }

                  if(i == searchArr.length - 1 && this.isFirstEnter) {
                     searchArr.push(this.searchConf);
                  }

              }
              
              this.isFirstEnter = false;
              localStorage.setItem('searchArr',JSON.stringify(searchArr));
            }else {
              searchArr.push(this.searchConf);

              this.isFirstEnter = false;
              localStorage.setItem('searchArr',JSON.stringify(searchArr));
            }

         }else {
            if(!this.isFirstEnter) {
               CloseForm();
               return;
            }

            var searchArr = [];

            searchArr.push(this.searchConf);

            localStorage.setItem('searchArr',JSON.stringify(searchArr));
         }


      }, 500) 
    },

    watch:{
      'input':function(nv,ov) {
         console.log(nv)
      }
    }
  }
</script>
<style lang="css" scoped> 

  .book-search {
     margin: 0 auto;
     overflow: hidden;
     width: 80%;
  }

  .book-search-input {
     margin-top: 50px;
     display: flex;
     justify-content: flex-start;
     align-items: center;
     /* width: 400px */
  }

  .book-search-input button {
    margin-left: 10px
  }

  .book-search p {
    margin: 20px 0;
  }

  .book-search ul {
    overflow-y: scroll;
  }

  .book-search li {
    margin-bottom: 15px ;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: nowrap;
    white-space: nowrap;
    width: 100%;
    cursor: pointer;
  }

  .book-search li:hover {
    color:#5980b8;

  }

  .search-text-color {
    color:red;
    /*background:#ffef68*/
  }

  .search-content {
    background:#5980b8;
  }

  #myContextMenuLi:hover {
    background: #eee;
    color: black;
  }

</style>

