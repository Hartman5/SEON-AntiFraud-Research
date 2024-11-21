v = require('crypto')

function btoa(str) {
  return Buffer.from(str).toString('base64')
}

f = function() {
    var r = new Uint8Array(16);
    for (var t = 0; t < 16; t += 65536)
        v.getRandomValues(r.subarray(t, t + Math.min(16 - t, 65536)));
    return r
}()

w = btoa(f)
console.log(w)