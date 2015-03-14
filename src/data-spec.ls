# 职责：列表应用中所用的所有数据
# 用法：将数据（data的子类）加到require中，即可被data-manager初始化。

define (require, exports, module) ->
  # require! <[ mask/comment-data info-bar/info-bar-data menu/message/message-data menu/sign/user-data ]>
  #require! <[ widgets/comment/comment-data widgets/topic/topic-data widgets/sign/user-data]>
  #[user-data, comment-data, topic-data]
