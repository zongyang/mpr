define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'take-photo'
    states-app-pages-map: {'show': <[take-photo]>}
    camera-file-input:$ '#take-photo .back-input input'
    up-photo:$ '#up-photo .selected-file'
    activate:!->
       @add-up-btn-evet!

    add-up-btn-evet:!->
       @camera-file-input[0].onchange =!~>
            file=@camera-file-input[0].files[0]
            reader=new File-Reader!
            reader.read-as-data-URL file
            reader.onload= !~>
                @up-photo[0].src=reader.result
  }
    