# 职责：管理所有远程数据

define (require, exports, module) ->
  require! <[ all-data state util ]>

  initial-remote-data: (primary-data-name, before-sync-data, done)!->
    (done = before-sync-data; before-sync-data = null) if not done? 
    [data.create-local-state! for data in all-data]
    before-sync-data?!
    state.sync.initial-all-sync-data primary-data-name, done

  reload-remote-data: (data-or-data-names-list, done)!->
    data-or-data-names-list = [data-or-data-names-list] if not Array.is-array data-or-data-names-list 
    data-list = if typeof data-or-data-names-list[0] is 'object' then data-or-data-names-list else @get-data-list-from-data-names data-or-data-names-list
    util.All-done-waiter.all-complete data-list, 'reload', done

  get-data-list-from-data-names: (data-names)!-> [data for data in all-data when data.display-name in data-names]

