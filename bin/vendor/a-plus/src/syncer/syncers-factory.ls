define (require, exports, module) -> # Factory模式 
  require! [util, './syncer', './local-storage-channel', './web-channel']

  create-syncers: (configs, state, server-actions)->
    previous = null
    result = {}
    for config in configs
      if typeof config is 'object' # syncer-name: {is-global: true | false}
        syncer-name = Object.keys config .0
        is-global = config[syncer-name].is-global
      else
        syncer-name = config
        is-global = false

      current = @create syncer-name, state, is-global, server-actions
      previous.channel.connect current.channel if previous isnt null
      result[syncer-name] = current ; previous = current
    result

  create: (name, state, is-global, server-actions)->
    switch name
    | 'tabs'  => channel = new local-storage-channel 'tabs', state, server-actions, is-global
    | 'web'   => channel = new web-channel 'web', state, server-actions
    # | otherwise console.error "can't find a channel for syncer #{name}"
    new syncer channel, state

  # activate-all-syncers: (syncers, done)!-> util.All-done-waiter.all-complete syncers, 'initial', done
      

