function* test() {
    yield 'react'; 
    console.log('luis daniel');
    yield 'saga'; 
}

const iterator = test();

// console.log(test());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());