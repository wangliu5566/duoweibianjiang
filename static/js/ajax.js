
// var baseUrl="http://api.borderland.kingchannels.cn";
var baseUrl="http://demo.api.borderland.kingchannels.cn";

var ymUrl="http://localhost:8080/#";
var ymUr2="http://localhost:8080";

var env = "prod";    //dev  -- 开发环境   prod -- 生产环境


// function getData(method,url,data,fn) {
// 	 if(env == 'dev') {
// 	 	if(method == 'get') {
// 	 		this.$http.get(url, {
// 	            params: data
// 	        })
// 	        .then((res) => {
// 	            fn(res.data);
// 	        })
// 	        .catch((err) => {
// 	        })
// 	 	}else if(method == 'post'){
// 	 		this.$http.post(url, {
// 	            params: data
// 	        })
// 	        .then((res) => {
// 	            fn(res.data);
// 	        })
// 	        .catch((err) => {
// 	        })
// 	 	}
        

//     }else if(env == 'prod') {
//         ApiTransfer(method,url,JSON.stringify(data),(winResult)=>{
//             winResult=JSON.parse(winResult)
//             if(winResult.Success){
//               fn(winResult);
//             }
//         });     
//     }
// }


// //获取表格数据，包括搜索结果
// function getTableData(keyword = '', ps = 20, cp = 1) {
//     this.loading = true;
//     var data = {
//                 keyword: keyword,
//                 ps: ps, //每页条数
//                 cp: cp, //当前页
//                 type: 1
//             }

//     getData('get','/resource/list',data,(data)=>{
//            this.loading = false;
//            this.bookListData = data.Data.ItemList;
//            this.totalData = data.Data.RecordCount;
//     })
// }




