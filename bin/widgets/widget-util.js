// Generated by LiveScript 1.3.1
(function(){
  define(function(require, exports, module){
    return {
      modalShow: function(title, info, ok, cancle){
        var m;
        m = $('.ui.small.modal');
        m.modal({
          onApprove: ok,
          onDeny: cancle
        });
        m.find('.header p').text(title);
        m.find('.content p').text(info);
        m.modal('show');
      }
    };
  });
}).call(this);