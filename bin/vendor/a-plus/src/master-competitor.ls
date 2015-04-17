define (require, exports, module) ->
  require! <[ util local-storage-manager state ]>

  is-master: state.add 'is-at-plus-running-as-master': [true, false]
  competing-interval: 400ms
  heart-beating-interval: 200ms 
  can-my-heart-beat: true 
  is-first-compete-complete: false

  activate: (first-compete-done-callback)!->
    @is-master false
    window.is-at-plus-running-as-master = @is-master
    @compete first-compete-done-callback

  compete: (first-compete-done-callback)!->
    if window.is-on-extension-background-page is true # extension页面的时候，不需要compete，稳定由extension的background page做master。
      @is-master true 
      # @start-heart-beating!
      window.local-storage.set-item 'at-plus-browser-extension-installed', true
      first-compete-done-callback!
    else if window.local-storage.get-item 'at-plus-browser-extension-installed'
      @is-master false
      first-compete-done-callback!
    else
      @continously-compete-for-master first-compete-done-callback

  continously-compete-for-master: (first-compete-done-callback)!-> # 算法参见：http://my.ss.sysu.edu.cn/wiki/pages/viewpage.action?pageId=225869825
    compete = !~> 
      @is-master-heart-beating (is-beating)!~>
        if not is-beating and @can-my-heart-beat
          @enter-pseudo-critial-area!
          set-timeout !~> (set-timeout !~> 
            @is-master if @no-other-competitor-entered-critical-area! then true else false
            if @is-master! then (@stop-competing-for-master! ; @start-heart-beating!) else @stop-heart-beating!
            @leave-pseudo-critical-area!
            @complete-first-compete first-compete-done-callback
          , 0) , 0
        else
            @complete-first-compete first-compete-done-callback

    compete!
    @master-competing-timer = set-interval (!~> compete!), @competing-interval

  complete-first-compete: (callback)!->
    (@is-first-compete-complete = true ; callback?!) if not @is-first-compete-complete


  is-master-heart-beating: (callback)!->
    @update-previous-and-current-heart-beating!
    if typeof @previous-heart-beating is 'undefined' # 首次判断时，local storage里面可能有之前留下的'at-plus-master-heart-beating-token'，需要等下看。
      set-timeout (!~> @is-master-heart-beating callback), @heart-beating-interval
    else
      callback @current-heart-beating isnt @previous-heart-beating

  update-previous-and-current-heart-beating: !->
    @previous-heart-beating = @current-heart-beating
    @current-heart-beating = local-storage-manager.get 'at-plus-master-heart-beating-token'

  stop-competing-for-master: !-> clear-interval @master-competing-timer

  start-heart-beating: !-> 
    heart-beat = !~>
      if @has-other-competitor-took-over-master!
        @is-master false
        @stop-heart-beating!
        @continously-compete-for-master!
      else
        if @can-my-heart-beat
          local-storage-manager.set 'at-plus-master-heart-beating-token', Date.now!
          @update-previous-and-current-heart-beating!
    heart-beat!
    if @is-master!
      @heart-beating-timer = set-interval (!~> heart-beat!), @heart-beating-interval
      util.events.trigger 'at-plus-running-as-master'

  pause-heart-beat: !-> @can-my-heart-beat = false

  resume-heart-beat: !-> @can-my-heart-beat = true

  stop-heart-beating: !-> 
    clear-interval @heart-beating-timer
    util.events.trigger 'at-plus-running-as-slave'

  has-other-competitor-took-over-master: ->
    @current-heart-beating? and @current-heart-beating isnt local-storage-manager.get 'at-plus-master-heart-beating-token'

  enter-pseudo-critial-area: !-> 
    @competitors = 0
    window.add-event-listener 'storage', @pseudo-critical-area-locker

  no-other-competitor-entered-critical-area: -> @competitors is 0

  leave-pseudo-critical-area: !-> window.remove-event-listener 'storage', @pseudo-critical-area-locker

  pseudo-critical-area-locker: (event)!~> @competitors++ if event.key is 'at-plus-master-competition-pseduo-critical-area-entering-counter'