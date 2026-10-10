import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

# 用法：python3 -I process_anemone.py docs/source-images/anemone.jpg docs/source-images/rings.jpg site/assets/img
src_flower, src_rings, outdir = sys.argv[1:4]
SCALE = 2  # 原图偏小，放大两倍再处理，边缘更顺

# ---------- 1. 银莲花：去色 + 抠白底 ----------
fl = Image.open(src_flower).convert('RGB')
fl = fl.crop((0, 0, fl.width, fl.height - 6))  # 去掉原图底部的灰边
fl = fl.resize((fl.width * SCALE, fl.height * SCALE), Image.LANCZOS)
gray = ImageOps.grayscale(fl)
gray = ImageOps.autocontrast(gray, cutoff=1)

# 从四边泛洪填充接近纯白的背景
W, H = gray.size
mask = gray.point(lambda v: 255 if v > 236 else 0).convert('L')
seed = mask.copy()
for x in range(0, W, 8):
    for y in (0, H - 1):
        if seed.getpixel((x, y)) == 255:
            ImageDraw.floodfill(seed, (x, y), 128)
for y in range(0, H, 8):
    for x in (0, W - 1):
        if seed.getpixel((x, y)) == 255:
            ImageDraw.floodfill(seed, (x, y), 128)
# 被茎围住、不和四边相连的白底：按比例位置补几个起点
for fx, fy in ((0.53, 0.40), (0.52, 0.52), (0.50, 0.70), (0.47, 0.86), (0.46, 0.97), (0.50, 0.97),
               (0.475, 0.84), (0.48, 0.88), (0.485, 0.91), (0.49, 0.94), (0.47, 0.82)):
    p = (int(W * fx), int(H * fy))
    if seed.getpixel(p) == 255:
        ImageDraw.floodfill(seed, p, 128)
bg = np.array(seed) == 128
alpha = np.where(bg, 0, 255).astype(np.uint8)
alpha_img = Image.fromarray(alpha).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.4))
A = np.asarray(gray, dtype=np.float32) / 255.0

# ---------- 2. 同心圆：裁成和花一样大，液化扭曲 + 模糊 ----------
rg = ImageOps.grayscale(Image.open(src_rings))
s = min(rg.width, rg.height)
rg = rg.crop(((rg.width - s) // 2, (rg.height - s) // 2, (rg.width + s) // 2, (rg.height + s) // 2))
side = int(max(W, H) * 1.05)
rg = rg.resize((side, side), Image.LANCZOS)
# 圆心对准最大那朵花（上方那朵）的花心附近
cx, cy = int(W * 0.56), int(H * 0.22)
canvas = Image.new('L', (W, H), 255)
canvas.paste(rg, (cx - side // 2, cy - side // 2))
R = np.asarray(canvas, dtype=np.float32)

# 平滑噪声位移场（模拟液化）
rng = np.random.default_rng(7)
def smooth_noise(grid, amp):
    n = rng.standard_normal((grid, grid)).astype(np.float32)
    img = Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    img = img.filter(ImageFilter.GaussianBlur(18))
    a = np.asarray(img, dtype=np.float32) / 255.0
    return (a - a.mean()) * 2 * amp
dx = smooth_noise(6, 38 * SCALE / 2) + smooth_noise(14, 10 * SCALE / 2)
dy = smooth_noise(6, 38 * SCALE / 2) + smooth_noise(14, 10 * SCALE / 2)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
sx = np.clip(xx + dx, 0, W - 1).astype(np.int32)
sy = np.clip(yy + dy, 0, H - 1).astype(np.int32)
warped = R[sy, sx]
warped_img = Image.fromarray(warped.astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2 * SCALE / 2))
B = np.asarray(warped_img, dtype=np.float32) / 255.0

# ---------- 3. 实色混合（Hard Mix）----------
hard = (A + B >= 1.0).astype(np.float32)
# 深色部分（叶子、花心、茎）保持原样，同心圆纹只落在花瓣上
dark = np.clip((0.42 - A) / 0.12, 0, 1)
hard = hard * (1 - dark) + A * dark
# 图层不透明度：保留一点花本身的形体
mixed = A * 0.35 + hard * 0.65
out = (np.clip(mixed, 0, 1) * 255).astype(np.uint8)

rgba = Image.merge('RGBA', [Image.fromarray(out)] * 3 + [alpha_img])
rgba.save(f'{outdir}/anemone-rings.png', optimize=True)

# 没叠同心圆的去色版（鼠标经过时闪烁用）
plain = Image.merge('RGBA', [gray] * 3 + [alpha_img])
plain.save(f'{outdir}/anemone-plain.png', optimize=True)

# 预览：放在网站深色底上
for name, im in (('anemone-rings', rgba), ('anemone-plain', plain)):
    prev = Image.new('RGBA', im.size, (18, 22, 33, 255))
    prev.alpha_composite(im)
    prev.convert('RGB').save(f'{outdir}/preview-{name}.jpg', quality=88)
print('ok', W, H)
