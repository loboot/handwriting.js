/**
 * 全局环境的this
 */

function f1() {
  console.log(this); //globalThis
}

function f2() {
  'use strict';
  console.log(this); //undefined
}

f1();
f2();

const foo = {
  bar: 10,
  fn() {
    console.log(this);
    console.log(this.bar);
  },
};

const fn = foo.fn;
fn(); //undefined
foo.fn();
