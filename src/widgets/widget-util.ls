define (require, exports, module) ->
	modalShow:(title,info,ok,cancle)!->
		m=$ '.ui.small.modal'
		m.modal do
			onApprove:ok 
			onDeny:cancle
		m.find '.header p' .text title
		m.find '.content p' .text info
		m.modal 'show'
