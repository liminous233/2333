"""八日日志 / 证物柜 / 守则 / 失踪档案的素材处理。

用法：python3 -I docs/tools/process_journal.py docs/source-images/journal site/assets/img/journal
需要：numpy、opencv-python-headless
（源图大多从 docs/specs/3.八日日志修改.pdf 里抽出来：pdfimages -all）
"""
import sys, os
import numpy as np
import cv2

SRC, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(SRC)))   # docs/
os.makedirs(OUT, exist_ok=True)


def src(name, flag=cv2.IMREAD_COLOR):
    return cv2.imread(os.path.join(SRC, name), flag)


def save(name, img, max_side=None, q=86):
    if max_side and max(img.shape[:2]) > max_side:
        s = max_side / max(img.shape[:2])
        img = cv2.resize(img, (round(img.shape[1] * s), round(img.shape[0] * s)), interpolation=cv2.INTER_AREA)
    path = os.path.join(OUT, name)
    cv2.imwrite(path, img, [cv2.IMWRITE_WEBP_QUALITY, q])
    print(name, img.shape[1], 'x', img.shape[0], os.path.getsize(path) // 1024, 'KB')


def with_alpha(img, mask):
    out = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    out[:, :, 3] = mask
    return out


def trim(img, pad=4):
    """按 alpha 裁掉四周空白"""
    ys, xs = np.where(img[:, :, 3] > 8)
    y0, y1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    return img[y0:y1, x0:x1]


# ---------- 八日日志：森林月相，最左边的满月改成双月 ----------
sky = src('moons-forest.jpg')
sky = sky[41:982].copy()                       # 去掉上下黑边，黑边由页面自己画
cx, cy, r = 335, 544 - 41, 55
patch = sky[cy - r - 4:cy + r + 5, cx - r - 4:cx + r + 5].astype(np.float32)
m = np.zeros(patch.shape[:2], np.float32)
cv2.circle(m, (r + 4, r + 4), r - 1, 1, -1, cv2.LINE_AA)
m = cv2.GaussianBlur(m, (0, 0), 1.2)[:, :, None]
# 第二个月亮放在左边（右边离下一个月亮太近），两个都提亮一点
dx, dy = -int(r * 0.7), -int(r * 0.12)
y0, x0 = cy - r - 4 + dy, cx - r - 4 + dx
base = sky[y0:y0 + patch.shape[0], x0:x0 + patch.shape[1]].astype(np.float32)
a = m * 0.8
sky[y0:y0 + patch.shape[0], x0:x0 + patch.shape[1]] = (base * (1 - a) + patch * 1.03 * a).clip(0, 255).astype(np.uint8)
# 提亮：只动两个圆里面，往白里推
lit = np.zeros(sky.shape[:2], np.float32)
cv2.circle(lit, (cx, cy), r, 1, -1, cv2.LINE_AA)
cv2.circle(lit, (cx + dx, cy + dy), r, 1, -1, cv2.LINE_AA)
lit = cv2.GaussianBlur(lit, (0, 0), 1.2)[:, :, None]
f = sky.astype(np.float32)
sky = (f * (1 - lit) + (f + (250 - f) * 0.42) * lit).clip(0, 255).astype(np.uint8)
save('moons.webp', sky, 1600, q=88)

# ---------- 证物柜：手提箱（背景压成纯白，和白底页面接上） ----------
case = src('briefcase.jpg')
g = cv2.cvtColor(case, cv2.COLOR_BGR2GRAY)
bg = (g > 244).astype(np.uint8)
n, lab = cv2.connectedComponents(bg)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
outside = np.isin(lab, list(edge))
case[outside] = 255
save('briefcase.webp', case, 1500, q=88)

# ---------- 游客守则：摊开的笔记本 ----------
book = src('rules-notebook.jpg')
gb = cv2.cvtColor(book, cv2.COLOR_BGR2GRAY)
fg = (gb > 22).astype(np.uint8) * 255
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
cnts, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
big = max(cnts, key=cv2.contourArea)
mask = np.zeros_like(gb)
cv2.drawContours(mask, [big], -1, 255, -1)
mask = cv2.GaussianBlur(mask, (0, 0), 1)
book_a = trim(with_alpha(book, mask))
save('notebook.webp', book_a, 1300, q=88)

# ---------- 失踪档案：牛皮纸袋（合 / 开）、旧纸、照片 ----------
for name in ('envelope-closed', 'envelope-open', 'old-paper'):
    img = src(name + '.jpg')
    a = src(name + '-mask.png', cv2.IMREAD_GRAYSCALE)
    save(name.replace('old-', '') + '.webp', trim(with_alpha(img, a)), 1100, q=86)

photo = src('photo.jpg')
gp = cv2.cvtColor(photo, cv2.COLOR_BGR2GRAY)
ys, xs = np.where(gp > 60)
photo = gp[ys.min():ys.max(), xs.min():xs.max()]
photo = cv2.cvtColor(photo, cv2.COLOR_GRAY2BGR)
save('photo.webp', photo, 700, q=82)

# ---------- 一朵银莲花：从首页用的去色花束里截出最上面那朵 ----------
fl = cv2.imread(os.path.join(ROOT, '..', 'site', 'assets', 'img', 'anemone-plain.png'), cv2.IMREAD_UNCHANGED)
keep = np.zeros(fl.shape[:2], np.uint8)
keep[30:405, 290:870] = 255          # 花头
keep[405:500, 585:870] = 255         # 右边的叶子（左边的和第二朵花叠在一起，不要）
keep[500:740, 588:670] = 255         # 茎
keep = cv2.GaussianBlur(keep, (0, 0), 2).astype(np.float32)
keep[660:740] *= np.linspace(1, 0, 80)[:, None]       # 茎的末端淡出
fl[:, :, 3] = np.minimum(fl[:, :, 3], keep.astype(np.uint8))
save('anemone.webp', trim(fl[:740]), 600, q=86)

# ---------- 香烛：用户用 GPT 生成的照片，抠掉白底（火苗还是代码叠上去） ----------
from PIL import Image
cd = cv2.cvtColor(np.array(Image.open(os.path.join(SRC, 'candle.webp')).convert('RGB')), cv2.COLOR_RGB2BGR)
lo = cd.min(axis=2)
bgm = (lo > 238).astype(np.uint8)
n, lab = cv2.connectedComponents(bgm)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
outside = np.isin(lab, list(edge)).astype(np.uint8)
alpha = (1 - outside) * 255
alpha = cv2.morphologyEx(alpha.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
alpha = cv2.GaussianBlur(alpha, (0, 0), 1.1)
save('candle.webp', trim(with_alpha(cd, alpha)), 700, q=88)
