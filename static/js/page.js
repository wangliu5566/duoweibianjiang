
//四个参数：当前页，总页数，容器，请求数据的接口方法
function setPage(curpage, totalPages, containerId, tpfuncname){
	if(totalPages==0){
		$('#'+containerId).empty();
		return;
	}
	curpage = parseInt(curpage);
	totalPages = parseInt(totalPages);
	var lihtml;
	if(curpage ==1){
		lihtml = '<li class="disabled"><a>首页</a></li>';
		lihtml += '<li class="prev disabled"><a><</a></li>';
	}
	else{
		lihtml = '<li><a onclick="'+tpfuncname+'(1)">首页</a></li>';
		lihtml += '<li class="prev"><a onclick="'+tpfuncname+'('+(curpage-1)+')"><</a></li>';
	}
	

	var endTemp = curpage+5;
	if(totalPages>10){
		if(endTemp<=10){
			end=10;
		}else{
			if(endTemp>totalPages){
				end=totalPages;
			}else{
				end=endTemp;
			}
		}
	}else{
		end=totalPages;
	}
	
	var startTemp = end-9;
	if(startTemp<1){
		start=1;
	}else{
		start=startTemp;
	}
	
	for(var i=start; i<=end; i++){
		if(i==curpage){
			lihtml += '<li class="active"><a>'+i+'</a></li>';
		}
		else{
			lihtml += '<li><a onclick="'+tpfuncname+'('+i+')">'+i+'</a></li>';
		}
	}
	if(curpage == totalPages){
		lihtml += '<li class="next disabled"><a>></a></li>';
		lihtml += '<li class="disabled"><a>末页</a></li>';
	}
	else{
		lihtml += '<li class="next"><a onclick="'+tpfuncname+'('+(curpage+1)+')">></a></li>';
		lihtml += '<li><a onclick="'+tpfuncname+'('+totalPages+')">末页</a></li>';
	}
	
	$('#'+containerId).html(lihtml);
}

