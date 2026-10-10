"""门禁页（维的档案夹）素材处理。

用法：python3 -I docs/tools/process_gate.py docs/source-images/gate site/assets/img/gate [步骤...]
步骤：gun collage seals clue pen kraft（不写就全做）
需要：numpy、Pillow、opencv-python-headless
"""
import sys, os
import numpy as np
import cv2

SRC, OUT = sys.argv[1], sys.argv[2]
STEPS = sys.argv[3:] or ['gun', 'collage', 'seals', 'clue', 'pen', 'kraft']
os.makedirs(OUT, exist_ok=True)

KLEIN = np.array([167, 47, 0], np.float32)          # #002FA7（BGR）
CLIPPED = np.array([0x5F, 0x6D, 0x8F], np.float32)  # #8F6D5F（BGR）


def src(name):
    return cv2.imread(os.path.join(SRC, name), cv2.IMREAD_COLOR)


def largest(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    if n < 2:
        return m
    return (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)


def fill_holes(m):
    ff = m.copy()
    h, w = m.shape
    cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 1)
    return m | (1 - ff)


def save_rgba(name, bgr, alpha, max_w=None, pad=4):
    """alpha: 0..1 浮点。裁到内容范围，可缩放，存 PNG。"""
    a = np.clip(alpha, 0, 1)
    ys, xs = np.where(a > 0.02)
    y0, y1 = max(0, ys.min() - pad), min(a.shape[0], ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(a.shape[1], xs.max() + pad + 1)
    rgba = np.dstack([bgr[y0:y1, x0:x1], (a[y0:y1, x0:x1] * 255).astype(np.uint8)])
    if max_w and rgba.shape[1] > max_w:
        s = max_w / rgba.shape[1]
        rgba = cv2.resize(rgba, (max_w, round(rgba.shape[0] * s)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(OUT, name), rgba)
    print(name, rgba.shape[1], 'x', rgba.shape[0], 'crop', (x0, y0, x1, y1))
    return (x0, y0, x1, y1)


def feather(m, r=1.2):
    return cv2.GaussianBlur(m.astype(np.float32), (0, 0), r)


# ---------------------------------------------------------------- 枪
def gun():
    img = src('gun-gp100.jpg')
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lum = img.mean(2)
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[95:885, 100:1980] = cv2.GC_PR_FGD
    # 枪下面的影子一律当背景
    shadow = np.array([(90, 1365), (90, 880), (240, 878), (520, 752), (780, 762), (950, 805), (1020, 830),
                       (1110, 805), (1220, 745), (1520, 795), (1590, 848), (1720, 832), (1890, 748),
                       (2040, 690), (2040, 1365)], np.int32)
    cv2.fillPoly(mask, [shadow], cv2.GC_BGD)
    reg = np.zeros((h, w), bool)
    reg[600:850, 1150:1680] = True
    mask[reg & (lum > 168) & (hsv[..., 1] < 30)] = cv2.GC_BGD
    # 扳机护圈里塞着的弹壳去掉
    shell = np.zeros((h, w), np.uint8)
    cv2.circle(shell, (1042, 726), 80, 1, -1)
    cv2.circle(shell, (1088, 660), 46, 1, -1)
    mask[shell > 0] = cv2.GC_BGD
    cv2.grabCut(img, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == 1) | (mask == 3), 1, 0).astype(np.uint8)
    m = largest(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)))
    # 护圈里、握把前面残留的背景
    for p in ([(1285, 610), (1500, 585), (1520, 800), (1260, 800), (1245, 740), (1270, 690), (1278, 640)],
              [(1158, 562), (1243, 556), (1258, 600), (1250, 690), (1218, 728), (1152, 748), (1142, 650)],
              [(1262, 575), (1350, 572), (1470, 680), (1585, 795), (1650, 880), (1480, 900), (1270, 900)],
              [(1250, 545), (1380, 568), (1478, 598), (1518, 650), (1568, 740), (1616, 832), (1505, 860),
               (1250, 860)]):
        cv2.fillPoly(m, [np.array(p, np.int32)], 0)
    box = np.zeros((h, w), bool)
    box[690:890, 1500:1660] = True
    m[box & (lum > 120)] = 0
    m = largest(m)
    # 银色：去色，略偏冷，握把木片压暗
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    wood = ((hsv[..., 0] < 12) | (hsv[..., 0] > 168)) & (hsv[..., 1] > 90)
    g[wood] *= 0.55
    g = np.clip((g - 8) * 1.08, 0, 255)
    out = np.dstack([g * 1.03, g * 1.0, g * 0.97]).clip(0, 255).astype(np.uint8)
    save_rgba('gun.png', out, feather(cv2.erode(m, np.ones((3, 3), np.uint8)), 1.0), max_w=900)
    webp('gun.png')


