define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'up-photo'
    states-app-pages-map: {'show': <[up-photo]>}

    activate:!->
      
  }
    