'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var uid = 0;

var remove = function remove(arr, val) {
  if (arr.length) {
    var index = arr.indexOf(val);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }
};

/**
 * 依赖集合
 * Dep.target相当于一个全局变量，缓存观察者。当触发数据的getter时，调用depend，让watcher收集此依赖
 */

var Dep = function () {
  function Dep() {
    classCallCheck(this, Dep);

    this.id = uid++;
    this.subscribes = [];
  }

  createClass(Dep, [{
    key: "addSubs",
    value: function addSubs(watcher) {
      this.subscribes.push(watcher);
    }
  }, {
    key: "delSubs",
    value: function delSubs(watcher) {
      remove(this.subscribes, watcher);
    }

    /**
     * 事先init数据中的响应式getter, setter。
     * new Watcher时将会触发getter以收集依赖。
     * Watcher挂载到Dep.target静态属性上，然后触发已定义的getter。
     * 在触发事先定义的响应式getter后，getter再通知本依赖收集器是否应该收集此依赖。
     * 调用watcher的addDep后，由watcher中的逻辑过滤重复收集的依赖。
     * 判断不为重复收集的依赖则会回来调用收集器的addSubs。
     * 依赖收集完成。
     */

  }, {
    key: "depend",
    value: function depend() {
      if (Dep.target) {
        Dep.target.addDep(this);
      }
    }
  }, {
    key: "notify",
    value: function notify() {
      // 触发所有的watcher
      this.subscribes.slice().forEach(function (sub) {
        sub.update();
      });
    }
  }]);
  return Dep;
}();

Dep.target = null;

/**
 * Observer
 * 事先定义getter, setter，以及收集依赖逻辑。
 * 当新建watcher时即会触发getter，由此通知依赖收集器是否应收集当前的watcher。
 */

var Observer = function () {
  function Observer(value) {
    classCallCheck(this, Observer);

    this.value = value;
    // this.dep = new Dep()
    this.walk(this.value);
  }

  createClass(Observer, [{
    key: "walk",
    value: function walk(obj) {
      Object.keys(obj).forEach(function (key) {
        defineReactive(obj, key, obj[key]);
      });
    }
  }]);
  return Observer;
}();

var defineReactive = function defineReactive(obj, key, val) {
  var dep = new Dep(); //此处为当前键值对的依赖收集器

  // let childOb = observe(val) //递归调用observe，若不为对象则会return

  Object.defineProperty(obj, key, {
    get: function get$$1() {
      if (Dep.target) {
        dep.depend();
        // if (childOb) {
        //   childOb.dep.depend()
        // }
      }
      return val;
    },
    set: function set$$1(newVal) {
      val = newVal;
      // childOb = observe(val)
      dep.notify();
      return val;
    }
  });
};

var observe = function observe(value) {
  if ((typeof value === "undefined" ? "undefined" : _typeof(value)) !== 'object' || value == null) return;
  return new Observer(value);
};

var uid$1 = 0;

var parseExp = function parseExp(exp) {
  var keys = exp.split('.');
  return function (obj) {
    for (var i = 0; i < keys.length; i++) {
      obj = obj[keys[i]];
    }
    return obj;
  };
};

var Watcher = function () {
  function Watcher(vm, exp, cb) {
    classCallCheck(this, Watcher);

    this.id = uid$1++;
    this.cb = cb;
    this.vm = vm;
    // 防止多次求值重复收集依赖，记录上次求值中已被收集的依赖id
    this.deps = [];
    // 防止单次求值重复收集依赖，记录当次求值中已被收集的依赖id
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.getter = parseExp(exp);
    this.value = this.get();
  }

  createClass(Watcher, [{
    key: 'get',
    value: function get$$1() {
      //给依赖传递watcher
      Dep.target = this;
      var value = void 0;
      var vm = this.vm;
      try {
        // 调用getter，收集依赖
        value = this.getter.call(vm, vm);
      } catch (error) {
        console.log(error);
      } finally {
        //重置Dep.target
        Dep.target = null;
        this.cleanupDeps();
      }
      return value;
    }
  }, {
    key: 'addDep',
    value: function addDep(dep) {
      var id = dep.id;
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id);
        this.newDeps.push(dep);
        if (!this.depIds.has(id)) {
          dep.addSubs(this);
        }
      }
    }
  }, {
    key: 'cleanupDeps',
    value: function cleanupDeps() {
      var temp = this.depIds;
      // 保存上次求值收集的依赖id
      this.depIds = this.newDepIds;
      this.newDepIds = temp;
      // 清空newDepIds，用于收集下次求值依赖
      this.newDepIds.clear();
      // 同理...
      temp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = temp;
      this.newDeps.length = 0;
    }
  }, {
    key: 'update',
    value: function update() {
      this.invoke(this.cb);
    }
  }, {
    key: 'invoke',
    value: function invoke(cb) {
      var value = this.get();
      var vm = this.vm;
      if (value !== this.value) {
        var oldVal = this.value;
        this.value = value;
        cb.call(vm, oldVal, this.value);
      }
    }
  }]);
  return Watcher;
}();

var watch = function watch(data, exp, fn) {
  observe(data);
  var watcher = new Watcher(data, exp, fn);
};

exports.watch = watch;
