
var scrollBar = (function() {

    function createBar(ele, cross, show) {
        //构建scrollBar div结构
        var scrollDom = createDivDom(ele, cross);

        ele.setAttribute('data-mouse', 'out');

        //设置显示show参数的时候显示bar
        if (show) {
            scrollDom.style.display = 'block';
        }

        //鼠标事件。
        mouseBarEvent(ele, show, scrollDom);

        if (!ele.parentNode.style.position) {
            ele.parentNode.style.position = 'relative';
        }

        ele.parentNode.appendChild(scrollDom);
    }

    // 鼠标进入进出事件函数
    function mouseBarEvent(ele, show, scrollDom) {

        // !show是为了防止 show参数设置true的时候触发隐藏显示事件。
        ele.addEventListener('mouseenter', function () {
            if (!show) {
                scrollDom.style.display = 'block';
            }
            ele.setAttribute('data-mouse', 'on');
        }, false);

        ele.addEventListener('mouseleave', function () {
            if (!show) {
                scrollDom.style.display = 'none';
            }
            ele.setAttribute('data-mouse', 'out');
        }, false);

        //进入滚动条的时候滚动条不要消失
        scrollDom.addEventListener('mouseenter', function () {
            if (!show) {
                scrollDom.style.display = 'block';
            }
            ele.setAttribute('data-mouse', 'on');
        }, false);

        scrollDom.addEventListener('mouseleave', function () {
            if (!show) {
                scrollDom.style.display = 'none';
            }
            ele.setAttribute('data-mouse', 'out');
        }, false);

    }

    function createDivDom(ele, cross) {

        var barBox = document.createElement('div');
        var scrollBar = document.createElement('div');

        setBarStyle(ele, barBox, scrollBar, cross);

        barBox.appendChild(scrollBar);
        scrollBarEvent(ele, scrollBar, cross);
        return barBox;
    }

    function setBarStyle(ele, barBox, scrollBar, cross, color) {

        barBox.className = 'scrollBar-box';
        scrollBar.className = 'scrollBar-tap';

        barBox.style.background  = 'rgba(51, 51, 51, 0.3)';
        barBox.style.borderRadius = '5px';
        barBox.style.position = 'absolute';
        barBox.style.display = 'none';
        barBox.style.padding = '1px';
        barBox.style.boxSizing = 'border-box';

        scrollBar.style.background = '#e8e8e8';
        scrollBar.style.borderRadius = '5px';
        scrollBar.style.position = 'absolute';
        scrollBar.style.cursor = 'pointer';

        // cross true 横向 false 纵向 默认 false
        if (cross) {
             barBox.style.width = ele.clientWidth + 'px';
             barBox.style.height = '10px';
             console.log(getStyle(ele.parentNode, 'marginLeft', true));
             barBox.style.left = ele.offsetLeft - getStyle(ele.parentNode, 'marginLeft', true) + 1 + 'px';
             barBox.style.top = ele.offsetTop + ele.clientHeight - 8
                                - getStyle(ele.parentNode, 'marginTop', true) + 'px';
             scrollBar.style.height = '8px';
             scrollBar.style.width = ele.clientWidth *ele.clientWidth / ele.scrollWidth + 'px';
        } else {
            barBox.style.height = ele.clientHeight + 'px';
            barBox.style.width = '10px';
            barBox.style.left = ele.offsetLeft + ele.clientWidth - 8
                                - getStyle(ele.parentNode, 'marginLeft', true) + 'px';
            barBox.style.top = ele.offsetTop + - getStyle(ele.parentNode, 'marginTop', true) + 1 + 'px';
            scrollBar.style.width = '8px';
            scrollBar.style.height = ele.clientHeight  * ele.clientHeight / ele.scrollHeight + 'px';
        }
    }

    function getStyle(ele, style, type) {

        var retNum = window.getComputedStyle(ele, null)[style];

        if (type) {
            retNum = Number(retNum.slice(0, retNum.length - 2));
        }

        return retNum;
    }

    function scrollBarEvent(ele, scrollBar, cross) {

        var moveEvent;
        var flag = false;
        var mouseX, mouseY;

        scrollBar.addEventListener('mouseenter', function () {
            this.style.background = '#fbfbfb';
        })

        scrollBar.addEventListener('mouseleave', function () {
            this.style.background = '#e8e8e8';
            flag = false;
            this.removeEventListener('mousemove', moveEvent);
        })

        scrollBar.addEventListener('mousedown', function (e) {

            mouseX = e.pageX;
            mouseY = e.pageY;
            flag = true;

            this.addEventListener('mousemove', function (e) {
                if (flag) {
                    var x = e.pageX - mouseX;
                    var y = e.pageY - mouseY;
                    moveEvent = arguments.callee;
                    if (cross) {
                        crossEvent(ele, scrollBar, x);
                    } else {
                        crossNoneEvent(ele, scrollBar, y);
                    }
                    mouseX = e.pageX;
                    mouseY = e.pageY;
                }
            })
        })

        scrollBar.addEventListener('mouseup', function () {
            flag = false;
            this.removeEventListener('mousemove', moveEvent);
        })

        scrollBar.addEventListener('DOMMouseScroll', function (e) {
            scrollFunc(e, flag, cross, ele, scrollBar);
        }, false);

        window.onmousewheel = document.onmousewheel = function (e) {
            scrollFunc(e, flag, cross, ele, scrollBar);
        };
    }

    function crossEvent (ele, bar, left) {

        var scrollLeft = left * ele.scrollWidth / (ele.clientWidth - bar.clientWidth / 4);

        left = Number(bar.style.left.slice(0, this.length - 2)) + left;

        ele.scrollLeft = ele.scrollLeft + scrollLeft;

        if (left <= 1) {
            bar.style.left = '1px';
        } else if (left >= (ele.clientWidth - bar.clientWidth - 1)){
            bar.style.left= ele.clientWidth - bar.clientWidth - 1 + 'px';
        }  else {
            bar.style.left = left  + 'px';
        }
    }

    function crossNoneEvent (ele, bar, top) {

        var scrollTop = top * ele.scrollHeight / (ele.clientHeight - bar.clientHeight / 4);

        top = Number(bar.style.top.slice(0, this.length-2)) + top;

        ele.scrollTop = ele.scrollTop + scrollTop;

        if (top <= 1) {
            bar.style.top = '1px';
        } else if (top > (ele.clientHeight - bar.clientHeight - 1)){
            bar.style.top = ele.clientHeight - bar.clientHeight - 1 + 'px';
        }  else {
            bar.style.top = top  + 'px';
        }
    }

    function scrollFunc (e, flag, cross, ele, bar) {

        var dir = checkDirection(e);

        if(ele.getAttribute('data-mouse') == 'out') {
            return false;
        }

        if (cross) {
            if (dir === 'up') {
                crossEvent (ele, bar, -5);
            } else {
                crossEvent (ele, bar, 5);
            }
        } else {
            if (dir === 'up') {
                crossNoneEvent (ele, bar, -5);
            } else {
                crossNoneEvent (ele, bar, 5);
            }
        }
    }

    function checkDirection (e) {

        if (typeof e.wheelDelta !== 'undefined') {
            if (e.wheelDelta > 0) {
                return 'up';
            } else {
                return 'down'
            }
        } else if (typeof e.detail !== 'undefined') {
            if (e.detail > 0) {
                return 'down';
            } else {
                return 'up';
            }
        }
    }
    /*
    obj Object
    obj.ele DOM
    obj.cross Boolean  ture 横向 false纵向(默认)
    obj.show Boolean   ture 显示 false不显示(默认)
    */
    return function (obj) {
        var ele = obj.ele || undefined;
        var cross = obj.cross || false;
        var show = obj.show || false;
        if (!ele) {
            return false;
        }
        createBar(ele, cross, show);
    }
})();