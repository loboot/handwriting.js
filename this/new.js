/**
 * new
 * 1.创建新对象
 * 2.将this赋值给新对象
 * 3.添加属性和方法
 * 4.返回新对象
 */

function Foo() {
  this.bar = 'Lucas';
}

const instance = new Foo();
console.log(instance.bar);