# ---------------------------------------------------------------- 拼贴底
# 参考图 1440×1440 里各部分的位置（像素）
WHITE = (117, 153, 766, 1098)      # 左边白纸（抠掉，网页里用 HTML 重画，好揉成团）
PLATE = (766, 341, 1319, 1292)     # 右边米黄纸 → 黑色金属板
PINS = [(710, 247), (1097, 387), (755, 1005)]


def tint(bgr, region, target, ref=None):
    """保留明暗，把颜色换成 target。"""
    L = bgr.astype(np.float32).mean(2)
    mean = np.median(L[region]) if ref is None else ref
    k = (L / max(mean, 1))[..., None]
    out = bgr.astype(np.float32).copy()
    out[region] = np.clip(target * k[region], 0, 255)
    return out


def collage():
    img = src('collage-ref.jpg')
    h, w = img.shape[:2]
    b, g, r = [img[..., i].astype(int) for i in range(3)]
    L = (r + g + b) / 3

    # 1) 先把红线和图钉抹掉（图钉另做贴图，线用代码画）
    red = ((r > 140) & (g < 90) & (b < 90)).astype(np.uint8)
    red = cv2.dilate(red, np.ones((5, 5), np.uint8))
    pins = np.zeros((h, w), np.uint8)
    for (x, y) in PINS:
        cv2.circle(pins, (x, y), 21, 1, -1)
    pin_sprite(img)
    img = cv2.inpaint(img, red | pins, 7, cv2.INPAINT_TELEA)
    b, g, r = [img[..., i].astype(int) for i in range(3)]
    L = (r + g + b) / 3

    # 2) 去掉地板：纸是亮的或偏暖的，地板是中性灰
    m = ((L > 150) | (((r - b) > 10) & (L > 115))).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    m = fill_holes(largest(m))
    clip = np.zeros((h, w), np.uint8)
    cv2.rectangle(clip, (528, 18), (662, 162), 1, -1)
    m[:78] = 0
    m[clip > 0] = 1                      # 长尾夹整个留着
    m[:342, 990:] = 0                    # 右上角地板上的亮划痕
    side = np.zeros((h, w), np.uint8)
    side[:, 1322:] = 1
    cv2.rectangle(side, (1262, 728), (1375, 850), 0, -1)   # 别针留着
    m[side > 0] = 0
    m = fill_holes(largest(m))
    # 夹子那一块：只留夹子本身（比地板亮或暗得多）
    cb = clip.astype(bool)
    med = cv2.medianBlur(L.astype(np.uint8), 21).astype(int)
    wire = cv2.dilate((np.abs(L - med) > 22).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    top = cb.copy()
    top[96:, :] = False                  # 夹子下半截压在纸上，不动
    m[top & ~wire] = 0

    out = img.astype(np.float32)
    keep_clip = cb & ~(((r - b) > 12))   # 夹子金属不染色

    # 3) 被夹子夹住的那张纸 → #8F6D5F
    poly = np.zeros((h, w), np.uint8)
    cv2.fillPoly(poly, [np.array([(195, 75), (990, 75), (990, 345), (766, 345), (766, 153), (195, 153)], np.int32)], 1)
    region = (poly > 0) & (m > 0) & ~keep_clip
    out = tint(out, region, CLIPPED)

    # 4) 白纸底下露出来的部分：同一张棕纸（x≥205）+ 左边一条牛皮色
    x0, y0, x1, y1 = WHITE
    tex = img[420:960, 800:1240]          # 米黄纸上干净的一块当纸纹
    tex = cv2.resize(tex, (x1 - x0, y1 - y0), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    TL = tex.mean(2)
    k = (TL / np.median(TL))[..., None]
    under = CLIPPED * k
    under[:, :205 - x0] = np.array([153, 165, 175], np.float32) * k[:, :205 - x0]
    # 上缘压一点阴影（夹子夹住的地方更暗）
    shade = np.linspace(0.78, 1.0, 60)[:, None, None]
    under[:60] *= shade
    out[y0:y1, x0:x1] = under
    m[y0:y1, x0:x1] = 1

    # 5) 米黄纸 → 黑色金属板（用给的金属纹理压暗）
    px0, py0, px1, py1 = PLATE
    metal = cv2.cvtColor(src('metal.jpg'), cv2.COLOR_BGR2GRAY).astype(np.float32)
    mh = int(metal.shape[1] * (py1 - py0) / (px1 - px0))
    metal = cv2.resize(metal[:min(mh, metal.shape[0])], (px1 - px0, py1 - py0), interpolation=cv2.INTER_AREA)
    v = metal / 255.0
    v = (v - v.mean()) * 1.35 + 0.5
    dark = 12 + 70 * np.clip(v, 0, 1) ** 1.6
    plate = np.dstack([dark * 1.06, dark * 1.0, dark * 0.96])
    # 边缘一圈：左上亮、右下暗
    ph, pw = plate.shape[:2]
    edge = np.zeros((ph, pw), np.float32)
    edge[:2, :] += 26
    edge[:, :2] += 18
    edge[-2:, :] -= 10
    edge[:, -2:] -= 10
    plate = np.clip(plate + edge[..., None], 0, 255)
    sub = out[py0:py1, px0:px1]
    is_beige = ((r - b) > 12) & ((r - b) < 45) & (L > 170)
    is_beige = cv2.morphologyEx(is_beige.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)).astype(bool)
    pb = is_beige[py0:py1, px0:px1]
    # 便签和订书钉压在板上，别盖掉
    green = ((g > 180) & (r < 140) & (b < 140)).astype(np.uint8)
    note = cv2.dilate(green, np.ones((45, 45), np.uint8)).astype(bool)
    pb &= ~note[py0:py1, px0:px1]
    sub[pb] = plate[pb]
    out[py0:py1, px0:px1] = sub

    # 6) 荧光绿 → 克莱因蓝（带一点纸纹）
    t = np.clip((g - np.maximum(r, b) - 20) / 160.0, 0, 1)
    yellow = (r > 180) & (g > 180) & (b < 110)
    t = np.maximum(t, yellow.astype(float))
    noise = cv2.GaussianBlur(np.random.default_rng(3).normal(0, 1, (h, w)).astype(np.float32), (0, 0), 1.2)
    klein = KLEIN[None, None, :] * (1 + 0.06 * noise[..., None])
    out = out * (1 - t[..., None]) + klein * t[..., None]

    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    # 白底上会露出边缘残留的地板（中性灰、偏暗）：从外往里剥几层
    protect = np.zeros((h, w), bool)
    protect[PLATE[1]:PLATE[3], PLATE[0]:PLATE[2]] = True
    protect[WHITE[1]:WHITE[3], WHITE[0]:WHITE[2]] = True
    protect |= cb | cv2.dilate(green, np.ones((61, 61), np.uint8)).astype(bool)
    pin_box = np.zeros((h, w), bool)
    pin_box[728:850, 1262:1375] = True
    protect |= pin_box
    floorish = (np.abs(r - b) < 9) & (L < 168) & ~protect
    for _ in range(12):
        edge = m.astype(bool) & ~cv2.erode(m, np.ones((5, 5), np.uint8)).astype(bool)
        kill = edge & floorish
        if not kill.any():
            break
        m[kill] = 0
    m = largest(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)))
    a = feather(m, 1.0)
    final = np.clip(out, 0, 255).astype(np.uint8)
    box = save_rgba('collage.png', final, a)
    print('WHITE', WHITE, 'PLATE', PLATE, 'PINS', PINS, 'crop', box)
    webp('collage.png')

    # 7) 便签单独一层（压在网页白纸上面）：蓝色 + 米色相框
    pts = np.column_stack(np.where(green > 0)[::-1]).astype(np.float32)
    (cx, cy), (bw, bh), ang = cv2.minAreaRect(pts)
    print('NOTE center', (round(cx, 1), round(cy, 1)), 'size', (round(bw), round(bh)), 'angle', round(ang, 2))
    quad = cv2.boxPoints(((cx, cy), (bw + 48, bh + 48), ang))
    quad[np.argsort(quad[:, 1])[-2:], 1] += 22          # 相框下边更宽，撕口
    region = np.zeros((h, w), np.uint8)
    cv2.fillPoly(region, [quad.astype(np.int32)], 1)
    frame = ((r - b) > 4) & (L > 175)
    nm = (region > 0) & (frame | (cv2.dilate(green, np.ones((5, 5), np.uint8)) > 0))
    nm = fill_holes(largest(cv2.morphologyEx(nm.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))))
    nb = save_rgba('note.png', final, feather(nm, 0.9), pad=2)
    webp('note.png')
    print('NOTE sprite box', nb)


