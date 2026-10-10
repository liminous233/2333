"""教堂页 / 结局后首页变化（docs/specs/5.教堂界面.pdf）的素材处理。

用法：python3 -I docs/tools/process_church.py docs/source-images/church site/assets/img/church
需要：numpy、opencv-python-headless
"""
import sys, os
import numpy as np
import cv2

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)


def src(name):
    return cv2.imread(os.path.join(SRC, name), cv2.IMREAD_COLOR)


def save(name, img, max_side=None, q=86):
    if max_side and max(img.shape[:2]) > max_side:
        s = max_side / max(img.shape[:2])
        img = cv2.resize(img, (round(img.shape[1] * s), round(img.shape[0] * s)), interpolation=cv2.INTER_AREA)
    path = os.path.join(OUT, name)
    cv2.imwrite(path, img, [cv2.IMWRITE_WEBP_QUALITY, q])
    print(name, img.shape[1], 'x', img.shape[0], os.path.getsize(path) // 1024, 'KB')


# 教堂三张底图：白 → 红 → 更红（同一个机位，切换时直接叠化）
white = src('church-white.jpg')
h, w = white.shape[:2]
save('church-white.webp', white, 1600)
for n in ('church-red-1', 'church-red-2'):
    save(n + '.webp', cv2.resize(src(n + '.jpg'), (w, h), interpolation=cv2.INTER_AREA), 1600)

# 双月神像：左边缘做成"树根"一样的渗透（横向拉长的噪声 + 从左到右的渐变），烘进 alpha
idol = src('idol.jpg')
ih, iw = idol.shape[:2]
rng = np.random.default_rng(5)
noise = rng.random((ih, iw)).astype(np.float32)
roots = cv2.GaussianBlur(noise, (0, 0), sigmaX=60, sigmaY=4)          # 横向长条
roots = (roots - roots.min()) / (roots.max() - roots.min())
fine = cv2.GaussianBlur(rng.random((ih, iw)).astype(np.float32), (0, 0), sigmaX=14, sigmaY=2)
fine = (fine - fine.min()) / (fine.max() - fine.min())
x = np.linspace(0, 1, iw)[None, :]
ramp = np.clip((x - 0.02) / 0.5, 0, 1)                                # 左 2% 全透明，到 52% 全不透明
a = np.clip(ramp * 1.25 + (roots - 0.5) * 1.6 * (1 - ramp) + (fine - 0.5) * 0.5 * (1 - ramp), 0, 1)
a = a ** 1.3
y = np.linspace(0, 1, ih)[:, None]
a *= np.clip(y / 0.06, 0, 1) * np.clip((1 - y) / 0.06, 0, 1)          # 上下也淡一点
a = cv2.GaussianBlur(a, (0, 0), 1.5)
rgba = cv2.cvtColor(idol, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = (a * 255).astype(np.uint8)
save('idol.webp', rgba, 1400, q=86)

# 结局后的首页：右边的黑日（小红书作者 無山，页面上要署名）、左边的红色人影
save('black-sun.webp', src('black-sun-wushan.jpg'), 1300, q=86)
save('red-figure.webp', src('red-figure.jpg'), 1300, q=86)
