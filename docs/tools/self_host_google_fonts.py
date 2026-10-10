# 用法：先用 Chrome 的 UA 下载下面这个链接的 CSS，再 python3 self_host_google_fonts.py 下载的.css site/assets/fonts/google site/assets/fonts/google-fonts.css
CSS2_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Crimson+Pro:ital,wght@0,400;0,500;1,400&family=Cedarville+Cursive&family=DM+Serif+Display&family=Homemade+Apple&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&family=Noto+Serif+SC:wght@400;600;900&family=Pinyon+Script&family=Pirata+One&family=Roboto+Slab:wght@400;500&family=UnifrakturMaguntia&display=swap'
import re, os, sys, hashlib, urllib.request, concurrent.futures as cf
src, outdir, outcss = sys.argv[1:4]
css = open(src).read()
os.makedirs(outdir, exist_ok=True)
urls = sorted(set(re.findall(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", css)))
def name(u):
    parts = u.split('/')
    fam = parts[3]
    return fam + '-' + hashlib.sha1(u.encode()).hexdigest()[:10] + '.woff2'
def get(u):
    p = os.path.join(outdir, name(u))
    if not os.path.exists(p):
        with urllib.request.urlopen(u) as r: open(p, 'wb').write(r.read())
    return u
with cf.ThreadPoolExecutor(8) as ex: list(ex.map(get, urls))
for u in urls: css = css.replace(u, 'google/' + name(u))
css = "/* 谷歌字体本地副本（国内打不开 fonts.googleapis.com）。由 docs/tools/self_host_google_fonts.py 生成 */\n" + css
open(outcss, 'w').write(css)
print(len(urls), 'files')