def webp(name, q=90):
    im = cv2.imread(os.path.join(OUT, name), cv2.IMREAD_UNCHANGED)
    out = os.path.join(OUT, name.rsplit('.', 1)[0] + '.webp')
    cv2.imwrite(out, im, [cv2.IMWRITE_WEBP_QUALITY, q])
    os.remove(os.path.join(OUT, name))
    print(' ->', out, os.path.getsize(out) // 1024, 'KB')


# ---------------------------------------------------------------- 证件上的两个徽章
def seals():
    # 左：罗盘轮（黑墨）→ 透明底
    img = src('seal-compass.jpg')
    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    a = np.clip((205 - L) / 120, 0, 1)
    ink = np.zeros_like(img)
    ink[:] = (34, 22, 14)
    save_rgba('seal-compass.png', ink, a, max_w=420)

    # 右：日月盘。外圈红 → #1B2CC1，光芒红 → 黑，双月 → 白
    img = src('seal-sunmoon.jpg')
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    h, w = img.shape[:2]
    cx, cy = 519, 530
    yy, xx = np.mgrid[:h, :w]
    d = np.hypot(xx - cx, yy - cy)
    out = img.astype(np.float32)
    L = out.mean(2)
    redness = np.clip((S - 60) / 80, 0, 1) * ((H < 12) | (H > 158))
    redness = cv2.GaussianBlur(redness.astype(np.float32), (0, 0), 0.8)
    shade = np.clip(V / 110.0, 0.55, 1.25)[..., None]
    blue = np.array([0xC1, 0x2C, 0x1B], np.float32) * shade
    black = np.array([16, 14, 14], np.float32) * shade
    ringzone = (d > 385)[..., None]
    target = np.where(ringzone, blue, black)
    out = out * (1 - redness[..., None]) + target * redness[..., None]
    # 双月：中心 r<150 里，金色的和深色的都换成白，保留五官线条；
    # 两月之间露出的米色底改成黑，不然白月亮和米色糊成一片
    moonzone = (d < 150) & (redness < 0.3)
    # 先粗分：0 米色底 / 1 金月 / 2 暗月，再用中值滤波去掉木纹造成的碎点
    lab = np.full((h, w), 2, np.uint8)
    lab[(S < 100) & (V > 140)] = 0
    lab[(S >= 100) & (H > 10) & (H < 40) & (V >= 120)] = 1
    lab = cv2.medianBlur(lab, 11)
    hole = moonzone & (lab == 0)
    gold = moonzone & (lab == 1)
    darkm = moonzone & (lab == 2)
    for msk, gamma in ((gold, 0.8), (darkm, 0.3)):
        Lm = L / max(np.median(L[msk]), 1)
        val = np.clip(242 * Lm ** gamma, 0, 255)
        wv = np.dstack([val * 1.0, val * 0.99, val * 0.97])
        out[msk] = wv[msk]
    out[hole] = (black / shade)[hole] * 1.0
    a = np.clip((486 - d) / 2.0, 0, 1)
    save_rgba('seal-sunmoon.png', np.clip(out, 0, 255).astype(np.uint8), a, max_w=420)
    webp('seal-sunmoon.png')
    webp('seal-compass.png')


# ---------------------------------------------------------------- 银色斜口蘸水笔
def pen():
    img = src('pens.jpg')
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    V, Sat = hsv[..., 2].astype(int), hsv[..., 1].astype(int)
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    poly = np.array([(25, 40), (60, 28), (118, 40), (118, 935), (182, 930), (182, 1022), (140, 1060), (100, 1182),
                     (52, 1182), (58, 1000), (20, 1000)], np.int32)
    cv2.fillPoly(mask, [poly], cv2.GC_PR_FGD)
    cv2.grabCut(img, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == 1) | (mask == 3), 1, 0).astype(np.uint8)
    paper = (Sat < 45) & (V > 170)
    paper[995:, :] = False
    m[paper] = 0
    m = largest(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)))
    nib = np.zeros((h, w), np.uint8)
    cv2.fillPoly(nib, [np.array([(100, 995), (140, 995), (140, 1060), (105, 1180), (55, 1180), (70, 1060)], np.int32)], 1)
    flange = np.zeros((h, w), np.uint8)
    cv2.fillPoly(flange, [np.array([(100, 930), (182, 930), (182, 1022), (140, 1022), (100, 1000)], np.int32)], 1)
    m[(nib > 0) & (V < 190)] = 1
    m[(flange > 0) & ((Sat > 60) | (V < 170))] = 1
    m[(nib > 0) & (V >= 160) & (Sat < 50)] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    m = largest(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)))

    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    out = np.dstack([L, L, L])
    # 笔杆：木头换成拉丝银。按每一行的左右边算出横向位置，叠一条高光
    grain = cv2.medianBlur(L.astype(np.uint8), 9).astype(np.float32)
    grain = grain / max(np.median(grain[m > 0][:5000]), 1)
    barrel = (m > 0) & (np.arange(h)[:, None] < 945)
    for y in range(h):
        xs = np.where(barrel[y])[0]
        if len(xs) < 3:
            continue
        u = (np.arange(xs[0], xs[-1] + 1) - xs[0]) / max(xs[-1] - xs[0], 1)
        prof = 0.42 + 0.5 * np.exp(-((u - 0.32) / 0.13) ** 2) + 0.18 * np.exp(-((u - 0.78) / 0.1) ** 2) - 0.12 * u
        g = 0.93 + 0.07 * np.clip(grain[y, xs[0]:xs[-1] + 1], 0.6, 1.4)
        out[y, xs[0]:xs[-1] + 1] = (prof * g * 235)[:, None]
    # 金色笔座 → 银
    fl = (flange > 0) & (m > 0)
    out[fl] = np.clip((L[fl] - 60) * 1.25 + 60, 0, 255)[:, None]
    # 笔尖末端一点蓝黑残墨（和克莱因蓝便签同色）
    tip = (nib > 0) & (m > 0) & (np.arange(h)[:, None] > 1120)
    ink = np.array([60, 18, 8], np.float32)
    out[tip] = out[tip] * 0.45 + ink * 0.55
    out = np.dstack([out[..., 0] * 1.03, out[..., 1], out[..., 2] * 0.98])
    save_rgba('pen.png', np.clip(out, 0, 255).astype(np.uint8), feather(m, 0.8))
    webp('pen.png')


