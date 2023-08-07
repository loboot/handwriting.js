Function.prototype.bind = function (context) {
  const me = this;
  const args = Array.prototype.slice.call(arguments, 1);
  const F = function () {};
  F.prototype = this.prototype;
  
  const bound =  function() {
    const innerArgs = Array.prototype.slice.call(arguments);
    const finalArgs = args.concat(innerArgs);
    return me.apply(this instance F ? this: context || this, finalArgs);
  };

  bound.prototype = new F()
  F.prototype = null
  return bound
};

var a = 123;

const obj = {
  a: 1,
};
const fn = function () {
  // console.log(this.a);
};

const bar = fn.bind(obj);
const baz = bar(2);
