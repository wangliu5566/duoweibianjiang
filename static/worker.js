onmessage = function(e) {
	if(e.data) {
        pySegSort(JSON.parse(e.data))
	}
}


function pySegSort(arr,empty) {
   if(!String.prototype.localeCompare) return null;            
    var letters = "abcdefghjklmnopqrstwxyz".split('');
    var zh = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split('');
     
    var segs = [];
    var curr;
    letters.forEach(function(item,index){
        curr = {letter: item, data:[]};
        arr.forEach(function(item1,index1) {
            if((!zh[index-1] || zh[index-1].localeCompare(item1.title) <= 0) && item1.title.localeCompare(zh[index]) == -1) {
                curr.data.push(item1);
            }
        });
        // if(empty || curr.data.length) {

            segs.push(curr);
            curr.data.sort(function(a,b){
                return a.title.localeCompare(b);
            });
        
    });

    postMessage(JSON.stringify(segs))
}


