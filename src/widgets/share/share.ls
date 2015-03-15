define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'share'
    states-app-pages-map: {'show': <[share]>}

    activate:!->
       @add-event!

    add-event:!->

  }
    



