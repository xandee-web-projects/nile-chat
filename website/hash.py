from hashlib import md5, sha256
from flask.json import dumps

def h(txt, alg=md5):
    encode = dumps(txt, sort_keys=True).encode()
    hash_v = alg(encode).hexdigest()
    return hash_v

def hsh(txt):
    a = h(txt)+h(txt, sha256)
    b = h(txt, sha256)+h(txt)
    r = h(a+b)
    return r
