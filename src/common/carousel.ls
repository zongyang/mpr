# 可滑动的panes，旋转木马
# 参考了 http://codepen.io/anon/pen/GgoqWZ （原始版本用的是Hammer 1.0.5；我们用的是Hammer 2.0.4）
# 部分手机浏览器（360、百度、UC）在overflow:hidden的时候，滚动会凝滞，甚至无法滚动。因此，carousel不能用overflow-x:hidden的方式来隐藏右侧的panes
# 所以这里采用了一种变通的方案：
#   1）将出现在当前pane右侧的panes统统设置为display: none
#   2）将carsoule的宽带设置为当前pane与其左侧pane的大小之和
#   3）swipeleft（next）的时候，先扩大carsoule宽度，并将新的pane display: block ，然后再animate
#   4）swiperight（prevoius）的时候，先animate，完成后将最右pane display: none，然后减小carsoule宽度
define (require, exports, module) ->
  require! {'jquery', Hammer: 'hammerjs', State: 'state', 'util', _Modernizer: 'modernizr', './scroll-manager'}

  class Carousel
    ({@name, @container, @carousel, @panes-names, @external-state-config}) ->
      @container = $ @container
      @carousel = $ @carousel
      @panes = @carousel.find ["\##{name}" for name in @panes-names].join(', ') 
      @pane-width = 0
      @pane-amount = @panes.length
      @current-pane-index = 0
      @current-pane = State.add "carousel-#{@name}", @panes-names
      @dragging-threshold = PERCENT_OF_PANE_WIDTH = 0.5

    init: !->
      @set-pane-dimensions-and-display!
      ($ window).on 'load resize orientationchange', !~>
        @set-pane-dimensions-and-display!
      @show-pane-according-to-state!
      @start-changing-panes-when-swiping!
      scroll-manager.fix-drift @carousel

    set-pane-dimensions-and-display: !->
      width = @pane-width = @container.width!
      self = @
      @panes.each (index)!-> 
        if index <= self.current-pane-index then $ @ .css 'display', 'block' else $ @ .css 'display', 'none'
        $ @ .width width
      @carousel.width @pane-width * (@current-pane-index + 1)

    show-pane-according-to-state: !->
      if @external-state-config # carousel不仅仅受swipe/drag panes控制，还会随external-state的不同，呈现不同pane
        @external-state-config.state.observe (state)!~> 
          pane-name =  @external-state-config.states-panes-map[state]
          @show-pane pane-name, animate = true if pane-name
      else # carousel仅仅受swipe/drag panes控制
        @current-pane.observe (pane-name)!~> @show-pane pane-name, animate = true

    show-pane: (index-or-name, is-animate) !-> 
      if typeof index-or-name is 'number'
        index = Math.max 0, Math.min index-or-name, @pane-amount - 1
      else if typeof index-or-name is 'string'
        index = @panes-names.find-index index-or-name
      else
        throw new Error "index-or-name: #{index-or-name} is neither a string nor an integer"
      @show-pane-with-proper-carousel-size index, is-animate


    show-pane-with-proper-carousel-size: (index, is-animate)!->
      return if index is @current-pane-index # 当前pane，不变。
      direction = if index > @current-pane-index then 'left' else 'right'
      @enlarge-carousel-and-show-right-panes index if direction is 'left' # 在向左滑动前扩大carousel，容纳即将显示的pane
      @reveal-pane index, is-animate
      @shrink-carousel-and-hide-right-panes if direction is 'right' # 在向右滑动carousel后，将滑出屏幕外的pane隐藏起来，避免滚动时漂移

    enlarge-carousel-and-show-right-panes: (index)!->
      @carousel.width @pane-width * (index + 1) 
      [$ pane .css 'display', 'block' for i, pane of @panes when i <= index]

    reveal-pane: (index, is-animate)!->
      @current-pane-index = index
      console.log "show-pane: ", @current-pane-index
      @adjust-panes-height-to-aviod-scroll-to-white-space!
      @carousel.removeClass 'animate'
      @carousel.addClass 'animate' if is-animate
      @carousel.css 'left', -(@pane-width * @current-pane-index) + 'px'

    shrink-carousel-and-hide-right-panes: !->
      [$ pane .css 'display', 'none' for i, pane of @panes when i > @current-pane-index]
      @carousel.width @pane-width * (@current-pane-index + 1) 
    
    start-changing-panes-when-swiping: !->
      gesture-recognizer = new Hammer @container.0, {dragLockToAxis: true, preventDefault: true }
      gesture-recognizer.on 'swipeleft swiperight', (ev) !~> if @is-permit-handle!
        @swipe-event = ev
        # console.log "------------ swipe: ", ev.type
        ev.prevent-default!
        switch ev.type
        | 'swipeleft'     =>  @next! 
        | 'swiperight'    =>  @prev!

    is-permit-handle: ->
      return true if typeof @external-state-config is 'undefined'
      @external-state-config.state! in @external-state-config.carouselable-states


    next: !-> @go-pane @panes-names[Math.min @panes.length - 1, @current-pane-index + 1]

    go-pane: (pane-name)!->
      if @external-state-config
        @external-state-config.state util.get-key-of-value @external-state-config.states-panes-map, pane-name
      else
        @current-pane pane-name

    prev: !-> @go-pane @panes-names[Math.max 0, @current-pane-index - 1]


    adjust-panes-height-to-aviod-scroll-to-white-space: !->
      current-pane = $ @panes[@current-pane-index]
      current-pane.css 'height', 'auto'
      @panes.each -> $ @ .css 'height', current-pane.css 'height' if @ isnt current-pane.get 0
