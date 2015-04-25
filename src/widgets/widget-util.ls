define (require, exports, module) ->
	modal-show:(title,info,ok,cancle)!->
		m=$ '.ui.small.modal'
		m.modal do
			onApprove:ok 
			onDeny:cancle
		m.find '.header p' .text title
		m.find '.content p' .text info
		m.modal 'show'

	chang-tips:(cls,type)!->
		all=$ '#select-mall-shop .row.'+cls
		self=all.filter('.'+type).remove-class 'hidden'
		self.siblings!.add-class 'hidden'

	add-check:(cls)->
		modal=$ '.ui.moadl.'+cls
		name=modal.find('.name input').val()
		address=modal.find('.address input').val()

		if !name
			modal.find('.name').add-class('error')
			return false
		if !address
			modal.find('.address').add-class('error')
			return false
		return true

	add-mall-modal-show:!->
		m=$('.ui.modal.mall')
			#m.modal do
			#onApprove:null 
			#onDeny:null
		m.find('.name,.address').remove-class('error')
		m.find('.name,.address input').val('')
		m.modal 'show'

	add-shop-modal-show:!->
		m=$ '.ui.modal.shop'
			#m.modal do
			#onApprove:null 
			#onDeny:null
		m.modal 'show'
