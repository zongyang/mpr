define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'take-photo'

    states-app-pages-map: {'show': <[take-photo]>}

    activate:!->
       console.log('activate test')
  }
    