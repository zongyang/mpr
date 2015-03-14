# pull to refresh 下拉刷新
# 参考了 http://codepen.io/berkin/pen/jyfHq （原始版本用的是Hammer 1.0.10；我们用的是Hammer 2.0.4）
define (require, exports, module) ->
  require! {Hammer: 'hammerjs', './ui', 'util', _Modernizer: 'modernizr'}

  class Pull-to-refresh
    ({@container, @slidebox, @slidebox-icon, @is-contained-in-a-transformed-container, @done})->
      @breakpoint = 80px
      @clear-flags!

    clear-flags: !->
      @slidedown-height = 0
      @animation-key-frame = null
      @dragged-down = false

    init: !->
      @hammertime = new Hammer @container.0 , {
        drag: true,
        drag_block_horizontal: true,
        drag_lock_min_distance: 20,
        hold: false,
        release: true,
        swipe: false,
        tap: false,
        touch: true,
        transform: false,
      }
      #, preventDefault: true 
      @hammertime.get 'pan' .set direction: Hammer.DIRECTION_DOWN
      # @hammertime.on 'pandown panend', (ev)-> false
      @hammertime.on 'pandown panend', (ev)!~> @handle ev

    handle: (ev)!->
      # ev.prevent-default!
      switch ev.type
      | 'tap'       =>    @hide!
      | 'panend'    =>    if @dragged-down
        window.cancel-animation-frame @animation-key-frame
        if ev.delta-y >= @breakpoint then @do-pull-refresh! else @cancel-pull-refresh!
      | 'pandown'   =>    
        if ui.scroll-top! <= 5 
          ui.scroll-top 0 if ui.scroll-top! isnt 0
          @dragged-down = true
          @update-height! if not @animation-key-frame
          ev.prevent-default!
          @slidedown-height = ev.delta-y * 0.4
        else
          console.log "pandown at middle: ", ui.scroll-top!

    do-pull-refresh: !->
      @container.attr 'class', 'pullrefresh-loading'
      @slidebox.attr 'class', 'icon loading'
      @set-height 60
      @done!

    cancel-pull-refresh: !->
      @slidebox.attr 'class', 'slideup'
      @container.attr 'class', 'pullrefresh-slideup'

    set-height: (height)!->
      if Modernizr.csstransforms3d
        @container.css 'transform', 'translate3d(0,' + height + 'px,0) scale3d(1,1,1)'
      else if Modernizr.csstransforms
        @carousel.css 'transform', 'translate(0,' + height + 'px)'
      else
        @carousel.css 'top', height + 'px'

    hide: !->
      @container.attr 'class', ''
      @set-height 0
      window.cancel-animation-frame @animation-key-frame
      @clear-flags!

    slide-up: !->
      window.cancel-animation-frame @animation-key-frame
      @slidebox.attr 'class', 'slideup'
      @container.attr 'class', 'pullrefresh-slideup'
      @set-height 0
      set-timeout (!~> @hide!), 500ms

    update-height: !->
      # console.log "@slidedown-height: ", @slidedown-height
      # console.log "@breakpoint: ", @breakpoint
      # console.log "@slidedown-height >= @breakpoint: ", @slidedown-height >= @breakpoint
      @set-height @slidedown-height
      if @slidedown-height >= @breakpoint then @show-slidedown! else @show-release-up!
      @animation-key-frame = window.request-animation-frame !~> @update-height!

    show-slidedown: !->
      @slidebox.attr 'class', 'breakpoint'
      @slidebox-icon.attr 'class', 'icon arrow arrow-up'

    show-release-up: !->
      @slidebox.attr 'class', ''
      @slidebox-icon.attr 'class', 'icon arrow'



