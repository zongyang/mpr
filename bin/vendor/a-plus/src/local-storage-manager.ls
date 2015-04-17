define (require, exports, module) ->
  require! <[ util ]> 

  DELIMITER = '::'
  PREFIX = '@+'

  # event = {url, channel, type, state} 
  on: (_event, _callback)!-> let event = _event, callback = _callback # 注意，必须用闭包保证回调时event和callback的正确性！
    window.add-event-listener 'storage', (storage-event)!~>
      # console.log "\n\n*************** storage key: #{storage-event.key} ***************\n\n" if storage-event.key isnt 'at-plus-master-heart-beating-token'
      callback @parse storage-event if @is-for-me event, storage-event # storage-event = {key: channel::url::state::type, new-value, old-value, action}

  is-for-me: (event, storage-event)-> 
    [prefix, channel, url, state, type] = @parse-key storage-event.key
    
    channel is event.channel  and 
    state   is event.state    and 
    type    is event.type     and 
    (url    is window.host-page-url or event.is-for-all-url?!)


  emit: (event, message)!-> # message就是change（参见channel.ls）{new-value, old-value, action}
    message = {url: window.host-page-url} if typeof message is 'undefined'
    message.random =  @random-to-avoid-storage-event-untriggered-with-same-value! if typeof message is 'object'
    window.local-storage.set-item (@compose-key event, message), (@compose-value message)

  # update: (attr, {url, new-value, action, channel})->
  #   url ||= window.host-page-url
  #   new-value ||= {}
  #   new-value.random =  @random-to-avoid-storage-event-untriggered-with-same-value!
  #   window.local-storage.set-item (@compose-key {url, attr, action, channel}), @compose-value new-value

  # update-global: (attr, {url, data, action})-> @update attr, {url, new-value: data, action}

  set: (attr, value)!-> window.local-storage.set-item attr, @compose-value value

  get: (attr)-> @parse-value window.local-storage.get-item attr

  # remove: (attr, action)!-> window.local-storage.remove-item @compose-key attr, action

  # increase: (attr)!-> if (window.local-storage.get-item attr) isnt null
  #   window.local-storage.set-item attr, (parse-int window.local-storage.get-item attr) + 1

  # decrease: (attr)!-> if (window.local-storage.get-item attr) isnt null
  #   window.local-storage.set-item attr, (parse-int window.local-storage.get-item attr) - 1

  # is-zero: (attr)-> 
  #   if (window.local-storage.get-item attr) is 0
  #     true
  #   else if (window.local-storage.get-item attr) is null
  #     @set attr, 0
  #     true
  #   else
  #     false

  compose-key: ({channel, state, type}, message)-> 
    url = message.url
    key = [PREFIX, channel, url, state, type].join DELIMITER
    # console.log "key: #{key}"
    key

  parse-key: (key)-> [PREFIX, channel, url, state, type] = key.split DELIMITER


  parse: (event)-> @parse-value event.new-value

  compose-value: (obj)-> JSON.stringify ...

  parse-value: (str)-> JSON.parse ...


  random-to-avoid-storage-event-untriggered-with-same-value: util.get-random-key





