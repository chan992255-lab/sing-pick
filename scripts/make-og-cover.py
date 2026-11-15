"""홈 표지 배경(public/hero-bg.png)과 OG 커버(public/og-cover.png)를 만든다.

소스: downloads/sing-pick/hero-art-source.png (3D 렌더 1536×1024)
- hero-bg.png : 홈 히어로 배경용 1200×800 크롭 (텍스트 자리는 CSS 오버레이로 어둡게)
- og-cover.png: 1200×630 카톡/링크 공유 표지 — 아트워크 + 브랜드/카피 텍스트

사용: cd projects/sing-pick && python3 scripts/make-og-cover.py
"""

import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
FONT = "/usr/share/fonts/pickle-hwp/NotoSansCJKkr-Regular.otf"
SRC = sys.argv[1] if len(sys.argv) > 1 else "../../downloads/sing-pick/hero-art-source.png"

LIME = (217, 249, 157)
VIOLET = (167, 139, 250)
WHITE = (255, 255, 255)


def font(size):
    return ImageFont.truetype(FONT, size)


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def hgrad(size, stops):
    w, h = size
    strip = Image.new("RGB", (w, 1))
    d = ImageDraw.Draw(strip)
    for x in range(w):
        t = x / max(1, w - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                d.point((x, 0), lerp(c0, c1, (t - p0) / max(1e-6, p1 - p0)))
                break
    return strip.resize((w, h), Image.BILINEAR)


def paint(mask, color, strength=1.0):
    if strength != 1.0:
        mask = mask.point(lambda v: int(v * strength))
    layer = Image.new("RGBA", (W, H), color + (0,))
    layer.putalpha(mask)
    return layer


def text_size(txt, f, stroke=0):
    b = f.getbbox(txt, stroke_width=stroke)
    return b[2] - b[0], b[3] - b[1], b


def masked_text(txt, f, stroke=0):
    w, h, b = text_size(txt, f, stroke)
    pad = stroke + 6
    mask = Image.new("L", (w + pad * 2, h + pad * 2), 0)
    ImageDraw.Draw(mask).text((pad - b[0], pad - b[1]), txt, font=f, fill=255,
                              stroke_width=stroke, stroke_fill=255)
    return mask


def paste_text(img, xy, txt, f, color=WHITE, stroke=0, grad=None, glow=None):
    mask = masked_text(txt, f, stroke)
    x, y = int(xy[0]), int(xy[1] - (mask.height - text_size(txt, f, stroke)[1]) / 2)
    if glow:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        tmp = Image.new("RGBA", mask.size, glow + (255,))
        tmp.putalpha(mask.point(lambda v: int(v * 0.8)))
        layer.alpha_composite(tmp, (x, y))
        img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(20)))
    if grad:
        layer = hgrad(mask.size, grad).convert("RGBA")
        layer.putalpha(mask)
    else:
        layer = Image.new("RGBA", mask.size, color + (255,))
        layer.putalpha(mask)
    img.alpha_composite(layer, (x, y))
    return text_size(txt, f, stroke)[0]


def soft_box(img, box, radius, fill=None, outline=None, width=1):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)
    img.alpha_composite(layer)


def cover_crop(img, size):
    """비율 유지 cover 크롭 (가로 기준 스케일, 세로 중앙 약간 위)."""
    tw, th = size
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    resized = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = max(0, int((nh - th) * 0.42))
    return resized.crop((left, top, left + tw, top + th))


def left_darken(img, w_ratio=0.62, strength=225):
    """왼쪽 텍스트 자리를 어둡게 (수평 그라데이션 오버레이)."""
    grad = Image.new("L", (1, W))
    d = ImageDraw.Draw(grad)
    edge = int(W * w_ratio)
    for x in range(W):
        v = strength if x < edge * 0.45 else max(0, int(strength * (1 - (x - edge * 0.45) / (edge * 0.55))))
        d.point((0, x), v)
    mask = grad.resize((W, 1)).resize((W, H))
    img.alpha_composite(paint(mask, (6, 4, 12)))


def build_hero():
    art = Image.open(SRC).convert("RGB")
    out = cover_crop(art, (1200, 800))
    out.save("public/hero-bg.png", optimize=True)
    print("저장 public/hero-bg.png", out.size)


def build_og():
    art = Image.open(SRC).convert("RGB")
    img = cover_crop(art, (W, H)).convert("RGBA")

    left_darken(img, 0.66, 232)

    # 아래쪽 비네트
    bottom = Image.new("L", (W, H), 0)
    bd = ImageDraw.Draw(bottom)
    for y in range(H):
        v = max(0, int(150 * ((y - H * 0.55) / (H * 0.45)) ** 2)) if y > H * 0.55 else 0
        bd.line([(0, y), (W, y)], fill=min(255, v))
    img.alpha_composite(paint(bottom, (4, 3, 8)))

    tiny = font(23)
    f_head = font(66)
    f_sub = font(27)
    f_brand = font(40)

    # 브랜드 락업
    icon = Image.open("public/icon-1024.png").convert("RGBA").resize((72, 72), Image.LANCZOS)
    mask = Image.new("L", (72, 72), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 71, 71], radius=20, fill=255)
    icon.putalpha(mask)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste(icon, (72, 56), icon)
    img.alpha_composite(paint(glow.getchannel("A").filter(ImageFilter.GaussianBlur(20)), VIOLET, 0.9))
    img.alpha_composite(icon, (72, 56))
    paste_text(img, (160, 88), "싱픽", f_brand, WHITE, stroke=1)

    # 배지
    badge = "대한민국 노래방 필수앱"
    bw_txt = text_size(badge, tiny)[0]
    soft_box(img, [72, 162, 72 + bw_txt + 44, 162 + 40], 20, fill=(12, 9, 24, 150),
             outline=(255, 255, 255, 60), width=1)
    paste_text(img, (94, 166), badge, tiny, (248, 246, 255), stroke=1)

    # 헤드라인
    x, y = 72, 240
    adv = paste_text(img, (x, y), "오늘은 ", f_head, WHITE, stroke=2)
    adv += paste_text(
        img, (x + adv, y), "무슨 노래", f_head,
        grad=[(0.0, (217, 249, 157)), (0.45, (255, 255, 255)), (1.0, (251, 113, 133))],
        glow=(244, 63, 94),
    )
    paste_text(img, (72, 330), "부를까?", f_head, WHITE, stroke=2)

    paste_text(img, (74, 434), "오늘 부를 곡, 싱픽이 골라 드릴게요.", f_sub, (210, 205, 226))

    chips = "인기차트 · 상황별 추천 · 랜덤 룰렛 · 18번 찾기"
    cf = font(24)
    cw = text_size(chips, cf)[0]
    soft_box(img, [72, 486, 72 + cw + 40, 486 + 46], 23, fill=(12, 20, 6, 155),
             outline=(163, 230, 53, 120), width=1)
    paste_text(img, (92, 490), chips, cf, (219, 250, 163), stroke=1)

    out = img.convert("RGB")
    out.save("public/og-cover.png", optimize=True)
    print("저장 public/og-cover.png", out.size)


if __name__ == "__main__":
    build_hero()
    build_og()
