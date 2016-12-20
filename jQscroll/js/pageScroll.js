(function($){
	var defaults = {
		container : '.pageScroll-container',
		scrollbox : '.pageScroll-scrollbox',
		section : '.pageScroll-section',
		index : 0,			//默认开始的页码
		easing : 'ease',	//滚动的贝塞尔曲线
		duration : 500,		//滚动时间间隔
		direction : 'vertical',		//横纵向滚动设置，默认纵向。
		keyboard : true,
		list : [],	//滚动每个页面的值
		callback : null,	//指定滚屏结束的回调函数
		callbackIndex : 'all'
	};
	var container, scrollbox, section, obj, oldindex = 0,
		arrSection = [],
		// 当前滚动的页面数
		index,
		pages,
		callback,
		callbackIndex,
		// 滚屏动画控制开关防止快速滚动
		canScroll = true,
		sP = $.fn.pageScroll = function(options){
			obj = $.extend(defaults, options);
			scrollbox = this.find(obj.scrollbox);
			section = scrollbox.find(obj.section);
			callback = obj.callback;
			callbackIndex = obj.callbackIndex;
			index = obj.index;
			var direction = (obj.direction === 'vertical' ? true : false);
			if(!direction) {
				initLayout();
			}
			initPage(obj.list.length); 
			intiEvent();

		}

	//向上一屏事件
	sP.preSection = function() {
		index--;
		if(index < 0){
			index++;
			return;	
		}
		scrollPage();
	}
	//向下滚动一屏事件
	sP.nextSection = function() {
		index++;
		if(index >= section.length){
			index--;
			return;
		}
		scrollPage();
	}
	//事件的初始化
	intiEvent = function() {
		//为每个pages下的li绑定点击事件
		$('body').find('.pages li').on('click', function() {
			if (canScroll) {
				index = $(this).index();
				scrollPage();
			};
		});

		//为每个next，pre点击添加时间
		$('.next').on('click', function() {
			if(canScroll) {
				sP.nextSection();
			}
		});
		//鼠标滚动
		$(document).on('mousewheel DOMMouseScroll', function(e) {
			var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
			if(canScroll) {
				if(delta >0){
					sP.preSection();
				}else{
					sP.nextSection();
				}
			}
		});

		//键盘事件
		if(obj.keyboard){
			$(window).on('keydown', function(e) {
				var keyCode = e.keyCode;
				if(canScroll){
					if(keyCode ==37 || keyCode == 38){
						sP.preSection();
					}else if(keyCode == 39 || keyCode == 40){
						sP.nextSection();
					}
				}
			});
		}
		//窗口改变大小让回到原来的位置
		var resizeID;
		$(window).resize(function() {
			clearTimeout(resizeID);
			resizeID = setTimeout(function() {
				scrollPage();
			}, 500);
		});

	}
	//横向布局函数
	function initLayout() {
		var length = section.length,
			width = (length * 100) + '%',
			cellwidth = (100 / length).toFixed(2) + '%';
		scrollbox.width(width);
		section.width(cellwidth).css({'float' : 'left'});
	}

	//导航分页模块
	function initPage(pagesNumber) {
		if(obj.direction == 'vertical') {
			// 竖屏
			var margin_l = -25 * pagesNumber;
			var pageHtml = '<div class="right_nav"><ul class="pages">';
			for (var i = 0; i < section.length; i++) {
				pageHtml += '<li><span>' + obj.list[i] + '</span></li>';
			};
			pageHtml += '</ul></div>';
			$('body').append(pageHtml);
			pages = $('body').find('.pages');
			pages.find('li').eq(index).addClass('active');
			$('body').find('.right_nav').addClass('vertical').css({
				'margin-top' : margin_l + 'px'
			});
			pages.find('li').find('span').css({'left' : '20px'});
			pages.find('li').eq(index).find('span').css({'left' : '-90px'});
			// 竖屏才有置底图标
			$('body').append('<div class="change-page"><div class="next"></div></div>');
		}else {
			// 横屏
			var margin_l = -15 * pagesNumber;
			var pageHtml = '<div class="bottom_nav"><ul class="pages">';
			for (var i = 0; i < section.length; i++) {
				pageHtml += '<li></li>';
			};
			pageHtml += '</ul></div>';
			$('body').append(pageHtml);
			pages = $('body').find('.pages');
			pages.find('li').eq(index).addClass('active');
			$('body').find('.bottom_nav').addClass('horizontal').css({
				'margin-left' : margin_l + 'px'
			});
		}
	}

	//是否支持css的某个属性
	function isSuportCss(property){
		var body = $("body")[0];
		for(var i=0; i<property.length;i++){
			if(property[i] in body.style){
				return true;
			}
		}
		return false;
	}

	//页面滚动事件
	function scrollPage() {
		if(obj.direction == 'vertical') {
			// 只有在滚屏时间下才需要置底图标的控制
			if(index == section.length -1){
				$('.change-page').find('div').attr('class', 'pre');
				$('.pre').on('click', function() {
					if(canScroll) {
						sP.preSection();
					}
				});
			}else{
				$('.change-page').find('div').attr('class', 'next');
			}
		}
		canScroll = false;
		var parentP = section.eq(index).position();
		if(typeof parentP === 'underfined') return;
		var transform = ["-webkit-transform","-ms-transform","-moz-transform","transform"],
			transition = ["-webkit-transition","-ms-transition","-moz-transition","transition"];
		if(isSuportCss(transition) && isSuportCss(transform)) {
			scrollbox.css({
				'transition' : 'all ' + obj.duration + 'ms ' + obj.easing
			});
			var translate = obj.direction == 'vertical' ? 'translateY(-' + parentP.top + 'px)' : 'translateX(-' + parentP.left + 'px)';
			scrollbox.css({
					'transform' : translate
			});
			// 这部分有必要解释一下，因为我们拉动了边框，但是浏览器是能检测resize()的，所以进入了动画伸缩自适应，但是你设置的是Y轴的滚动，
			// 但是去拉X轴的边框就造成了，动画没变，但是程序却进入了动画自适应的伸缩。也就是canscroll = false，却满足不了条件而一直false。
			setTimeout(function() {
				canScroll = true;
			},obj.duration);
			// scrollbox.on('webkitTransitionEnd msTransitionend mozTransitionend transitionend',function(){
			// 	canScroll = true;
			// 	console.log(2);
			// });
		}else {
			var animateCss = (obj.direction == 'vertical' ? {top : -parentP.top} : {left : -parentP.left});
			scrollbox.animate(animateCss, obj.duration, function() {
				canScroll = true;
			});
		}
		$('.pages li').eq(index).addClass('active').siblings().removeClass('active');
		if(obj.direction == 'vertical'){
			$('.pages li').eq(index).find('span').animate({
				left : -90
			}, obj.duration).parent().siblings().children().animate({
				left : 20
			}, obj.duration);
		}
		// 滚动完成执行回调函数
		if(typeof callback === 'function') {
			if (callbackIndex === 'all') {
				callback();
			} else if (index === callbackIndex) {
				callback();
			}
		}
	}
}(jQuery));