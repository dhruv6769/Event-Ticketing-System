import urllib.request
import re
import ssl
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search(query):
    req = urllib.request.Request(
        'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query + ' poster'),
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        m = re.search(r'<img class="result__icon__img" src="//external-content\.duckduckgo\.com/iu/\?u=([^&"]+)', html)
        if m:
            return urllib.parse.unquote(m.group(1))
    except Exception as e:
        pass
    return None

def download(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = urllib.request.urlopen(req, context=ctx).read()
        with open(dest, 'wb') as f:
            f.write(data)
        print("Downloaded " + dest)
    except Exception as e:
        print("Failed " + dest + ": " + str(e))

qs = {
    'kalki': 'Kalki 2898 AD official poster vertical',
    'pushpa': 'Pushpa 2 The Rule official poster vertical',
    'dune': 'Dune Part Two IMAX poster',
    'ind-aus': 'India vs Australia cricket action shot vertical',
    'csk-mi': 'CSK MS Dhoni IPL vertical',
    'mi-dc': 'Mumbai Indians Rohit Sharma IPL vertical',
    'pkl': 'Pro Kabaddi League action vertical',
    'rcb-kkr': 'Virat Kohli RCB action vertical'
}

for name, q in qs.items():
    url = search(q)
    print(name + ": " + str(url))
    if url:
        download(url, "frontend/public/" + name + "_hr.jpg")
