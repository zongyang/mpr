define (require, exports, module) -> 
  require! <[ util state ]>

  # scroll-container:   $ '#main-carousel'
  scroll-container:   $ window
  extend-scroll-event: !->
    old-scroll = $.fn.scroll
    $.fn.scroll = (data, fn)->
      # fn = data if not fn?
      old-fn = if typeof fn is 'function' then fn else data
      console.log 'old-fn: ', old-fn
      last-scroll-top = 0
      last-direction = null
      new-fn = (event)->
        current-scroll-top = $ @ .scroll-top!
        event.direction = 
          switch
          | current-scroll-top >  last-scroll-top => 'down' 
          | current-scroll-top == last-scroll-top => last-direction 
          | current-scroll-top <  last-scroll-top => 'up' 
        # console.log "last: #{last-scroll-top}, current: #{current-scroll-top}"
        last-scroll-top := current-scroll-top
        last-direction := event.direction

        old-fn event

      if typeof fn is 'function' then old-scroll.call @, data, new-fn else old-scroll.call @, new-fn

  scroll-top: -> @scroll-container.scroll-top.apply @scroll-container, &

  scroll: -> @scroll-container.scroll.apply @scroll-container, &

  scroll-container-height: -> $ '#comment' .height!

  is-at-last-screen: -> (@scroll-top! > @scroll-container-height! - 2 * ($ window .height!))

  add-condition-for-prevent-app-page-change-when-click-navigator-back-button: (condition-fn)!-> 
    old-fn = window.is-at-plus-navigator-back-disabled
    window.is-at-plus-navigator-back-disabled = ->
      old-fn?! or condition-fn!

  enable-back-navigation: !->
    is-onpopstate-caused-change = null 
    state.app-page.observe (current-page)!->
      history.push-state page: current-page if not is-onpopstate-caused-change
      is-onpopstate-caused-change := false

    window.onpopstate = (event)!-> if event.state?
      state.app-page event.state.page if not window.is-at-plus-navigator-back-disabled!
      is-onpopstate-caused-change := true

  create-widget: (spec)-> 
    if spec.name? and spec.states-app-pages-map? 
      widget = {
        activate: !-> # dummy method in case client doesn't provide
        bind-data: !-> # dummy method in case client doesn't provide
      } <<< spec 

      widget <<< {
        state: 'hidden' # 所有widget初始化时，默认是不可见的，为hidden状态（class)

        set-state: (@state)!-> $('#' + @name).attr 'class', (@state.replace /\./g, ' ') # 改变widget的状态，就是改变其css class。widget按照convention，对应的dom有id，#widget-name。

        start-states-changing: !->
          state.app-page.observe (page)!~>
            for widget-state, app-pages of @states-app-pages-map || {} # widget在不同的app page上呈现不同。states-app-pages-map定义了这样的映射关系。
              (@set-state widget-state ; return) if page in app-pages
            @set-state 'hidden'
          state.app-page state.app-page!
      }

      widget.activate = widget.activate.decorate before: widget.start-states-changing, after: widget.bind-data
      widget
    else
      throw new Error 'widget spec must have name and states-app-pages-map ' 




