define (require, exports, module) ->
  # require! <[ module ]>
  restrict-scroll: (direction, dom)!->
    x-start = null
    y-start = null
    sensitive-ratio = 3
    switch direction
    | 'both'        =>    judge-fn = -> true
    | 'horizontal'  =>    judge-fn = (x-delta, y-delta)-> y-delta > sensitive-ratio * x-delta
    | 'vertical'    =>    judge-fn = (x-delta, y-delta)-> x-delta > sensitive-ratio * y-delta
    | otherwise     =>    return

    document.add-event-listener 'touchstart', (e)!->
      console.log "\n\n*************** touchstart ***************\n\n"
      x-start := e.touches[0].screen-x
      y-start := e.touches[0].screen-y

    document.add-event-listener 'touchmove', (e)!->
      console.log "\n\n*************** touchmove ***************\n\n"
      x-delta = Math.abs e.touches[0].screen-x - x-start
      y-delta = Math.abs e.touches[0].screen-y - y-start
      e.prevent-default! if judge-fn x-delta, y-delta

  fix-drift: (dom)!->
    $ window .scroll $.debounce ((e)!-> $ window .scroll-left 0), 250ms
