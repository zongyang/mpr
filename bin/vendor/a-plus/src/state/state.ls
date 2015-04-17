# 职责：   可观察的外表化state。
# 用途：   1）state-machine
#         2）其它可观察的外表化状态。reactive programming
# 用法：   1) 一个对象（widget）可以有多个state
#         2) 对象的state只能够在对象内修改，其它对象可observe，并在state变化时，协调行动，但是不能改变state的值
define (require, exports, module) -> 
  require! <[ syncers-factory util ./array-state ./object-state ]>
  window.at-plus-states ||= State = # Debug用
    add: -> 
      return State[name.camelize!] if State[name.camelize!]?
      state = @create ...
      State[state.name.camelize!] = state.fn # state都是fn

    create: (def, default-value-or-option)-> 
      is-array = if typeof default-value-or-option is 'object' and default-value-or-option?.is-array then true else false
      default-value = default-value-or-option if not (typeof default-value-or-option is 'object' and default-value-or-option?.is-array?)
      if typeof def is 'object'
        (name = Object.keys def .0 ; legal-values = def[name]) 
      else
        (name = def ; legal-values = 'any')

      state = new (if is-array then array-state  else object-state) name, default-value, legal-values 

    sync:
      sync-states: []
      add: ({name, unmarshal-constructor, is-array, local-attributes, syncers, initial-data, server-actions, is-global})->
        return State[name.camelize!] if State[name.camelize!]?
        @sync-states.push  state = State.create name, is-array: is-array
        state.unmarshal-constructor = unmarshal-constructor
        state.local-attributes = unmarshal-constructor.local-attributes
        state.initial-data = initial-data
        state.syncers = syncers-factory.create-syncers syncers, state, server-actions
        state.is-global = is-global
        State[name.camelize!] = state.fn # state都是fn

      initial-all-sync-data: (primary-data-name, done)!->
        syncers = []
        pri-syncers = []
        for state in @sync-states
          for name, syncer of state.syncers
            if state.name is primary-data-name then pri-syncers.push syncer else syncers.push syncer 
        
        util.All-done-waiter.all-complete pri-syncers, 'initial', !->
          util.All-done-waiter.all-complete syncers, 'initial', done


    compute: (states-fns, fn)->
      states = [sfn.state for sfn in states-fns]
      states-names = [s.name for s in states]
      @check-states-exist states-names

      state = @add 'computation-' + Math.random! + states-names.join '-' .state
      old-fn = state.fn
      state.fn = -> if &.length > 0 then console.error "computation can't be assign value directly" else old-fn!
      state.fn <<< old-fn

      compute = -> old-fn fn.apply null, [s.get-value! for s in states]
      observe = -> [s.fn.observe compute for s in states]
      canclers = observe!
      state.fn.pause-observe = -> (observers = [c! for c in canclers] ; canclers := []; observers)
      state.fn.resume-observe = -> canclers := [s.fn.observe compute for s in states] if canclers.length is 0

      compute!
      state.fn

    check-states-exist: (states-names)!->
      # for name in states-names
      #   console.error "state #{name} doesn't exist" if typeof State[name.camelize!] is 'undefined'

    # TODO：这部分职责，似乎应该分离出去。
    mixin-temporary-state: (widget, option)!->
      # console.error 'first arguments should be an widget with name.' if !widget?.name?.length > 1
      
      if typeof option.is-hovered isnt 'undefined'
        area = widget.hot-area or widget.view
        widget.is-hovered = @add "is-#{widget.name}-hovered": [true, false]
        area.on 'mouseenter', (!~> widget.is-hovered true) .on 'mouseleave', , (!~> widget.is-hovered false)
        widget.is-hovered option.is-hovered
      
      if typeof option.is-shown isnt 'undefined'
        area = widget.appeared-area or widget.view
        widget.is-shown = @add "is-#{widget.name}-shown": [true, false]
        widget.show = !-> $ area .show! ; widget.is-shown true
        widget.hide = !-> $ area .hide! ; widget.is-shown false
        widget.is-shown option.is-shown






