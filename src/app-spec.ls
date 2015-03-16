
define (require, exports, module) ->
  require! ['jquery', state, 'common/ui']

  pages: <[take-photo analysis]>

  add-states:!->
    state.add 'select-finish' : [true false]
    state.add 'up-photo-finish' :[true false]
    state.select-finish false
    state.up-photo-finish  false

  transitions:
    'take-photo     ->  up-photo'         : '@+:select-finish': condition : (select-finish)-> (select-finish is true)
    'analysis       ->  take-photo'       : 'click'           : hot-area : ($ '#analysis .footer .button.again'), action: !~> console.log('ana click')
    'analysis       ->  share'            : 'click'           : hot-area : ($ '#analysis .button.share'), action: !~> console.log('ana click')
    'share          ->  analysis'         : 'click'           : hot-area  : ($ '#share .head .remove'),action:!->
    'up-photo       ->  analysis'         : '@+:up-photo-finish':condition:(up-photo-finish)->(up-photo-finish is true)
    #'a -> b': '@+:take-photo': action: !->

