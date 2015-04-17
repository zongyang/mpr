# 职责：所有远程数据的基类（抽象类）
# 设计要点：所有子类必须提供以下类变量： 
#     state-name # 本地state的名称，通常array为复数，object为单数
#     is-array   # 数据是否为数组
#
#     1）子类可以通过is-global说明数据与url无关，会在所有页面同步
#     2）子类可以通过类变量local-attributes 说明属性仅仅是客户端使用，传输到server之前要去掉。
#     3）子类可以提供initial-data类方法，在完成了从服务器和同url标签页初始化数据后，进一步初始化数据。

define (require, exports, module) -> 
  require! {'state', 'util'}

  class Abstract-data # abstract
    @syncers = ['tabs', 'web'] 
    @global-syncers = [ {tabs: is-global: true}, 'web' ]
    @server-actions = []
    @is-global = false


    @create-local-state = !->
      @local-state = state.sync.add {
        name: @state-name
        unmarshal-constructor: @
        @is-array
        syncers: (if @is-global then @global-syncers else @syncers) 
        @initial-data
        @is-global
        @server-actions
      }
      @syncer = @local-state.state.syncers.tabs or @local-state.state.syncers.web # 多tab环境时要用tabs syncer，否则仅仅用web syncer即可。

    @initial-data = (done)!-> done! # adaptor method, do nothing, subclasses can override it to do things they want

    @reload = (done)!-> @syncer.reload-data done

    (json-object, is-server-data = true)->
      @create-from-json-object json-object, is-server-data
      @adapt-for-local! if is-server-data


    create-from-json-object: (json-object, is-server-data)!->
      # console.error "element of remote array data #{json-object} doesn't have id!" if (typeof json-object is 'object' and not json-object.id ) and @@@is-array
      @id = util.get-random-key! if (typeof json-object is 'object' and not json-object.id ) and @@@is-array if not is-server-data
      @ <<< json-object
      @.at-plus-source ||= 'browser'

    change-from-underline-id-to-id: !-> (@id = @_id ; delete @_id) if @_id? # 服务端MongoDB用_id，将取回数据的_id改为id

    change-from-id-to-underline-id: (data)!-> (data._id = data.id ; delete data.id) if data.id?

    change-attribute-name: (old-name, new-name, data)!->
      data ||= @
      if data[old-name]?
        data[new-name] = data[old-name] 
        delete data[old-name]


    adapt-for-local: !-> @change-from-underline-id-to-id! # adaptr method, do nothing, subclasses can override it to do things they want

    prepare-for-server: ->
      data = {} <<< @
      [delete data[property.camelize!] for property in @@@local-attributes] if @@@local-attributes
      @adapt-for-server data
      data

    adapt-for-server: (data)!-> @change-from-id-to-underline-id data

    # 用此方法更新，会触发local-state的observers；直接赋值data或其属性，不会触发observers。
    update: (new-value-or-attribute-path, attribute-value)-> 
      if not new-value-or-attribute-path?
        new-value = @
      else if new-value-or-attribute-path? and not attribute-value?
        new-value = new-value-or-attribute-path
      else
        @[new-value-or-attribute-path.camelize!] = attribute-value 
        new-value = @

      new-value <<< new @@@local-state.state.unmarshal-constructor new-value # 注意: 这里将新的object import回旧object，以免引用旧object的关系断裂。
      if @@@is-array then (@@@local-state.get-element @id) new-value else @@@local-state new-value

    excute-on-server: (action, new-value, _callback, data-handler)!-> 
      # console.error "#{server-action} isn't defined" if action not in @@@server-actions

      data-handler ||= (data)!~> 
        self = @
        set-timeout (!~> self.update self <<< data.new-value), 0 # 如果没有定义data-handler，默认从服务端取回数据后，更新本地数据。用set-timeout，以便突破Syncer.guard-for-not-execute-observers-of-syncers，将更新传播到其余tab上。

      @@@syncer.execute-server-action {action, @id, new-value} <<< callback: (error, data)!->
        if error
          _callback? {result: 'failed', cause: error}
        else
          data-handler data
          set-timeout (!-> 
            set-timeout (!-> 
              _callback? {result: 'success'}
            ), 0), 0
