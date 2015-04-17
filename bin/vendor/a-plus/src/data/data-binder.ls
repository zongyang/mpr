# 职责：将model（state）绑定到view上
# 设计决策：仅仅是数据层面，不涉及UI和交互

define (require, exports, module) ->

  # bind可以详细定义，即用config来逐一针对要绑定的属性名来定义；也可以用attributes、selector-suffix简单定义。
  # 简单定义： attributes，将绑定到view上的属性名称数组，默认情况下，对于的html元素将会有同属性名的class；selector-suffix 在class确定的元素下，需要加入的子孙元素selector
  # 详细（逐一）定义：config = {attr-name: [{selector, attr, transfermer}]} attr-name: state属性，selector，html元素选择器，attr：如果更新的不是html元素的内容（text），而是其某个属性（attr），例如img的src，transfermer：将state属性值做改变后再更新到html
  bind: ({state, view, config, attributes, selector-suffix})!-> 
    config = @get-config attributes, selector-suffix if typeof attributes isnt 'undefined'
    state.observe (data)!~> @update-view {view, data, config}
    @initial-view-data {view, data: state!, config}

  get-config: (attributes, selector-suffix)->
    attributes = ['PRIMITIVE-VALUE'] if attributes is null # 此时为基本数据类型，没有属性
    config = {} ; selector = ' ' + selector-suffix if selector-suffix
    [config[attr] = {selector} for attr in attributes]
    config

  update-view: ({view, data, config})!->
    if not config? # data为基本数据类型
      @update-element {element: view, value: data}
    else
      for attr-name, attr-config of config
        attr-config = [attr-config] if not Array.is-array attr-config
        for {selector, attr, transfermer} in attr-config
          element = @get-target-elemet view, attr-name, selector
          value = if attr-name is 'PRIMITIVE-VALUE' then data else @get-value data, attr-name
          @update-element {element, attr, value, transfermer}


  get-target-elemet: (view, attr-name, selector)-> 
    if attr-name is 'PRIMITIVE-VALUE' 
      if selector then view.find selector else view
    else
      view.find ('.' + attr-name + (if selector then ' ' + selector else ''))

  get-value: (data, attr-name)->
    # data?[attr-name.camelize!]
    attr-path-name = [attr.camelize! for attr in attr-name.split '.'].join '.'
    try
      value = eval 'data' + '.' + attr-path-name
    catch
      value = null
    value

  initial-view-data: !-> @update-view ...

  update-element: ({element, attr, value, transfermer})!->
    value = if transfermer? then transfermer value else value # TODO：这里null不transform不尽科学，可能需要改进。例如@+MW，无法定位用null表达的话，无法定位的逻辑就不能在transfermer中实现了，目前只好用false表达无法定位。
    # value = if transfermer? and value? then transfermer value else value # TODO：这里null不transform不尽科学，可能需要改进。例如@+MW，无法定位用null表达的话，无法定位的逻辑就不能在transfermer中实现了，目前只好用false表达无法定位。
    return if value is undefined # 当transfermer返回为undefined时，不改变现有值
    if attr?
      element.attr attr, value
    else
      element.text value
       


