var utils=(function(){

    var flag="getComputedStyle" in window;

    //1、类数组转化为数组
    function listToArray(likeAry) {
        var ary=[];
        try{
            ary=[].slice.call(likeAry);
        }catch(e){
            for(var i=0;i<likeAry.length;i++){
                ary[ary.length]=likeAry[i];
            }
        }
        return ary;
    }

    //2、把JSON格式的字符串转化为JSON格式对象，IE6-7中无JSON对象
    function jsonParse(jsonStr) {
        return 'JSON' in window ? JSON.parse(jsonStr) : eval('('+jsonStr+')');
    }

    //3、操作浏览器盒子模型需要写两套
     function win(attr,value) {
        if(typeof value==="undefined"){
            return document.documentElement[attr]||document.body[attr];
        }
        document.documentElement[attr]=value;
        document.body[attr]=value;
    }

    //4、获取当前元素所有经过浏览器计算过的样式
    //curEle:当前要操作的元素对象，attr:获取样式属性名
    //把获取到的部分样式值单位去掉
    function getCss(curEle,attr){
        var val=null;
        var reg=null;
        if("getComputedStyle" in window){
            val=window.getComputedStyle(curEle,null)[attr];
        }else{
            if(attr==="opacity"){
                val=curEle.currentStyle["filter"];
                reg=/^alpha\(opacity=(\d+(?:\.\d+)?\)$/i;
                val=reg.test(val)?reg.exec(val)[1]/100:1;
            }
            val=curEle.currentStyle[attr];
        }
        reg=/^(-?\d+(\.\d+)?)(px|pt|rem|em)?$/i;
        return reg.test(val)?parseFloat(val):val;
    }

    //5、offset获取到屏幕的偏移量，等同于jq中的offset方法
    function offset(curEle) {
        var totalLeft=null;
        var totalTop=null;
        var par=curEle.offsetParent;

        totalLeft+=curEle.offsetLeft;
        totalTop+=curEle.offsetTop;

        while(par){
            //处理IE8兼容
            if(navigator.userAgent.indexOf("MSIE 8.0")===-1){
                totalLeft+=par.clientLeft;
                totalTop+=par.offsetTop;
            }

            totalLeft+= par.offsetLeft;
            totalTop+=par.offsetTop;

            par=par.offsetParent;
        }
        return{left:totalLeft,top:totalTop};
    }

    //6、获取curEle元素下所有的子节点，也可以指定获取子节点下特定tagName子节点
    function children(curEle,tagName) {
        var ary=[];
        if(/MSIE (6|7|8|)/i.test(window.navigator.userAgent)){
            var nodeList=curEle.childNodes;
            for(var i=0;i<nodeList.length;i++){
                var curNode=nodeList[i];
                if(curNode.nodeType===1){
                    ary[ary.length]=curNode;
                }
                nodeList=null;
            }
        }else{
            ary=[].slice.call(curEle.children);
        }

        if(typeof tagName==="string"){
            for(var k=0;k<ary.length;k++){
                var curEleNode=ary[k];
                if(curEleNode.nodeName.toLowerCase()!==tagName.toLowerCase()){
                    ary.splice(k,1);
                    k--;
                }
            }
        }

        return ary;
    }

    //7、获取上一个哥哥元素节点
    function prev(curEle){
        if(flag){
            return curEle.previousElementSibling;
        }
        var pre=curEle.previousSibling;
        while(pre && pre.nodeType !==1){
            pre=pre.previousSibling;
        }
        return pre;
    }
    
    //8、获取下一个弟弟节点
    function next(curEle) {
        if(flag){
            return curEle.nextElementSibling;
        }
        var nex=curEle.nextSibling;
        while(nex && nex.nodeType!==1){
            nex=nex.nextSibling;
        }
        return nex;
    }
    
    //9、获取一个元素所有的哥哥元素节点
    function prevAll(curEle) {
        var ary=[];
        var prevNode=prev(curEle);
        while(prevNode){
            ary.unshift(prevNode);
            prevNode=prev(prevNode);
        }
        return ary;
    }

    //10、获取一个元素所有的弟弟元素节点
    function nextAll(curEle) {
        var ary=[];
        var nextNode=next(curEle);
        while(nextNode){
            ary.push(nextNode);
            nextNode=next(nextNode);
        }
        return ary;
    }
    
    //11、获取相邻的两个元素节点
    function sibling(curEle) {
        var prevNode=prev(curEle);
        var nextNode=next(curEle);
        var ary=[];
        prevNode?ary.push(prevNode):null;
        nextNode?ary.push(nextNode):null;
        return ary;
    }

    //12、获取所有的兄弟元素节点：所有的哥哥+所有的弟弟
    function siblings(curEle) {
        return prevAll(curEle).concat(nextAll(curEle));
    }

    //13、获取当前元素的索引
    function index(curEle) {
        return prevAll(curEle).length;
    }

    //14、获取第一个元素子节点
    function firstChild(curEle) {
        var childs=children(curEle);
        return childs.length>0?childs[0]:null;
    }
    
    //15、获取最后一个元素子节点
    function lastChild(curEle) {
        var childs=children(curEle);
        return childs.length>0?childs[childs.length-1]:null;
    }
    
    //16、向指定容器的末尾增加元素
    function append(newEle,container) {
        container.appendChild(newEle);
    }

    //17、向指定容器的开头增加元素:添加到第一个元素子节点前面
    function prepend(newEle,container) {
        var fir=firstChild(container);
        if(fir){
            container.insertBefore(newEle,fir);
        }
        container.appendChild(newEle);
    }
    
    //18、追加到指定元素前面:内置的insertBefore方法必须找到指定元素的父元素来使用
    function insertBefore(newEle,oldEle) {
        oldEle.parentNode.insertBefore(newEle,oldEle);
    }

    //19、追加到指定元素后面：追加到指定元素弟弟节点的前面
    function insertAfter(newEle,oldEle) {
        var nextNode=next(oldEle);
        if(nextNode){
            oldEle.parentNode.insertBefore(newEle ,oldEle);
            return;
        }
        oldEle.parentNode.appendChild(newEle);
    }

    //20、判断标签有无此样式
    function hasClass(curEle,cName){
        cName=cName.replace(/(^ +)|( +$)/g,'');
        var reg=new RegExp('\\b'+cName+'\\b');
        return reg.test(curEle.className)
    }

    //21、给标签增加样式
    function addClass(curEle,strClass){
        var aryClass=strClass.replace(/(^ +)|( +$)/g,'').split(/\s+/g);
        for(var i=0; i<aryClass.length; i++){
            var curClass=aryClass[i];
            if(!this.hasClass(curEle,curClass)){
                curEle.className+=' '+curClass;
            }
        }
    }

    //22、移除样式
    function removeClass(curEle,strClass){
        var aryClass=strClass.replace(/(^ +)|( +$)/g,'').split(/\s+/g);
        for(var i=0; i<aryClass.length; i++){
            //var reg=new RegExp('(^| +)'+aryClass[i]+'( +|$)');
            var reg=new RegExp('\\b'+aryClass[i]+'\\b');
            if(reg.test(curEle.className)){
                curEle.className=curEle.className.replace(reg, ' ').replace(/\s+/g,' ').replace(/(^ +)|( +$)/g,'');
            }
        }
    }

    //23、通过类名获取一组元素
    function getElementsByClass(strClass,context){
        context=context||document;
        if(flag){
            return this.listToArray(context.getElementsByClassName(strClass))
        }
        var strClassAry=strClass.replace(/(^ +)|( +$)/g,'').split(/\s+/g);
        var nodeList=context.getElementsByTagName('*');
        var ary=[];
        for(var i=0; i<nodeList.length; i++){
            var curNode=nodeList[i];
            var isOk=true;
            for(var k=0; k<strClassAry.length; k++){
                var curClass=strClassAry[k];
                //var reg=new RegExp('(^| +)'+curClass+'( +|$)')
                var reg=new RegExp('\\b'+curClass+'\\b');
                if(!reg.test(curNode.className)){
                    isOk=false;
                    break;
                }
            }
            if(isOk){
                ary[ary.length]=curNode;
            }
        }
        return ary;
    }
    
    //24、设置样式
    function setCss(curEle,attr,value){
        if(attr==='float'){
            curEle.style.styleFloat=value;
            curEle.style.cssFloat=value;
            return;
        }
        if(attr==='opacity'){
            curEle.style.opacity=value;
            curEle.style.filter='alpha(opacity='+value*100+')';
            return;
        }
        var reg=/(width|height|top|right|bottom|left|((margin|padding)(top|right|bottom|left)?))/;
        if(reg.test(attr)){
            value=parseFloat(value)+'px';
        }
        curEle.style[attr]=value;
    }

    //批量设置样式属性
    function setGroupCss(curEle,options){
        options=options||0;
        if(options.toString()!=='[object Object]'){
            return;
        }
        for(var attr in options){
            if(options.hasOwnProperty(attr)){
                this.setCss(curEle,attr,options[attr]);
            }
        }
    }

    //对应jq中的css：简版的css方法
    function css(curEle){
        var arg2=arguments[1];
        if(typeof arg2==='string'){//获取 或 设置
            var arg3=arguments[2];
            if(typeof arg3==='undefined'){//arg3实参不存在；
                return this.getCss(curEle,arg2)
            }else{//设置1个 arg3实参存在
                this.setCss(curEle,arg2,arg3)
            }
        }
        if(arg2.toString()==='[object Object]'){//说明第二个参数是个对象
            this.setGroupCss(curEle,arg2);
        }
        /*if(arg2 instanceof Object){

         this.setGroupCss(curEle,arg2);
         }
         if(arg2.constructor.name==='Object'){
         console.dir(arg2.constructor)
         this.setGroupCss(curEle,arg2);
         }*/
    }
    
    
    
    
    
    
    
    
    
    
    
    return {
        listToArray:listToArray,
        jsonParse:jsonParse,
        win:win,
        getCss:getCss,
        offset:offset,
        children:children,
        prev:prev,
        next:next,
        prevAll:prevAll,
        nextAll:nextAll,
        sibling:sibling,
        siblings:siblings,
        index:index,
        firstChild:firstChild,
        lastChild:lastChild,
        append:append,
        prepend:prepend,
        insertBefore:insertBefore,
        insertAfter:insertAfter,
        hasClass:hasClass,
        addClass:addClass,
        removeClass:removeClass,
        getElementsByClass:getElementsByClass,
        setCss:setCss,
        setGroupCss:setGroupCss,
        css:css

    };

})();

