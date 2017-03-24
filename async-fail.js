
async function sumOf1To(n) {
  if (n == 0) {
    return 0
  }

  return n + await sumOf1To(n - 1)
}

sumOf1To(100000)
.then(sum => console.log(sum))
.catch((err) => console.log(err.stack))
