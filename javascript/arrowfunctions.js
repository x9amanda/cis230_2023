/* create a normal function, w/ args, return a value */
function add1(a, b) {
    const sum = a + b
    return sum
}

/* call the function and store the value returned */
let x = add1(5, 7)

console.log('add1 returned: ' + x)

/* transform add into an arrow function */
const add2 = (a, b) => {
    const sum = a + b
    return sum
}
let y = add2(12, 8)
console.log('add2 returned: ' + y)

/* in an arrow function, if the only statement is a return,
   we can write it two ways... */
const add3 = (a, b) => {
    return a + b
}
let z = add3(12, 88)
console.log('add3 returned: ' + z)

/* most concise way
   note: the value on the right of the arrow is what is returned
   note: we skip the braces and the word return for shorter code
*/
const add4 = (a,b) => a + b
let zz = add4(100, 200)
console.log('add4 returned: ' + zz)