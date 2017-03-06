~function () {
    function AutoBanner(curEleId,AjaxURL,interval) {
        this.banner=document.getElementById(curEleId);
        this.bannerInner=utils.firstChild(this.banner);
        this.bannerTip=utils.getElementsByClass("bannerTip",this.banner)[0];
        this.bannerLeft=utils.getElementsByClass("bannerLeft",this.banner)[0];
        this.bannerRight=utils.getElementsByClass("bannerRight",this.banner)[0];
        this.divList=this.bannerInner.getElementsByTagName("div");
        this.imgList=this.bannerInner.getElementsByTagName("img");
        this.oLis=this.bannerTip.getElementsByTagName("li");
        //全局变量
        this.jsonData=null;
        this.interval=interval || 3000;
        this.autoTimer=null;
        this.step=0;
        this.AjaxURL=AjaxURL;
        return this.init();
    }
    AutoBanner.prototype={
        constructor:AutoBanner,
        //ajax请求
        getData:function () {
            var _this=this;
            var xhr=new XMLHttpRequest();
            xhr.open("get",this.AjaxURL+"?_="+Math.random(),false);
            xhr.onreadystatechange=function () {
                if(xhr.readyState===4&&/^2\d{2}$/.test(xhr.status)){
                    _this.jsonData=utils.jsonParse(xhr.responseText)
                }
            };
            xhr.send(null);
        },
        //数据绑定
        bindData:function () {
            var strImg="",strLi="";
            if(this.jsonData){
                for(var i=0;i<this.jsonData.length;i++){
                    var curImg=this.jsonData[i];
                    strImg+='<div><img src="" trueImg="'+curImg["img"]+'"/></div>';
                    strLi+='<li></li>';
                }
            }
            this.bannerInner.innerHTML=strImg;
            this.bannerTip.innerHTML=strLi;
            utils.addClass(this.oLis[0],"bg");
        },
        //图片延迟加载
        lazyImg:function () {
            var _this=this;
            for (var i=0;i<this.imgList.length;i++){
                ~function (i) {
                    var curImg=_this.imgList[i];
                    var oImg=new Image;
                    oImg.src=curImg.getAttribute("trueImg");
                    oImg.onload=function () {
                        curImg.src=this.src;
                        curImg.style.display="block";
                        if(i===0){
                            var curDiv=curImg.parentNode;
                            curDiv.style.zIndex=1;
                            tween.move(curDiv,{opacity:1},500);
                        }
                        oImg=null;
                    }
                }(i);
            }
        },
        //自动轮播
        autoMove:function () {
            if(this.step===this.jsonData.length-1){
                this.step=-1;
            }
            this.step++;
            this.setBanner();
        },
        //切换和焦点 对齐
        setBanner:function () {
            for(var i=0,len=this.divList.length;i<len;i++){
                var curDiv=this.divList[i];
                if(i===this.step){
                    curDiv.style.zIndex=1;
                    utils.css(curDiv,"zIndex",1);
                    tween.move(curDiv,{opacity:1},1000,function () {
                        var curDivSib=utils.siblings(this);
                        for(var k=0,len=curDivSib.length;k<len;k++){
                            var curDivs=curDivSib[k];
                            utils.css(curDivSib[k],{opacity:0});
                        }
                    });
                    continue;
                }
                curDiv.style.zIndex=0;
            }
            //对焦点
            for( i=0,len=this.oLis.length;i<len;i++){
                var curLi=this.oLis[i];
                i===this.step?utils.addClass(curLi,"bg"):utils.removeClass(curLi,"bg");
            }
        },
        //控制自动轮播
        mouseEvent:function () {
            var _this=this;
            this.banner.onmouseover=function () {
                clearInterval(_this.autoTimer);
                _this.bannerLeft.style.display=_this.bannerRight.style.display="block";
            };
            this.banner.onmouseout=function () {
                _this.autoTimer=setInterval(function () {
                    _this.autoMove();
                },_this.interval);
                _this.bannerLeft.style.display=_this.bannerRight.style.display="none";
            };
        },
        //焦点切换
        tipEvent:function () {
            var _this=this;
            for(var i=0,len=this.oLis.length;i<len;i++){
                var curLi=this.oLis[i];
                curLi.index=i;
                curLi.onclick=function () {
                    _this.step=this.index;
                    _this.setBanner();
                }
            }
        },
        //左右切换
        leftRight:function () {
            var _this=this;
            this.bannerRight.onclick=function () {
                _this.autoMove();
            };
            this.bannerLeft.onclick=function () {
                if(_this.step===0){
                    _this.step=_this.jsonData.length;
                }
                _this.step--;
                _this.setBanner();
            };
        },
        //入口
        init:function () {
            var _this=this;
            this.getData();
            this.bindData();
            setTimeout(function () {
                _this.lazyImg();
            },500);
            this.autoTimer=setInterval(function () {
                _this.autoMove();
            },_this.interval);
            this.mouseEvent();
            this.tipEvent();
            this.leftRight();
            return this;
        }
    };
    window.AutoBanner=AutoBanner;
}();