/**
 * Copyright (C) 2015 Wasabeef
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var RE = {};

RE.currentSelection = {
    "startContainer": 0,
    "startOffset": 0,
    "endContainer": 0,
    "endOffset": 0
  };

RE.editor = document.getElementById('editor');

document.addEventListener("selectionchange", function() { RE.backuprange(); });

// Initializations
RE.callback = function() {
    // window.location.href = "re-callback://" + encodeURI(RE.getHtml());
}

RE.setHtml = function(contents) {
    RE.editor.innerHTML = decodeURIComponent(contents.replace(/\+/g, '%20'));
}

RE.getHtml = function() {
    return RE.editor.innerHTML;
}


RE.fiterContent = function(contents){
//	var starttitle = contents.indexOf(多维边疆starttitle);
//	var endtitle = contents.indexOf(多维边疆endtitle);
//	var startcontent = contents.indexOf(多维边疆startcontent);
//	var endcontent = contents.indexOf(多维边疆endcontent);
//	console.log(starttitle);
//	console.log(endtitle);
//	console.log(startcontent);
//	console.log(endcontent);
}


// js 查看未上传文件
RE.checkUploadFile = function (){
    var a = RE.editor.getElementsByTagName("img");
    var result;
    for(var i=0,len=a.length;i<len;i++){
        var d = a[i];
        var doc = document.getElementById(d.getAttribute("id"));
        var type = doc.getAttribute("type");
        if(type == "image/jpeg"){
              result += "&" + doc.src;
          }else if(type == "audio/mpeg"){
              result += "&" + doc.getAttribute("realAudio") + "&" + doc.src;
          }else if(type == "video/mp4"){
              result += "&" + doc.getAttribute("realVideo") + "&" + doc.src;
          }else if(type == "resource"){
              result += "&" + doc.src;
          }
    }
   if(a.length > 0){
        result = "kcUploadFile" + result;
        // window.location.href = "re-state://" + encodeURI(result);
   }
}

//删除标签
RE.clearFailedFile = function(srcUrl) {
//    alert("---111---"+srcUrl);
    srcUrl = encodeURI(srcUrl);
    var a = RE.editor.getElementsByTagName("img");
    for(var i=0,len=a.length;i<len;i++){
        var d = a[i];
        var id = d.getAttribute("id");
        var doc = document.getElementById(id);
        var src = doc.src;
        if(src == ("file://" + srcUrl)){
            RE.editor.removeChild(doc);
            RE.callback();
        }
    }
}

RE.getText = function() {

    return RE.editor.innerText;
}

RE.setBaseTextColor = function(color) {
    RE.editor.style.color  = color;
}

RE.setBaseFontSize = function(size) {
    RE.editor.style.fontSize = size;
}

RE.setPadding = function(left, top, right, bottom) {
  RE.editor.style.paddingLeft = left;
  RE.editor.style.paddingTop = top;
  RE.editor.style.paddingRight = right;
  RE.editor.style.paddingBottom = bottom;
}

RE.setBackgroundColor = function(color) {
    document.body.style.backgroundColor = color;
}

RE.setBackgroundImage = function(image) {
    RE.editor.style.backgroundImage = image;
}

RE.setWidth = function(size) {
    RE.editor.style.minWidth = size;
}

RE.setHeight = function(size) {
    RE.editor.style.height = size;
}

RE.setTextAlign = function(align) {
    RE.editor.style.textAlign = align;
}

RE.setVerticalAlign = function(align) {
    RE.editor.style.verticalAlign = align;
}

RE.setPlaceholder = function(placeholder) {
    RE.editor.setAttribute("placeholder", placeholder);
}

RE.undo = function() {
    document.execCommand('undo', false, null);
}

RE.redo = function() {
    document.execCommand('redo', false, null);
}

RE.setBold = function() {
    document.execCommand('bold', false, null);
}

RE.setItalic = function() {
    document.execCommand('italic', false, null);
}

RE.setSubscript = function() {
    document.execCommand('subscript', false, null);
}

RE.setSuperscript = function() {
    document.execCommand('superscript', false, null);
}

RE.setStrikeThrough = function() {
    document.execCommand('strikeThrough', false, null);
}

RE.setUnderline = function() {
    document.execCommand('underline', false, null);
}

RE.setBullets = function() {
    document.execCommand('insertUnorderedList', false, null);
}

RE.setNumbers = function() {
    document.execCommand('insertOrderedList', false, null);
}

RE.setTextColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

RE.setTextBackgroundColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('hiliteColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

RE.setFontSize = function(fontSize){
    document.execCommand("fontSize", false, fontSize);
}

RE.setHeading = function(heading) {
    document.execCommand('formatBlock', false, '<h'+heading+'>');
}

RE.setIndent = function() {
    document.execCommand('indent', false, null);
}

RE.setOutdent = function() {
    document.execCommand('outdent', false, null);
}

RE.setJustifyLeft = function() {
    document.execCommand('justifyLeft', false, null);
}

RE.setJustifyCenter = function() {
    document.execCommand('justifyCenter', false, null);
}

RE.setJustifyRight = function() {
    document.execCommand('justifyRight', false, null);
}

RE.setBlockquote = function() {
    document.execCommand('formatBlock', false, '<blockquote>');
}

RE.insertImage = function(id,url, alt) {
//    var html = '<img id ="pic' + id +'" src="' + url + '" alt="' + alt + '" type="image/jpeg" width="200" height="200" onload="resizeImage(this)" />';
    var html = '<img id ="pic' + id +'" src="' + url + '" alt="' + alt + '" type="image/jpeg" width="200" height="auto" />';
    RE.insertHTML(html);
}

RE.insertAudio = function(id,imgAudio,realAudio) {
    var html = '<img id ="audio' + id +'" src="' + imgAudio + '" realAudio="' + realAudio + '" type="audio/mpeg" width="200" height="auto" />';
    RE.insertHTML(html);
}

RE.insertVideo = function(id,imgVideo,realVideo) {
    var html = '<img id ="video' + id +'" src="' + imgVideo + '" realVideo="' + realVideo + '" type="video/mp4" width="200" height="auto" />';
    RE.insertHTML(html);
}

RE.insertResLink = function(id,localUrl,title, bookname, bookId,fileId, startIndex) {
    var html = '<img id ="resource' + id +'" src="' + localUrl + '" type="resource" bookname="' + bookname +'" bookId="'+ bookId +'" fileId="' + fileId + '" startIndex="' + startIndex + '" width="200" height="auto" />';
    RE.insertHTML(html);
}

     function resizeImage(objImg){
        var obj = new Image();
        obj.src = objImg.src;
        var oHeight = obj.height;
        var oWidth = obj.width;
        if(oHeight > oWidth && oHeight > 200){
           objImg.height = 200;
           objImg.width = 200*oWidth/oHeight;
        }
        if(oWidth > oHeight && oWidth > 200){
            objImg.width = 200;
            objImg.height = 200*oHeight/oWidth;
        }
    }

RE.insertHTML = function(html) {
    RE.restorerange();
    document.execCommand('insertHTML', false, html);
}


RE.insertLink = function(id,url, title, bookname, bookId,fileId, startPar, startIndex) {

    RE.restorerange();
    var sel = document.getSelection();
    if (sel.toString().length == 0) {
        document.execCommand("insertHTML",false,"<a href='"+url+"' id='" + id +"' type='KCBOOKHREF' bookname='" + bookname +"' bookId='" + bookId +"' fileId='" + fileId + "' startPar='" + startPar + "' startIndex='" + startIndex +"'>"+title+"</a>");
    } else if (sel.rangeCount) {
       var el = document.createElement("a");
       el.setAttribute("id", id);
       el.setAttribute("href", url);
       el.setAttribute("bookname", bookname);
       el.setAttribute("title", title);
       el.setAttribute("bookId", bookId);
       el.setAttribute("fileId", fileId);
       el.setAttribute("startPar", startPar);
       el.setAttribute("startIndex", startIndex);

       var range = sel.getRangeAt(0).cloneRange();
       range.surroundContents(el);
       sel.removeAllRanges();
       sel.addRange(range);
   }
    RE.callback();
}


RE.setTodo = function(text) {
    var html = '<input type="checkbox" name="'+ text +'" value="'+ text +'"/> &nbsp;';
    document.execCommand('insertHTML', false, html);
}

RE.prepareInsert = function() {
    RE.backuprange();
}

RE.backuprange = function(){
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      RE.currentSelection = {
          "startContainer": range.startContainer,
          "startOffset": range.startOffset,
          "endContainer": range.endContainer,
          "endOffset": range.endOffset};
    }
}

RE.restorerange = function(){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(RE.currentSelection.startContainer, RE.currentSelection.startOffset);
    range.setEnd(RE.currentSelection.endContainer, RE.currentSelection.endOffset);
    selection.addRange(range);
}

RE.enabledEditingItems = function(e) {
    var e = e|| window.event,
                target = e.target || e.srcElement;
    if(target.id != null && target.id != "editor"){
        RE.blurFocus();
        var doc = document.getElementById(target.id);
        if(doc) {
              var type = doc.getAttribute("type");
                var result;
        //        alert("点击---"+target.id);
        //        alert("src------" + doc.src);
        //        alert("type------" + doc.getAttribute("type"));
        //        alert("valueAudio------" + doc.getAttribute("realAudio"));
        //        alert("valueVideo------" + doc.getAttribute("realVideo"));
                if(type == "image/jpeg"){
                    result ="IMG" + doc.src;
                }else if(type == "audio/mpeg"){
                    result ="AUDIO" + doc.getAttribute("realAudio");
                }else if(type == "video/mp4"){
                    result ="VIDEO" + doc.getAttribute("realVideo");
                }else if(type == "resource"){
                    result ="KCBOOKHREF" + doc.getAttribute("bookname") +
                            "KCBOOKHREF" + doc.getAttribute("bookId") +
                            "KCBOOKHREF" + doc.getAttribute("fileId") +
                            "KCBOOKHREF" + doc.getAttribute("startIndex");
                }else if(type = "KCBOOKHREF"){
                    result = "KCBOOKHREF" + doc.getAttribute("bookname") +
                             "KCBOOKHREF" + doc.getAttribute("bookId") +
                             "KCBOOKHREF" + doc.getAttribute("fileId") +
                             "KCBOOKHREF" + doc.getAttribute("startPar") +
                             "KCBOOKHREF" + doc.getAttribute("startIndex");
                }
                // window.location.href = "re-state://" + encodeURI("kcMedia"+result);
        }
      
    }else{
        var items = [];
            if (document.queryCommandState('bold')) {
                items.push('bold');
            }
            if (document.queryCommandState('italic')) {
                items.push('italic');
            }
            if (document.queryCommandState('subscript')) {
                items.push('subscript');
            }
            if (document.queryCommandState('superscript')) {
                items.push('superscript');
            }
            if (document.queryCommandState('strikeThrough')) {
                items.push('strikeThrough');
            }
            if (document.queryCommandState('underline')) {
                items.push('underline');
            }
            if (document.queryCommandState('insertOrderedList')) {
                items.push('orderedList');
            }
            if (document.queryCommandState('insertUnorderedList')) {
                items.push('unorderedList');
            }
            if (document.queryCommandState('justifyCenter')) {
                items.push('justifyCenter');
            }
            if (document.queryCommandState('justifyFull')) {
                items.push('justifyFull');
            }
            if (document.queryCommandState('justifyLeft')) {
                items.push('justifyLeft');
            }
            if (document.queryCommandState('justifyRight')) {
                items.push('justifyRight');
            }
            if (document.queryCommandState('insertHorizontalRule')) {
                items.push('horizontalRule');
            }
            var formatBlock = document.queryCommandValue('formatBlock');
            if (formatBlock.length > 0) {
                items.push(formatBlock);
            }
            // window.location.href = "re-state://" + encodeURI(items.join(','));
    }
}

RE.focus = function() {
    var range = document.createRange();
    range.selectNodeContents(RE.editor);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
     
    RE.editor.focus();
}

RE.blurFocus = function() {
    RE.editor.blur();
}

RE.removeFormat = function() {
    execCommand('removeFormat', false, null);
}

// Event Listeners
RE.editor.addEventListener("input", RE.callback);
RE.editor.addEventListener("keyup", function(e) {
    var KEY_LEFT = 37, KEY_RIGHT = 39;
    if (e.which == KEY_LEFT || e.which == KEY_RIGHT) {
        RE.enabledEditingItems(e);
    }
});


RE.editor.addEventListener("paste", function(e) {
    e.preventDefault();
    var content = e.clipboardData.getData("Text");
    RE.insertHTML(content);
});

RE.editor.addEventListener("click", RE.enabledEditingItems);

RE.clearBody = function() {
    var divA = document.getElementById("editor");
       divA.innerText = "";
}
