'use strict'

function p(n) {
  return new Promise((resolve, reject) => {
    resolve(n + 123)
    if (typeof n === 'number') {
      reject(n)
    }
  })
}

p(123).then(res => console.log(res)).catch(err => console.log(err))