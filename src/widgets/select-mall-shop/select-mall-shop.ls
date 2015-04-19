define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui','../widget-util' }

  ui.create-widget {
    name:'select-mall-shop'
    states-app-pages-map: {'show': <[select-mall-shop]>}

    activate:!->
        @init-search-input!

    init-search-input:!~>
        $ '.ui.search' .search do
            api-settings :
                url: '/select-mall-shop/query-mall/{query}'
        .find('input').removeClass('prompt')#如果input 不加上个prompt search就会不起作用，应该是semantic的一个bug
  }