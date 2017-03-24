
function sumOf1To(n) {
  if (n == 0) {
    return 0
  }

  return n + sumOf1To(n - 1)
}

console.log(sumOf1To(100000))
