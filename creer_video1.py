# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

import numpy as np
from moviepy import ImageClip, concatenate_videoclips, VideoFileClip
from moviepy.video.fx import CrossFadeIn, CrossFadeOut
from PIL import Image, ImageDraw, ImageFont
import os

IMG_DIR = "C:/Users/donald-chrysostome.k/rca-jobs/video1_images"
OUT     = "C:/Users/donald-chrysostome.k/rca-jobs/video1_manoir_transformation.mp4"

W, H   = 1080, 1920
FPS    = 30
FADE   = 1.2   # secondes de crossfade
HOLD   = 2.5   # secondes d'affichage par image avant fade
ZOOM_FACTOR = 1.08  # zoom Ken Burns

CLIPS_DEF = [
    {
        "before": "00_clip1_before_facade.jpg",
        "after":  "01_clip1_after_facade.jpg",
        "text_before": "This mansion was abandoned\nfor over 80 years...",
        "text_after":  "Completely transformed.",
    },
    {
        "before": "02_clip2_before_salon.jpg",
        "after":  "03_clip2_after_salon.jpg",
        "text_before": "",
        "text_after":  "The grand living room.",
    },
    {
        "before": "04_clip3_before_cuisine.jpg",
        "after":  "05_clip3_after_cuisine.jpg",
        "text_before": "",
        "text_after":  "The kitchen.",
    },
    {
        "before": "06_clip4_before_chambre.jpg",
        "after":  "07_clip4_after_chambre.jpg",
        "text_before": "",
        "text_after":  "The master bedroom.\n\nDrop a comment below.",
    },
]

def load_and_fit(path):
    """Charge une image et la recadre en 1080x1920."""
    img = Image.open(path).convert("RGB")
    iw, ih = img.size
    scale = max(W / iw, H / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - W) // 2
    top  = (nh - H) // 2
    img  = img.crop((left, top, left + W, top + H))
    return np.array(img)

def add_text_overlay(frame, text, position="bottom"):
    """Ajoute du texte avec fond semi-transparent sur le frame."""
    if not text:
        return frame
    img = Image.fromarray(frame)
    draw = ImageDraw.Draw(img)

    # Taille de police
    try:
        font = ImageFont.truetype("arial.ttf", 52)
        font_small = ImageFont.truetype("arial.ttf", 38)
    except:
        font = ImageFont.load_default()
        font_small = font

    lines = text.split("\n")
    line_h = 65
    total_h = len(lines) * line_h + 60

    if position == "bottom":
        y_start = H - total_h - 80
    else:
        y_start = 120

    # Fond semi-transparent
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle(
        [60, y_start - 20, W - 60, y_start + total_h],
        fill=(0, 0, 0, 160)
    )
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    for i, line in enumerate(lines):
        if not line:
            continue
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            tw = bbox[2] - bbox[0]
        except:
            tw = len(line) * 30
        x = (W - tw) // 2
        y = y_start + i * line_h + 10
        # Ombre
        draw.text((x + 2, y + 2), line, font=font, fill=(0, 0, 0, 200))
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))

    return np.array(img)

def ken_burns_clip(img_array, duration, zoom_in=True):
    """Crée un clip avec effet Ken Burns (zoom lent)."""
    def make_frame(t):
        progress = t / duration
        if zoom_in:
            scale = 1.0 + (ZOOM_FACTOR - 1.0) * progress
        else:
            scale = ZOOM_FACTOR - (ZOOM_FACTOR - 1.0) * progress

        new_w = int(W * scale)
        new_h = int(H * scale)

        img = Image.fromarray(img_array)
        img = img.resize((new_w, new_h), Image.LANCZOS)

        # Centre du crop
        cx = (new_w - W) // 2
        cy = (new_h - H) // 2
        # Petit déplacement pour dynamisme
        cx += int((new_w - W) * 0.1 * progress)
        cy += int((new_h - H) * 0.1 * progress)
        cx = max(0, min(cx, new_w - W))
        cy = max(0, min(cy, new_h - H))

        cropped = np.array(img)[cy:cy+H, cx:cx+W]
        return cropped

    return make_frame

def crossfade_transition(img_before, img_after, duration):
    """Crée des frames de transition crossfade entre deux images."""
    def make_frame(t):
        alpha = t / duration
        alpha = alpha * alpha * (3 - 2 * alpha)  # smoothstep
        blended = (1 - alpha) * img_before.astype(float) + alpha * img_after.astype(float)
        return blended.astype(np.uint8)
    return make_frame

print("Creation de la video transformation...")
print(f"Output: {OUT}")

all_clips = []

for idx, clip_def in enumerate(CLIPS_DEF):
    print(f"\nClip {idx+1}/4...")

    before_path = os.path.join(IMG_DIR, clip_def["before"])
    after_path  = os.path.join(IMG_DIR, clip_def["after"])

    before_arr = load_and_fit(before_path)
    after_arr  = load_and_fit(after_path)

    # Ajouter texte
    before_txt = add_text_overlay(before_arr, clip_def["text_before"], "bottom")
    after_txt  = add_text_overlay(after_arr,  clip_def["text_after"],  "bottom")

    # 1. Clip BEFORE avec Ken Burns
    kb_before = ken_burns_clip(before_txt, HOLD, zoom_in=True)
    before_clip = ImageClip(before_txt).with_duration(HOLD)
    before_clip = before_clip.transform(
        lambda get_frame, t: ken_burns_clip(before_txt, HOLD, zoom_in=True)(t)
    )

    # 2. Transition crossfade
    fade_make = crossfade_transition(before_txt, after_txt, FADE)
    fade_frames = [fade_make(t) for t in np.linspace(0, FADE, int(FADE * FPS))]

    # Clip de transition frame par frame
    def make_fade_clip(frames, dur):
        n = len(frames)
        def get_frame(t):
            i = min(int(t / dur * n), n - 1)
            return frames[i]
        return get_frame, dur

    fade_gf, fade_dur = make_fade_clip(fade_frames, FADE)
    fade_clip = ImageClip(after_txt).with_duration(FADE)

    # 3. Clip AFTER avec Ken Burns
    after_clip = ImageClip(after_txt).with_duration(HOLD)
    after_clip = after_clip.transform(
        lambda get_frame, t: ken_burns_clip(after_txt, HOLD, zoom_in=False)(t)
    )

    all_clips.extend([before_clip, fade_clip, after_clip])
    print(f"  Clip {idx+1} OK")

print("\nAssemblage final...")
final = concatenate_videoclips(all_clips, method="compose")

print(f"Duree totale: {final.duration:.1f}s")
print("Export MP4...")
final.write_videofile(
    OUT,
    fps=FPS,
    codec="libx264",
    audio=False,
    preset="medium",
    logger=None
)

print(f"\nVideo creee: {OUT}")
