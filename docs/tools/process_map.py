"""地图页素材处理。

用法：python3 -I docs/tools/process_map.py docs/source-images/map site/assets/img/map
需要：numpy、Pillow、opencv-python-headless
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


def crop_eye(img, pad=0.18):
    """眼睛周围是一大片黑：按亮度找到眼睛，裁成以眼睛为中心的正方形。"""
    L = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (0, 0), 3)
    h, w = L.shape
    L[int(h * 0.86):, int(w * 0.6):] = 0          # 右下角水印不算
    ys, xs = np.where(L > 70)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    side = (xs.max() - xs.min()) * (1 + pad * 2)
    side = min(side, w, h)
    x0 = int(np.clip(cx - side / 2, 0, w - side)); y0 = int(np.clip(cy - side / 2, 0, h - side))
    return img[y0:y0 + int(side), x0:x0 + int(side)]


# 银莲花田：拼进圆圈里的那些格子
save('anemone.webp', src('anemone-field.jpg'), 1000)

# 圣堂格子：新月星盘，去掉右下角水印
moon = src('cathedral-moon.jpg')
h, w = moon.shape[:2]
moon[int(h * 0.9):, int(w * 0.72):] = 0
save('moon.webp', moon, 900)

# 深色格子里的眼睛：去色，裁到眼睛
for i in range(1, 5):
    eye = crop_eye(src('eye-%d.jpg' % i))
    g = cv2.cvtColor(eye, cv2.COLOR_BGR2GRAY)
    save('eye-%d.webp' % i, cv2.cvtColor(g, cv2.COLOR_GRAY2BGR), 360, q=80)

# 右下角翻出来的图
save('belltower.webp', src('belltower-stairs.jpg'), 1000)
save('dining.webp', src('dining-candles.jpg'), 1100)
save('dining-girl.webp', src('dining-girl.jpg'), 1000)
save('cathedral.webp', src('cathedral-blue.jpg'), 1000)

# ---- 地图页补充（docs/specs/2b.地图页的补充.pdf）----
save('gate.webp', src('gate-castle.jpg'), 1000)
save('dorm.webp', src('dorm-corridor.jpg'), 1000)
chapel = src('chapel.jpg')
save('chapel.webp', chapel[:, :1295], 1000)          # 右下角是视频截图的静音图标，裁掉
# 四处走走：小红书作者 Jyuemim 的照片，页面上要标注来源
save('chapel-wall.webp', src('chapel-wall-jyuemim.jpg'), 1000)
