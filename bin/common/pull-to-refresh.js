// Generated by LiveScript 1.3.1
(function(){
  define(function(require, exports, module){
    var hammerjs, ui, util, modernizr, PullToRefresh;
    hammerjs = require('Hammer');
    ui = require('./ui');
    util = require('util');
    modernizr = require('_Modernizer');
    return PullToRefresh = (function(){
      PullToRefresh.displayName = 'PullToRefresh';
      var prototype = PullToRefresh.prototype, constructor = PullToRefresh;
      function PullToRefresh(arg$){
        this.container = arg$.container, this.slidebox = arg$.slidebox, this.slideboxIcon = arg$.slideboxIcon, this.isContainedInATransformedContainer = arg$.isContainedInATransformedContainer, this.done = arg$.done;
        this.breakpoint = 80;
        this.clearFlags();
      }
      prototype.clearFlags = function(){
        this.slidedownHeight = 0;
        this.animationKeyFrame = null;
        this.draggedDown = false;
      };
      prototype.init = function(){
        var this$ = this;
        this.hammertime = new Hammer(this.container[0], {
          drag: true,
          drag_block_horizontal: true,
          drag_lock_min_distance: 20,
          hold: false,
          release: true,
          swipe: false,
          tap: false,
          touch: true,
          transform: false
        });
        this.hammertime.get('pan').set({
          direction: Hammer.DIRECTION_DOWN
        });
        this.hammertime.on('pandown panend', function(ev){
          this$.handle(ev);
        });
      };
      prototype.handle = function(ev){
        switch (ev.type) {
        case 'tap':
          this.hide();
          break;
        case 'panend':
          if (this.draggedDown) {
            window.cancelAnimationFrame(this.animationKeyFrame);
            if (ev.deltaY >= this.breakpoint) {
              this.doPullRefresh();
            } else {
              this.cancelPullRefresh();
            }
          }
          break;
        case 'pandown':
          if (ui.scrollTop() <= 5) {
            if (ui.scrollTop() !== 0) {
              ui.scrollTop(0);
            }
            this.draggedDown = true;
            if (!this.animationKeyFrame) {
              this.updateHeight();
            }
            ev.preventDefault();
            this.slidedownHeight = ev.deltaY * 0.4;
          } else {
            console.log("pandown at middle: ", ui.scrollTop());
          }
        }
      };
      prototype.doPullRefresh = function(){
        this.container.attr('class', 'pullrefresh-loading');
        this.slidebox.attr('class', 'icon loading');
        this.setHeight(60);
        this.done();
      };
      prototype.cancelPullRefresh = function(){
        this.slidebox.attr('class', 'slideup');
        this.container.attr('class', 'pullrefresh-slideup');
      };
      prototype.setHeight = function(height){
        if (Modernizr.csstransforms3d) {
          this.container.css('transform', 'translate3d(0,' + height + 'px,0) scale3d(1,1,1)');
        } else if (Modernizr.csstransforms) {
          this.carousel.css('transform', 'translate(0,' + height + 'px)');
        } else {
          this.carousel.css('top', height + 'px');
        }
      };
      prototype.hide = function(){
        this.container.attr('class', '');
        this.setHeight(0);
        window.cancelAnimationFrame(this.animationKeyFrame);
        this.clearFlags();
      };
      prototype.slideUp = function(){
        var this$ = this;
        window.cancelAnimationFrame(this.animationKeyFrame);
        this.slidebox.attr('class', 'slideup');
        this.container.attr('class', 'pullrefresh-slideup');
        this.setHeight(0);
        setTimeout(function(){
          this$.hide();
        }, 500);
      };
      prototype.updateHeight = function(){
        var this$ = this;
        this.setHeight(this.slidedownHeight);
        if (this.slidedownHeight >= this.breakpoint) {
          this.showSlidedown();
        } else {
          this.showReleaseUp();
        }
        this.animationKeyFrame = window.requestAnimationFrame(function(){
          this$.updateHeight();
        });
      };
      prototype.showSlidedown = function(){
        this.slidebox.attr('class', 'breakpoint');
        this.slideboxIcon.attr('class', 'icon arrow arrow-up');
      };
      prototype.showReleaseUp = function(){
        this.slidebox.attr('class', '');
        this.slideboxIcon.attr('class', 'icon arrow');
      };
      return PullToRefresh;
    }());
  });
}).call(this);