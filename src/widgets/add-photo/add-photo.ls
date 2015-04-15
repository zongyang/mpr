define (require, exports, module) ->
  require!  {util,'state', 'state/state-machine', 'data/data-binder', 'common/ui','../widget-util' }

  ui.create-widget {
    name:'add-photo'
    file-input: $ '#add-photo .back-input input'
    scan-seg: $ '#add-photo .scan-seg'
    up-btn: $ '#add-photo .upload-seg .up'
    mall-input: $ '#add-photo .address-seg .mall'
    shop-input: $ '#add-photo .address-seg .shop'
    address-input: $ '#add-photo .address-seg .address'
    states-app-pages-map: {'show': <[add-photo]>}

    activate:!->
       @add-inputfile-event!
       @add-up-btn-event!

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
            widget-util.modalShow('123','123');
            files=@file-input[0].files
            reg-str=/image\/\w+/
            
            for i from 0 to files.length-1
                if !reg-str.test files[i].type
                    return console.log '第'+i+'个文件不是图片！'
                @readAsDataURL files[i] 

    add-up-btn-event:!->
        @up-btn.click !~>
            mall=@mall-input.val!
            shop=@shop-input.val!
            address=@address-input.val!

            files=@file-input[0].files
            data=new FormData!
            #地址
            data.append 'mall',mall
            data.append 'shop',shop
            data.append 'address',address
            #文件
            for i from 0 to files.length-1
                data.append files[i].name,files[i]

            $.ajax do
                type: 'post'
                url: '/add-photo/uploads'
                data: data
                processData:false #告诉jquery不要去处理发送的数据
                contentType:false #告诉jquery不需要设置Content-type请求头
                success: (data)!->
                    console.log data
  }
    



