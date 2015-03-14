define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'analysis'

    states-app-pages-map: {'show': <[analysis]>}

    activate:!->
       console.log 1
  }
    



