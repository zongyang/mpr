define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui','../widget-util' }

  ui.create-widget {
    name:'select-mall-shop'
    states-app-pages-map: {'show': <[select-mall-shop]>}

    activate:!->
  }