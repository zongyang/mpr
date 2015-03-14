define (require, exports, module) ->
  require! {'util', 'state', 'syncers-factory/web-channel', 'data', 'common/ui'/*, 'widgets/sign/user-data': 'User'*/}
  window.is-at-plus-running-as-master = state.add 'is-at-plus-running-as-master'
  state.is-at-plus-running-as-master true 

  get-current-address = (done)!->
    get-current-position (error, current-position)!->
      if not error 
        geo-resolver = new B-map.Geocoder!
        geo-resolver.get-location (new B-map.Point current-position.longitude, current-position.latitude), (result)!->
          state.add 'current-location', result.address
          done!
      else
          state.add 'current-location', '浏览器无法获得当前地理位置？检查一下吧。'
          done!

  get-current-position = (done)->
    geo-locator = new B-map.Geolocation!
    if navigator.geolocation
      geo-locator.get-current-position ((result)!-> done null, result), ((error)!-> done error), {maximum-age:600000, timeout:10000, enable-high-accuracy: true}
    else
      done '浏览器不支持navigator.geolocation'


  activate: (done)!->

    # master-competitor.activate !->        # 竞争master，state.is-at-plus-running-as-master
    web-channel.activate (user, is-master)!->
      data.initial-remote-data primary-data-name = 'current-user', !->
        # get-current-address !->   
        #state.add 'current-location', '调试中，不拿当前地址。'
        # console.log "comments loaded! ", state.comments!

        # ui.extend-scroll-event!
        # current-user = new User user
        # state.current-user current-user
        done!

          # if window.is-on-extension-background-page 
          #   $.cookie 'extension', 'installed', path: '/' # 标注好cookie，随后该浏览器向at-plus server发请求时，会带上，server判定@+ Link的走向时，从此区分是否有@+插件，是否需要重定向到安装页面。
          # else
          #   done!
        # data.initial-remote-data primary-data-name = 'current-user', before-sync-data = !-> # 在初始化数据前，要先确定当前用户身份。
        #   if is-master
        #     current-user = new User user
        #     state.current-user current-user
        # , done
