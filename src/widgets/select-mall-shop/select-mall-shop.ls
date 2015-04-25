define (require, exports, module) ->
	require! {util,'state','state/state-machine','data/data-binder','common/ui','../widget-util'}
	ui.create-widget {
	name:'select-mall-shop'
	states-app-pages-map: {'show': <[select-mall-shop]>}
	activate:!->
		@init-search-input!
		@add-events!

	init-search-input:!->
		$that=this
		$ '.ui.search.mall' .search do
			api-settings :
				url: '/select-mall-shop/query-mall/{query}'
			searchDelay: 500
			on-results:(response)!->
				if !response.success
					return
				if response.results.length<=0
					$that.change-tips 'mall','notfound'
			on-select:(result,response)!->
				$that.change-tips 'mall','ok'
				$that.init-shop-search-input result.id

		.find('input').remove-class('prompt')#如果input 不加上个prompt search就会不起作用

		$ '.ui.search.shop input' .remove-class 'prompt'

		
	init-shop-search-input:(mall-id)->
		$ '.ui.search.shop input' .add-class 'prompt'
		$ '.ui.search.shop' .search do
			api-settings :
				url: '/select-mall-shop/query-shop/'+mall-id+'/{query}'
			searchDelay: 500
			on-results:(response)!->
				if !response.success
					return
				if response.results.length<=0
					$that.change-tips 'shop','notfound'
			on-select:(result,response)!->
				$that.change-tips 'shop','ok'
		.find('input').remove-class('prompt')

	add-events:!->
		$that=this
		$('#select-mall-shop .mall.notfound a').click !~>
			$that.add-mall-modal-show!
		$('#select-mall-shop .shop.notfound a').click !~>
			$that.add-shop-modal-show!
		

	modal-show:(title,info,ok,cancle)!->
		m=$ '.ui.small.modal'
		m.modal do
			onApprove:ok 
			onDeny:cancle
		m.find '.header p' .text title
		m.find '.content p' .text info
		m.modal 'show'

	change-tips:(cls,type,info)!->
		all=$ '#select-mall-shop .row.'+cls
		self=all.filter('.'+type).remove-class 'hidden'
		self.siblings!.add-class 'hidden'

		if info
			self.find('.content').text(info)

	check-field:(cls)->
		modal=$ '.ui.modal.'+cls
		name=modal.find('.name input').val()
		address=modal.find('.address input').val()
		modal.find('.name').remove-class('error')
		modal.find('.address').remove-class('error')
		if !name
			modal.find('.name').add-class('error')
			return false
		if !address
			modal.find('.address').add-class('error')
			return false
		return do
			name:name
			address:address

	add-mall-modal-show:!->
		$that=this
		m=$('.ui.modal.mall')
		m.modal do
			onApprove:!->
				result=$that.check-field('mall')

				if !result
					return false
				$.ajax do
					url:'/select-mall-shop/add-mall'
					data:result
					success:(data)!->
						if data.success
							$that.change-tips('mall','add')
							$('#select-mall-shop .ui.search.mall input').val(result.name)
							$that.init-shop-search-input result.id
						else
							$that.change-tips('mall','invalid',data.info)


		m.find('.name,.address').remove-class('error').find('input').val('')
		m.modal 'show'

	add-shop-modal-show:!->
		m=$ '.ui.modal.shop'
			#m.modal do
			#onApprove:null 
			#onDeny:null
		m.modal 'show'

	}