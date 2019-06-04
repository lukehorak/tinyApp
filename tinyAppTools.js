const crypto = require("crypto");

module.exports = {
  generateRandomString: (length) => {
    if (length > 50 || length < 0 || length % 1 !== 0) {
      throw new RangeError("generateRandomString() must take a positive integer, and maxes out and a length of 50 characters!")
    }
    const randString = crypto.randomBytes(25).toString('hex');
    return randString.substring(0, length)
  }
}