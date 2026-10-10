import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# 用法：python3 -I extract_moons_star.py docs/source-images site/assets/img
imgdir, outdir = sys.argv[1:3]

# ---------- 月亮：按亮度抠出来 ----------
moon = Image.open(f'{imgdir}/moons.jpg').convert('L')
boxes = [(48,92),(108,168),(187,254),(278,362),(393,489),(535,638),(684,780),(811,895),(919,986),(1004,1065),(1081,1125)]
a = np.asarray(moon)
def cut(i, name):
    x0, x1 = boxes[i]
    sub = a[:, x0:x1] > 60
    ys = np.where(sub.any(axis=1))[0]
    y0, y1 = ys.min(), ys.max() + 1
    pad = 4
    crop = moon.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    L = np.asarray(crop, dtype=np.float32)
    alpha = np.clip((L - 14) * 3.2, 0, 255).astype(np.uint8)
    rgb = np.clip(L * 1.12 + 10, 0, 255).astype(np.uint8)
    im = Image.merge('RGBA', [Image.fromarray(rgb)] * 3 + [Image.fromarray(alpha)])
    # 统一成正方形画布，月亮靠一侧对齐（让新月保持在圆的位置上）
    side = max(im.size)
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    ox = (side - im.width) if name in ('moon-5', 'moon-6') else (side - im.width) // 2
    # 亏月亮面在左：把裁出来的新月贴到左边，保持圆形位置
    if name in ('moon-5', 'moon-6'):
        ox = 0
    sq.paste(im, (ox, (side - im.height) // 2), im)
    sq = sq.resize((160, 160), Image.LANCZOS)
    sq.save(f'{outdir}/{name}.png', optimize=True)
# 第 1 天满月 → 第 6 天细月；第 7 天新月和第 8 天双月在网页里用满月合成
for name, i in (('moon-1', 5), ('moon-2', 6), ('moon-3', 7), ('moon-4', 8), ('moon-5', 9), ('moon-6', 10)):
    cut(i, name)

# ---------- 八角星：从罗盘图里只扣星形 ----------
st = Image.open(f'{imgdir}/compass.jpg').convert('L')
cx, cy = 247, 296
R = {0: 122, 90: 102, 180: 124, 270: 100, 45: 110, 135: 108, 225: 118, 315: 115}
pts = []
for k in range(16):
    ang = k * 22.5
    if k % 2 == 0:
        r = R[int(ang) % 360]
    else:
        r = 15
    t = math.radians(ang)
    pts.append((cx + math.cos(t) * r, cy + math.sin(t) * r))
mask = Image.new('L', st.size, 0)
ImageDraw.Draw(mask).polygon(pts, fill=255)
mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))
ink = np.clip((255 - np.asarray(st, dtype=np.float32) - 25) * 1.6, 0, 255)
alpha = (ink * np.asarray(mask, dtype=np.float32) / 255).astype(np.uint8)
w = Image.new('L', st.size, 255)
star = Image.merge('RGBA', [w, w, w, Image.fromarray(alpha)])
bbox = (cx - 130, cy - 130, cx + 130, cy + 130)
star = star.crop(bbox).resize((160, 160), Image.LANCZOS)
star.save(f'{outdir}/star.png', optimize=True)

print('ok')
