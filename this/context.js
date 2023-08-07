/**
 * 上下文对象的this
 */

const student = {
  name: 'Lucas',
  fn() {
    return this;
  },
};

console.log(student.fn() === student); // true

const o1 = {
  text: 'o1',
  fn() {
    return this.text;
  },
};

const o2 = {
  text: 'o2',
  fn() {
    return o1.fn();
  },
};

const o3 = {
  text: 'o3',
  fn() {
    const fn = o1.fn;
    return fn(); //全局this
  },
};

console.log(o1.fn()); //o1
console.log(o2.fn()); //o1
console.log(o3.fn()); //undefined
