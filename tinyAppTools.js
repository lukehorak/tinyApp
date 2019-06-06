const crypto = require("crypto");

module.exports = {
  generateRandomString: function (length) {
    if (length > 50 || length < 0 || length % 1 !== 0) {
      throw new RangeError("generateRandomString() must take a positive integer, and maxes out and a length of 50 characters!")
    }
    const randString = crypto.randomBytes(25).toString('hex');
    return randString.substring(0, length)
  },
  idExists: function (resource, id) {
    return resource.hasOwnProperty(id)
  },
  generateUniqueId: function(resource, idLength) {
    let id;
    do{
      id = this.generateRandomString(idLength)
    }
    while (this.idExists(resource, id));
    return id;
  },
  propertyTakenBy: function(propName, resource, property){
    for(let id in resource){
      if (resource[id][propName] === property){
        return id;
      }
    }
    return undefined;
  },
  urlsForUser: function(resource, id){
    const urls = {}
    for(let i in resource){
      if (resource[i].userID === id){
        urls[i] = resource[i].longURL;
      }
    }
    return (urls === {} > 0 ? undefined : urls)
  }
}