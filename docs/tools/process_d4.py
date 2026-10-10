"""DAY4 日志页（docs/specs/4.日志页面.pdf）的素材处理。

用法：python3 -I docs/tools/process_d4.py docs/source-images/d4 site/assets/img/d4
需要：numpy、Pillow、opencv-python-headless
（源图从 PDF 里 pdfimages -all 抽出；银莲花是用户给的 anemone-assets-v2.zip，解压在 anemone-v2/）
"""
import sys, os
import numpy as np
import cv2
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
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


def trim(img, pad=4):
    ys, xs = np.where(img[:, :, 3] > 8)
    y0, y1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    return img[y0:y1, x0:x1]


def masked(name, mask):
    img = cv2.cvtColor(src(name), cv2.COLOR_BGR2BGRA)
    img[:, :, 3] = src(mask, cv2.IMREAD_GRAYSCALE)
    return trim(img)


def png(path):
    """带透明的 PNG（Pillow 读，转成 OpenCV 的 BGRA）"""
    a = np.array(Image.open(path).convert('RGBA'))
    return cv2.cvtColor(a, cv2.COLOR_RGBA2BGRA)


# 莫比乌斯环月亮：裁掉四周多余的黑（中心圆月在原图 767, 503）
moons = src('moons-infinity.jpg')[200:780, 90:1446]
save('moons.webp', moons, 1600, q=88)

# 十字架：高饱和（月相页，只露底端尖端）/ 低饱和（纸后面）
save('cross.webp', masked('cross-blue.jpg', 'cross-blue-mask.png'), 1500, q=88)
save('cross-pale.webp', masked('cross-pale.jpg', 'cross-pale-mask.png'), 1500, q=86)

# 纸
save('paper.webp', src('paper.jpg'), 1500, q=86)

# 银莲花：四朵花 + 两份叶子（透明底）。叶子去掉一点绿，和花的低饱和对上
for n in ['flower-01-front', 'flower-02-wide', 'flower-03-side', 'flower-04-half-open']:
    save(n.replace('flower-', 'fl-')[:5] + '.webp', trim(png(os.path.join(SRC, 'anemone-v2', n + '.png'))), 520, q=84)
for n, out in [('leaf-single', 'leaf-1'), ('leaf-sprig', 'leaf-2')]:
    leaf = trim(png(os.path.join(SRC, 'anemone-v2', n + '.png')))
    bgr = leaf[:, :, :3].astype(np.float32)
    gray = bgr.mean(axis=2, keepdims=True)
    leaf[:, :, :3] = (gray + (bgr - gray) * 0.45).clip(0, 255).astype(np.uint8)
    save(out + '.webp', leaf, 520, q=84)
