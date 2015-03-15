
define (require, exports, module) ->
  require! ['jquery', state, 'common/ui']
  scroll-to = (top)!-> set-timeout (!-> ui.scroll-top top), 50ms # 用settimeout，避免页面状态未变更就滚动屏幕，导致原有屏幕位置记录不正确。

  scroll-to-top = !-> scroll-to 0

  pages: <[take-photo analysis]>
  
  transitions:
    'take-photo     ->  up-photo'         : 'click'           : hot-area : ($ '#take-photo button'),  action: !~> console.log('photo click')
    'analysis       ->  take-photo'       : 'click'           : hot-area : ($ '#analysis .footer .button.again'), action: !~> console.log('ana click')
    'analysis       ->  share'            : 'click'           : hot-area : ($ '#analysis .button.share'), action: !~> console.log('ana click')
    'share          ->  analysis'         : 'click'           :hot-area  : ($ '#share .head .remove'),action:!->
    #'a -> b': '@+:take-photo': action: !->