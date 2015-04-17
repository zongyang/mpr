define (require, exports, module) -> class Abstract-state
  require! util

  (@name, @default, @legal-values = 'any')-> # Abstract method, only for derived class using, never using directly!
    @value = @default if typeof @default isnt 'undefined'
    @make-state-changing-delaiable!
  
  create-observable: (check = @check-value)!->
    @observers = {}
    @fn = ~> 
      old-value = @get-value!
      if &.length is 0 then old-value else 
        check ...
        @set-value new-value = &[0]
        [observer new-value, old-value for key, observer of @observers when @should-run-observer observer]

    @fn.observe = (observer)~> 
      @observers[key = util.get-random-key!] = observer
      let key = key 
        ~> delete @observers[key]
    @fn.state = @

  get-value: -> @value

  set-value: (value)!-> @value = value

  check-value: (value)!->
    # console.error "#{value} is not legal" if @legal-values isnt 'any' and !(value in @legal-values)

  should-run-observer: (observer)-> typeof observer.should-run isnt 'function' or observer.should-run!

  make-state-changing-delaiable: -> # state可延时变化
    @timers = [] 
    @fn.add-timer = (timer)!~> @timers.push timer
    @fn.clear-timers = !~>
      [clear-timeout timer for timer in @timers]
      @timers = []

  clear-local-attributes: (obj)->
    [delete obj[attr.camelize!] for attr in @local-attributes when obj[attr.camelize!]?]
    obj