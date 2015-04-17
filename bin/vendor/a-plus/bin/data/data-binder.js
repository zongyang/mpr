(function(){
  define(function(require, exports, module){
    return {
      bind: function(arg$){
        var state, view, config, attributes, selectorSuffix, this$ = this;
        state = arg$.state, view = arg$.view, config = arg$.config, attributes = arg$.attributes, selectorSuffix = arg$.selectorSuffix;
        if (typeof attributes !== 'undefined') {
          config = this.getConfig(attributes, selectorSuffix);
        }
        state.observe(function(data){
          this$.updateView({
            view: view,
            data: data,
            config: config
          });
        });
        this.initialViewData({
          view: view,
          data: state(),
          config: config
        });
      },
      getConfig: function(attributes, selectorSuffix){
        var config, selector, i$, len$, attr;
        if (attributes === null) {
          attributes = ['PRIMITIVE-VALUE'];
        }
        config = {};
        if (selectorSuffix) {
          selector = ' ' + selectorSuffix;
        }
        for (i$ = 0, len$ = attributes.length; i$ < len$; ++i$) {
          attr = attributes[i$];
          config[attr] = {
            selector: selector
          };
        }
        return config;
      },
      updateView: function(arg$){
        var view, data, config, attrName, attrConfig, i$, len$, ref$, selector, attr, transfermer, element, value;
        view = arg$.view, data = arg$.data, config = arg$.config;
        if (config == null) {
          this.updateElement({
            element: view,
            value: data
          });
        } else {
          for (attrName in config) {
            attrConfig = config[attrName];
            if (!Array.isArray(attrConfig)) {
              attrConfig = [attrConfig];
            }
            for (i$ = 0, len$ = attrConfig.length; i$ < len$; ++i$) {
              ref$ = attrConfig[i$], selector = ref$.selector, attr = ref$.attr, transfermer = ref$.transfermer;
              element = this.getTargetElemet(view, attrName, selector);
              value = attrName === 'PRIMITIVE-VALUE'
                ? data
                : this.getValue(data, attrName);
              this.updateElement({
                element: element,
                attr: attr,
                value: value,
                transfermer: transfermer
              });
            }
          }
        }
      },
      getTargetElemet: function(view, attrName, selector){
        if (attrName === 'PRIMITIVE-VALUE') {
          if (selector) {
            return view.find(selector);
          } else {
            return view;
          }
        } else {
          return view.find('.' + attrName + (selector ? ' ' + selector : ''));
        }
      },
      getValue: function(data, attrName){
        var attrPathName, attr, value, e;
        attrPathName = (function(){
          var i$, ref$, len$, results$ = [];
          for (i$ = 0, len$ = (ref$ = attrName.split('.')).length; i$ < len$; ++i$) {
            attr = ref$[i$];
            results$.push(attr.camelize());
          }
          return results$;
        }()).join('.');
        try {
          value = eval('data' + '.' + attrPathName);
        } catch (e$) {
          e = e$;
          value = null;
        }
        return value;
      },
      initialViewData: function(){
        this.updateView.apply(this, arguments);
      },
      updateElement: function(arg$){
        var element, attr, value, transfermer;
        element = arg$.element, attr = arg$.attr, value = arg$.value, transfermer = arg$.transfermer;
        value = transfermer != null ? transfermer(value) : value;
        if (value === undefined) {
          return;
        }
        if (attr != null) {
          element.attr(attr, value);
        } else {
          element.text(value);
        }
      }
    };
  });
}).call(this);