# ---------------------------------------------------------------- 线索便签（带长尾夹的毛边纸）
def clue():
    img = src('clue-paper.jpg')
    L = img.astype(np.float32).mean(2)
    a = np.clip((L - 30) / 35, 0, 1)
    a[1250:] = 0                     # 右下角水印
    m = largest((a > 0.5).astype(np.uint8))
    m = fill_holes(m)
    a = np.minimum(a, cv2.dilate(m, np.ones((5, 5), np.uint8)).astype(np.float32))
    save_rgba('clue.png', img, a, max_w=900)
    webp('clue.png')


# ---------------------------------------------------------------- 半张撕开的牛皮纸
def kraft():
    img = src('old-letter.jpg')
    h, w = img.shape[:2]
    rng = np.random.default_rng(11)
    # 下边是撕口：大起伏 + 细毛刺
    xs = np.arange(w)
    base = h * 0.56
    walk = np.cumsum(rng.normal(0, 0.8, w))
    walk -= np.linspace(walk[0], walk[-1], w)
    edge = base + 20 * np.sin(xs / 71.0 + 1.3) + 9 * np.sin(xs / 19.0 + 0.4) + walk + rng.normal(0, 1.4, w)
    yy = np.arange(h)[:, None]
    m = (yy < edge[None, :]).astype(np.float32)
    # 撕口那一圈纤维发白
    fiber = ((yy < edge[None, :]) & (yy > edge[None, :] - 7 - rng.random(w)[None, :] * 6)).astype(np.float32)
    out = img.astype(np.float32)
    out = out * (1 - 0.55 * fiber[..., None]) + np.array([214, 222, 228], np.float32) * 0.55 * fiber[..., None]
    a = feather(m, 0.9)
    save_rgba('kraft.png', np.clip(out, 0, 255).astype(np.uint8), a, max_w=700)
    webp('kraft.png')
    # 另外半张「Forever」：同一条撕口的下半截（居室「游荡」时捡到，和 WE 能拼回去）
    m2 = 1 - m
    fiber2 = ((yy >= edge[None, :]) & (yy < edge[None, :] + 7 + rng.random(w)[None, :] * 6)).astype(np.float32)
    out2 = img.astype(np.float32)
    out2 = out2 * (1 - 0.55 * fiber2[..., None]) + np.array([214, 222, 228], np.float32) * 0.55 * fiber2[..., None]
    box = save_rgba('forever.png', np.clip(out2, 0, 255).astype(np.uint8), feather(m2, 0.9), max_w=700)
    webp('forever.png')
    print('原图', w, 'x', h, '；forever 在原图里的位置', box)


def pin_sprite(img):
    x, y = PINS[1]
    R = 17
    c = img[y - R - 4:y + R + 4, x - R - 4:x + R + 4]
    yy, xx = np.mgrid[:c.shape[0], :c.shape[1]]
    d = np.hypot(xx - (R + 4), yy - (R + 4))
    a = np.clip((R - d) / 1.5, 0, 1)
    save_rgba('pin.png', c, a, pad=1)


if __name__ == '__main__':
    for s in STEPS:
        globals()[s]()
