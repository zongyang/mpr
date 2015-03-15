define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'analysis'
    candicates: $ '#analysis .sel-img span'
    cards:$ '#analysis .main-img.card'
    states-app-pages-map: {'show': <[analysis]>}

    activate:!->
       @add-event!

    add-event:!->
        @candicates .click (target)!~>
            self=$ target.current-target
            self .add-class 'selected' .siblings!.remove-class 'selected'
            index=@candicates .index self

            card=@cards.eq index 
            card.show 1000
            card.siblings '.main-img.card' .hide 1000

            #card.remove-class 'hidden' .siblings '.main-img.card' .add-class 'hidden'

  }
    



