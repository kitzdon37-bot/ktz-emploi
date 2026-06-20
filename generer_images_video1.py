# -*- coding: utf-8 -*-
import sys, requests, os, time
sys.stdout.reconfigure(encoding='utf-8')

OUT = "C:/Users/donald-chrysostome.k/rca-jobs/video1_images"
os.makedirs(OUT, exist_ok=True)

IMAGES = [
    # ── CLIP 1 : Façade extérieure ───────────────────────────────────────────
    {
        "nom": "clip1_before_facade",
        "prompt": (
            "abandoned Victorian mansion, heavily overgrown with dead ivy and vegetation, "
            "broken windows with shattered glass, severely crumbling stone facade, "
            "rotten collapsed wooden front door, partial roof collapse, "
            "dark overcast dramatic storm sky, deep shadows, "
            "perfect symmetrical front view, no people no cars, "
            "hyperrealistic architectural photography, Canon EOS R5 35mm lens, "
            "ultra sharp focus, cinematic color grading, 8K resolution"
        ),
    },
    {
        "nom": "clip1_after_facade",
        "prompt": (
            "fully restored luxury Victorian mansion, same building exact same "
            "symmetrical front view same angle same composition, "
            "pristine white and warm beige stone facade perfectly renovated, "
            "large elegant modern windows, grand restored wooden front door, "
            "perfectly manicured green lawn, trimmed box hedges, "
            "stone driveway with lanterns, golden hour warm sunset lighting, "
            "clear blue sky, no people no cars, "
            "hyperrealistic architectural photography, Canon EOS R5 35mm lens, "
            "ultra sharp focus, cinematic color grading, 8K resolution"
        ),
    },

    # ── CLIP 2 : Salon intérieur ─────────────────────────────────────────────
    {
        "nom": "clip2_before_salon",
        "prompt": (
            "abandoned Victorian mansion interior grand living room, "
            "completely collapsed ceiling with exposed rotten wooden beams, "
            "severely peeling wallpaper revealing crumbling brick walls, "
            "destroyed warped wooden floorboards with holes, "
            "thick dust and rubble debris everywhere, destroyed old armchair, "
            "shattered crystal chandelier lying on floor, "
            "cold blue grey light through large broken windows, no people, "
            "hyperrealistic interior photography, wide angle, cinematic, 8K"
        ),
    },
    {
        "nom": "clip2_after_salon",
        "prompt": (
            "luxury renovated Victorian mansion grand living room, "
            "exact same room same angle same large window position, "
            "high ornate plaster ceiling painted brilliant white, "
            "herringbone light oak parquet floor perfectly polished, "
            "designer grey velvet sofa and armchairs, white marble fireplace, "
            "modern crystal chandelier lit, fresh green plants, "
            "art frames on walls, warm golden afternoon light, no people, "
            "hyperrealistic interior photography, wide angle, cinematic, 8K"
        ),
    },

    # ── CLIP 3 : Cuisine ─────────────────────────────────────────────────────
    {
        "nom": "clip3_before_cuisine",
        "prompt": (
            "abandoned Victorian mansion kitchen, completely decayed and destroyed, "
            "rotten wooden cabinets falling apart collapsing, "
            "smashed broken ceramic floor tiles, rusted iron sink, "
            "severe black mold on walls and ceiling, debris and broken glass on floor, "
            "single dusty broken window letting cold grey light in, no people, "
            "hyperrealistic photography, wide angle, cinematic moody, 8K"
        ),
    },
    {
        "nom": "clip3_after_cuisine",
        "prompt": (
            "luxury renovated Victorian mansion kitchen, "
            "exact same room same angle same single window position, "
            "full white Carrara marble countertops and backsplash, "
            "large central island with dark granite top and bar stools, "
            "professional stainless steel appliances, "
            "brass pendant lights hanging from ceiling, "
            "open wooden shelving with plants and glass jars, "
            "warm natural light, no people, "
            "hyperrealistic interior photography, wide angle, cinematic, 8K"
        ),
    },

    # ── CLIP 4 : Chambre principale ──────────────────────────────────────────
    {
        "nom": "clip4_before_chambre",
        "prompt": (
            "abandoned Victorian mansion master bedroom, "
            "partially collapsed ceiling with exposed rotten wooden beams, "
            "old torn and stained floral wallpaper peeling off walls, "
            "destroyed rusted iron bed frame, shattered mirror on floor, "
            "thick dust layers on everything, debris and broken plaster, "
            "cold grey diffused light through cracked dirty window, no people, "
            "hyperrealistic photography, wide angle, cinematic, 8K"
        ),
    },
    {
        "nom": "clip4_after_chambre",
        "prompt": (
            "luxury renovated Victorian mansion master bedroom, "
            "exact same room same angle same window position, "
            "exposed wooden ceiling beams now cleaned sanded and varnished warm oak, "
            "smooth lime plaster walls painted warm off-white, "
            "king size bed with crisp white linen and cushions, "
            "elegant solid oak bedside tables with brass lamps, "
            "large window with flowing linen curtains, potted plant, "
            "soft warm ambient morning light, no people, "
            "hyperrealistic interior photography, wide angle, cinematic, 8K"
        ),
    },
]

def generer(image: dict, index: int):
    nom    = image["nom"]
    prompt = image["prompt"]
    path   = f"{OUT}/{index:02d}_{nom}.jpg"

    if os.path.exists(path):
        print(f"  [SKIP] {nom} — déjà générée")
        return path

    url = (
        "https://image.pollinations.ai/prompt/"
        + requests.utils.quote(prompt)
        + "?width=1080&height=1920&model=flux&nologo=true&enhance=true"
        + f"&seed={42 + index}"
    )

    print(f"  Génération [{index+1}/8] : {nom}...")
    try:
        r = requests.get(url, timeout=120)
        if r.status_code == 200 and len(r.content) > 10_000:
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"  OK → {path} ({len(r.content)//1024} Ko)")
        else:
            print(f"  ERREUR status={r.status_code} taille={len(r.content)}")
    except Exception as e:
        print(f"  ERREUR : {e}")

    time.sleep(3)  # éviter le rate limiting
    return path


if __name__ == "__main__":
    print("=== Generation images Video 1 - Manoir abandonne -> Villa de luxe ===\n")
    for i, img in enumerate(IMAGES):
        generer(img, i)
    print(f"\n=== Termine - images dans {OUT} ===")
