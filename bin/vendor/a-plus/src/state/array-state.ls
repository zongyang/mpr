define (require, exports, module) ->
  require! ['./abstract-state', './object-state', util]
  
  class Array-state extends abstract-state
    ->
      @is-array = true
      @type = 'array'
      @create-observable-array!
      super ...

    create-observable-array: (is-element-observable)!->
      @value = {}
      @create-observable check = (args)!~> [@check-value arg for arg in args]
      @array-observers = {}
      @add-observed-array-operations!
      object-observer = @fn.observe
      @fn.observe = (observer, observer-type = 'element')~> # observer-type : add | remove | element ; add, remove是array变化，element是array的元素变化
        # console.error "observer-type is wrong #{observer-type}" if observer-type not in ['add', 'remove', 'element']
        if observer-type is 'element'
          object-observer ... 
        else
          key = util.get-random-key!
          if observer-type is 'add'
            @array-observers.add ||= {}
            @array-observers.add[key] = observer
            let key = key 
              ~> delete @array-observers.add[key]
          else
            @array-observers.remove ||= {}
            @array-observers.remove[key] = observer
            let key = key 
              ~> delete @array-observers.remove[key]

      @fn.get-element = (element-id)-> @state.value[element-id]

      @fn.clear = !-> @state.set-value []

    get-value: -> [value! for key, value of @value]

    set-value: (elements)-> 
      # console.error "elements of observable array must have id." if typeof elements.0 is 'object' and not elements.0.id
      for id, object-state of @value then @fn.remove id, call-observers = true
      for element in elements then @fn.add element

    create-element-observer: (element)!->
      element-state = new object-state @name + element.id
      element-observable = @value[element.id] = element-state.fn
      element-observable element
      element-observable.observe (new-value, old-value)!~> @run-array-observers new-value, 'element' # 当元素发生变化时，通知array observers

    add-observed-array-operations: !->
      @add-observed-array-add!
      @add-observed-array-remove!
      @add-observed-array-update-element!
      @add-observed-array-partial-update-element!
      @add-observed-array-change-id-of-element!

    add-observed-array-add: !->
      @fn.add = (element, call-observers = true)!~> 
        @create-element-observer element
        @run-array-observers element, 'add' if call-observers

    run-array-observers: (value, operation)!->
      # console.log "\n\n*************** run individual observer for #{operation} ***************\n\n"
      observers = [observer for key, observer of @array-observers[operation]] ++ [observer for key, observer of @observers]
      [observer value, operation for observer in observers when @should-run-observer observer]

    add-observed-array-remove: !->
      @fn.remove = (element-or-id, call-observers = true)!~> 
        id = if typeof element-or-id is 'object' then element-or-id.id else element-or-id
        element = @value[id]!
        delete @value[id]
        @run-array-observers element, 'remove' if call-observers

    add-observed-array-update-element: !->
      @fn.update-element = @fn['update-element'] = (element)!~> 
        element-observable = @value[element.id]
        element-observable element 

    add-observed-array-partial-update-element: !->
      @fn.partial-updated-element = @fn['partial-updated-element'] = (element)!~> 
        element-observable = @value[element.id]
        old-value = element-observable!
        element-observable old-value <<< element 

    add-observed-array-change-id-of-element: !->
      @fn.change-id-element = @fn['change-id-element'] = ({old-id, new-id})!~>
        element-observable = @value[new-id] = @value[old-id]
        element = element-observable!
        element.id = new-id
        element-observable element
        delete @value[old-id]
      
