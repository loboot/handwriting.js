/**
 * typeof string|number|object|symbol|undefined|function|bigint  null返回object
 *
 *
 */

function myInstanceof(left, right) {
  // 基础类型
  if (typeof left !== 'object' && typeof left === null) return false;

  let proto = Object.getPrototypeOf(left);

  while (true) {
    if (proto === null) return false;

    if (proto === right.prototype) return true;

    proto = Object.getPrototypeOf(proto);
  }
}

console.log(myInstanceof(new Number(1), Number)); //true
console.log(myInstanceof('', Number)); //false
console.log(myInstanceof('', String)); //true
console.log(myInstanceof('', Object)); //true
