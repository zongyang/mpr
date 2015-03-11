# ------------------------- 注意！ ------------------------- #
#               要根据实际部署情况调整以下host参数               #
# host =
#   is-using-mediate-server: true
#   is-reverse-proxy: false   # host是否通过反向代理出去
#   scheme: "http"            # 协议 http | https | both
#   name: "www.at-plus.org"   # ip | 域名，使用反向代理时，为公网可见ip或域名
#   port: 80                  # 端口，可缺省（http为80，https为443）
#   path: "."                 # 路径。通常不用，反向代理时，如果没有独立域名，则需要使用。注意，可能会有比较多问题。
#   livereload: false          # 端口号 | false （不使用）。开发时（非反向代理时使用），反向代理时为false
#   end-server:               # 真正的data-server
#     port: 80
#     url: 'http://www.at-plus.org'              

#   lbs:
#     provider: 'baidu'
#     ak: 'tQCo5P8GsGsAHyPF5qAzIWYp'            


host =
  is-using-mediate-server: false
  is-reverse-proxy: false   # host是否通过反向代理出去
  scheme: "http"            # 协议 http | https | both
  name: "localhost"   # ip | 域名，使用反向代理时，为公网可见ip或域名
  port: 8888                 # 端口，可缺省（http为80，https为443）
  path: "."                 # 路径。通常不用，反向代理时，如果没有独立域名，则需要使用。注意，可能会有比较多问题。
  livereload: 8081          # 端口号 | false （不使用）。开发时（非反向代理时使用），反向代理时为false
  end-server:               # 真正的data-server
    port: 8888
    url: 'http://localhost:8888'              

  lbs:
    provider: 'baidu'
    ak: 'tQCo5P8GsGsAHyPF5qAzIWYp'            

host.origin = host.scheme + '://' + host.name + (if host.port then ":" + host.port else '') + (if host.path then "/" + host.path else '')
host.port = 80 if not host.port
  
  

if typeof window is 'undefined' # for server CommonJS environment
  module.exports = exports = host
# else if typeof at-plus-origin isnt 'undefined' # direct use in insert-at-plus.js
#   window.host-config = host 
else # for AMD environment at at-plus-page
  define (require, module, exports)-> host