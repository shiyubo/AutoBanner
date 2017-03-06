var tween=(function () {
    var effect={
        Linner:function (t,b,c,d) {
            return c*t/d+b;
        }
    };

    //实现多方向运动动画 target->{left:xxx,top:xxx...} duration->time
    function move(curEle,target,duration,callBack) {
        //每一次执行方法之前都要结束之前的
        clearInterval(curEle.timer);
        var begin={};
        var change={};
        for (var key in target){
            if(target.hasOwnProperty(key)){
                begin[key]=utils.css(curEle,key);
                change[key]=target[key]-begin[key];
            }
        }
        var time=0;
        curEle.timer=setInterval(function () {
            time+=10;
            if(time>=duration){
                clearInterval(curEle.timer);
                utils.css(curEle,target);
                callBack && callBack.call(curEle);//指向当前元素
                return;
            }
            //分别获取每一个方向的位置
            for (var key in target){
                if(target.hasOwnProperty(key)){
                    var curPos=effect.Linner(time,begin[key],change[key],duration);
                    utils.css(curEle,key,curPos);
                }
            }
        },10)
    }
    return {
        move:move
    };
})();