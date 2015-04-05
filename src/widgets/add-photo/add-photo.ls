define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui' }

  ui.create-widget {
    name:'add-photo'
    file-input: $ '#add-photo .back-input input'
    scan-seg: $ '#add-photo .scan-seg'
    states-app-pages-map: {'show': <[add-photo]>}

    activate:!->
       @add-inputfile-event!

    create-img-column:(src)->
        html='<div class="column">'
        html+='<div class="ui image">'
        html+='<a class="ui left green corner label">'
        html+='<i class="checkmark icon">'
        html+='</i>'
        html+='</a>'
        html+='<img src="'+src+'">'
        html+='</img>'
        html+='</div>'
        html+='</div>'

        column=$ html
        column.click ->
           $ @ .find 'a' .toggleClass 'green'

        @scan-seg.append column

    select-change:!->

    readAsDataURL:(file)!->
        reader=new FileReader!
        reader.readAsDataURL file
        reader.onload=!~>
            @create-img-column reader.result

    add-inputfile-event:!->
        if typeof FileReader=='undefined'
            return console.log '浏览器不支持！'

        @file-input.change !~>
            files=@file-input[0].files
            reg-str=/image\/\w+/
            
            for i from 0 to files.length-1
                if !reg-str.test files[i].type
                    return console.log '第'+i+'个文件不是图片！'
                @readAsDataURL files[i] 


  }
    



