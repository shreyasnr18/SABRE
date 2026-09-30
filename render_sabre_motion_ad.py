"""
SABRE Cinematic Motion Graphics Production Ad Renderer - Broadcast Grade Edition
Matches the Partoo-style AI agent motion graphics animation with hero mascot 'VAM',
3D floating cards, micro-interactions, live compliance stamps, FASTag radar,
TReDS instant payout, standalone truck P&L gauge, and grand holographic outro.

Outputs 1280x720 @ 30 FPS MP4 with synthesized stereo sound effects.
"""

import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg
import subprocess

WIDTH = 1280
HEIGHT = 720
FPS = 30
TOTAL_SECONDS = 70.0
TOTAL_FRAMES = int(FPS * TOTAL_SECONDS) # 2100 frames

# Load fonts
FONT_DIR = "C:/Windows/Fonts"
def get_font(name="segoeui.ttf", size=18):
    path = os.path.join(FONT_DIR, name)
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

font_hero = get_font("segoeuib.ttf", 52)
font_title_large = get_font("segoeuib.ttf", 34)
font_title = get_font("segoeuib.ttf", 24)
font_sub = get_font("segoeui.ttf", 17)
font_sub_bold = get_font("segoeuib.ttf", 17)
font_body = get_font("segoeui.ttf", 13)
font_body_bold = get_font("segoeuib.ttf", 13)
font_caption = get_font("segoeui.ttf", 11)
font_caption_bold = get_font("segoeuib.ttf", 11)
font_kpi_huge = get_font("segoeuib.ttf", 44)

# Easing functions
def ease_out_cubic(x):
    return 1 - pow(1 - x, 3)

def ease_in_out_quad(x):
    return 2 * x * x if x < 0.5 else 1 - pow(-2 * x + 2, 2) / 2

def ease_out_back(x, c1=1.70158):
    c3 = c1 + 1
    return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2)

# Floating particle seeds
np.random.seed(42)
NUM_PARTICLES = 50
particles = []
for _ in range(NUM_PARTICLES):
    particles.append({
        'x': float(np.random.uniform(0, WIDTH)),
        'y': float(np.random.uniform(0, HEIGHT)),
        'speed_x': float(np.random.uniform(-0.35, 0.35)),
        'speed_y': float(np.random.uniform(-0.4, 0.25)),
        'radius': float(np.random.uniform(1.5, 3.5)),
        'color': random.choice([
            (6, 182, 212, 140),  # Cyan
            (16, 185, 129, 140), # Emerald
            (168, 85, 247, 110), # Purple
            (56, 189, 248, 120), # Light blue
            (245, 158, 11, 90)   # Amber
        ])
    })

def draw_background(draw, frame_idx):
    # Dark luxury vignette gradient: deep navy #050a16
    center_y = int(HEIGHT * 0.46)
    for r in range(480, 60, -60):
        alpha = int(14 * (1 - r/480))
        draw.ellipse([WIDTH//2 - r, center_y - r//2, WIDTH//2 + r, center_y + r//2], fill=(14, 32, 60, alpha))
        
    # Floating particles
    for p in particles:
        px = (p['x'] + p['speed_x'] * frame_idx) % WIDTH
        py = (p['y'] + p['speed_y'] * frame_idx) % HEIGHT
        pr = p['radius']
        color = p['color']
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=color)

def draw_mascot(draw, x, y, size=85, expression="happy", eye_offset=(0,0), scale=1.0, glow=True):
    """
    Draws 'VAM' - The SABRE AI Agent Mascot.
    A glowing aerodynamic speech-shield shape with bright animated eyes, radar fin, and mouth.
    """
    s = size * scale
    hw = s * 0.54
    hh = s * 0.44

    # Outer multi-layered soft neon glow
    if glow:
        for gr in range(int(s*0.85), int(s*0.48), -5):
            alpha = int(22 * (1.0 - (gr - s*0.48)/(s*0.37)))
            draw.ellipse([x - gr*1.25, y - gr, x + gr*1.25, y + gr], fill=(6, 182, 212, alpha))
            draw.ellipse([x - gr*1.05, y - gr*0.9, x + gr*1.05, y + gr*0.9], fill=(16, 185, 129, alpha//2))

    # Mascot body outer shell (Cyan to Emerald gradient simulation)
    bbox = [x - hw, y - hh, x + hw, y + hh]
    draw.rounded_rectangle(bbox, radius=int(s*0.28), fill=(8, 145, 178, 255), outline=(56, 189, 248, 255), width=3)
    
    # Radar fin / top high-tech antenna
    draw.ellipse([x - int(s*0.06), y - hh - int(s*0.14), x + int(s*0.06), y - hh + int(s*0.02)], fill=(52, 211, 153, 255))
    draw.line([x, y - hh, x, y - hh - int(s*0.12)], fill=(56, 189, 248, 255), width=3)

    # Bottom speech/radar tail
    tail_pts = [
        (x - int(s*0.12), y + hh - 2),
        (x - int(s*0.32), y + hh + int(s*0.26)),
        (x + int(s*0.06), y + hh - 2)
    ]
    draw.polygon(tail_pts, fill=(8, 145, 178, 255))
    draw.line([tail_pts[0], tail_pts[1], tail_pts[2]], fill=(56, 189, 248, 255), width=3)

    # Face center
    fx, fy = x + eye_offset[0], y + eye_offset[1]
    
    # Eyes
    eye_spacing = s * 0.22
    eye_y = fy - s * 0.05
    
    if expression == "happy" or expression == "smile":
        # Arch eyes
        draw.arc([fx - eye_spacing - 10, eye_y - 8, fx - eye_spacing + 10, eye_y + 8], start=180, end=360, fill=(255, 255, 255), width=4)
        draw.arc([fx + eye_spacing - 10, eye_y - 8, fx + eye_spacing + 10, eye_y + 8], start=180, end=360, fill=(255, 255, 255), width=4)
    elif expression == "wink":
        # Left eye winking line, right eye big open happy
        draw.line([fx - eye_spacing - 10, eye_y, fx - eye_spacing + 10, eye_y], fill=(255, 255, 255), width=4)
        draw.ellipse([fx + eye_spacing - 9, eye_y - 9, fx + eye_spacing + 9, eye_y + 9], fill=(255, 255, 255))
    elif expression == "blink":
        # Closed eyes lines
        draw.line([fx - eye_spacing - 10, eye_y, fx - eye_spacing + 10, eye_y], fill=(255, 255, 255), width=4)
        draw.line([fx + eye_spacing - 10, eye_y, fx + eye_spacing + 10, eye_y], fill=(255, 255, 255), width=4)
    else: # open
        draw.ellipse([fx - eye_spacing - 8, eye_y - 8, fx - eye_spacing + 8, eye_y + 8], fill=(255, 255, 255))
        draw.ellipse([fx + eye_spacing - 8, eye_y - 8, fx + eye_spacing + 8, eye_y + 8], fill=(255, 255, 255))

    # Mouth
    mouth_y = fy + s * 0.14
    if expression == "smile" or expression == "wink":
        draw.arc([fx - 14, mouth_y - 10, fx + 14, mouth_y + 10], start=0, end=180, fill=(255, 255, 255), width=4)
    elif expression == "happy":
        # Open mouth smile
        draw.pieslice([fx - 14, mouth_y - 8, fx + 14, mouth_y + 12], start=0, end=180, fill=(255, 255, 255))
    else:
        draw.line([fx - 10, mouth_y, fx + 10, mouth_y], fill=(255, 255, 255), width=3)

def draw_card(draw, x, y, w, h, bg=(15, 23, 42, 235), border=(51, 65, 85, 255), radius=14):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=bg, outline=border, width=2)

def draw_cursor(draw, x, y, clicking=False):
    pts = [
        (x, y),
        (x, y + 22),
        (x + 6, y + 17),
        (x + 11, y + 26),
        (x + 15, y + 24),
        (x + 10, y + 15),
        (x + 17, y + 15)
    ]
    draw.polygon(pts, fill=(255, 255, 255, 255), outline=(15, 23, 42, 255))
    if clicking:
        draw.ellipse([x - 12, y - 12, x + 12, y + 12], outline=(6, 182, 212, 220), width=3)

def render_frame(frame_idx):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (6, 11, 23, 255))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_background(draw, frame_idx)

    t_sec = frame_idx / FPS

    # =========================================================
    # SCENE 1 (0.0s - 10.0s): The Chaos of Logistics Paperwork
    # =========================================================
    if t_sec < 10.0:
        title_alpha = min(1.0, t_sec / 1.5)
        draw.text((WIDTH//2, 65), "THE PAPERWORK CRISIS IN INDIAN TRANSPORT", font=font_title_large, fill=(239, 68, 68, int(255 * title_alpha)), anchor="mt")
        draw.text((WIDTH//2, 114), "Blocked Cash Flows • Roadside Seizure Fines • 60-Day Payment Delays", font=font_sub, fill=(148, 163, 184, int(255 * title_alpha)), anchor="mt")

        cards_data = [
            {"title": "URGENT: E-Way Bill Expiring in 38 Mins!", "desc": "Section 129 GST Vehicle Seizure Notice (Mandatory 200% Penalty)", "tag": "GST PENALTY RISK", "color": (239, 68, 68), "x": 110, "y": 190, "w": 500, "h": 95, "delay": 0.4},
            {"title": "Client Payment Blocked: Stamped Bilty Missing", "desc": "30-day credit clock has NOT started. Original paper lost in transit.", "tag": "PAYMENT CYCLE DELAYED", "color": (245, 158, 11), "x": 670, "y": 220, "w": 500, "h": 95, "delay": 1.4},
            {"title": "Missing Form 15G/15H Declaration", "desc": "2% TDS Deducted on Broker Truck Freight (Section 194C Violation)", "tag": "TAX WITHHELD", "color": (239, 68, 68), "x": 130, "y": 335, "w": 480, "h": 90, "delay": 2.4},
            {"title": "Destination Debit Note: ₹18,500 Assessed", "desc": "Receiving factory stamped shortage remarks on physical consignment note.", "tag": "CLIENT DEBIT DISPUTE", "color": (239, 68, 68), "x": 650, "y": 365, "w": 500, "h": 90, "delay": 3.4},
            {"title": "Driver Advance Overdraft & Unreconciled FASTag", "desc": "Driver road bata exceeds fuel slips. No real-time bank statement link.", "tag": "CASH BLEED", "color": (245, 158, 11), "x": 370, "y": 485, "w": 540, "h": 95, "delay": 4.4}
        ]

        for cd in cards_data:
            if t_sec > cd['delay']:
                prog = min(1.0, (t_sec - cd['delay']) / 0.6)
                e_prog = ease_out_back(prog)
                bob = math.sin(t_sec * 2.5 + cd['x']) * 6
                
                cx = cd['x']
                cy = int(cd['y'] + (1.0 - e_prog) * 40 + bob)
                
                draw_card(draw, cx, cy, cd['w'], cd['h'], bg=(15, 23, 42, 240), border=cd['color'], radius=12)
                
                # Tag
                draw.rounded_rectangle([cx + 16, cy + 14, cx + 16 + len(cd['tag'])*8 + 12, cy + 32], radius=4, fill=(cd['color'][0], cd['color'][1], cd['color'][2], 40), outline=cd['color'], width=1)
                draw.text((cx + 22, cy + 17), cd['tag'], font=font_caption_bold, fill=cd['color'])
                
                draw.text((cx + 16, cy + 42), cd['title'], font=font_body_bold, fill=(255, 255, 255))
                draw.text((cx + 16, cy + 66), cd['desc'], font=font_caption, fill=(203, 213, 225))

    # =========================================================
    # SCENE 2 (10.0s - 19.0s): Meet SABRE Core • The AI Agent
    # =========================================================
    elif t_sec < 19.0:
        rel_t = t_sec - 10.0
        
        bloom_rad = int(min(WIDTH, 200 + rel_t * 55))
        draw.ellipse([WIDTH//2 - bloom_rad, HEIGHT//2 - bloom_rad//2, WIDTH//2 + bloom_rad, HEIGHT//2 + bloom_rad//2], fill=(6, 182, 212, max(0, int(26 * (1.0 - rel_t/9.0)))))

        mascot_prog = min(1.0, rel_t / 1.2)
        mascot_scale = ease_out_back(mascot_prog)
        mascot_y = int(HEIGHT * 0.40 - math.sin(rel_t * 4) * 8)
        
        expr = "happy"
        if 1.8 < rel_t < 2.2:
            expr = "blink"
        elif rel_t > 5.5:
            expr = "wink"
            
        draw_mascot(draw, WIDTH//2, mascot_y, size=135, expression=expr, scale=mascot_scale, glow=True)

        if rel_t > 1.2:
            title_prog = min(1.0, (rel_t - 1.2) / 0.8)
            t_y = int(HEIGHT * 0.65 - (1.0 - ease_out_cubic(title_prog)) * 30)
            
            draw_card(draw, WIDTH//2 - 350, t_y, 700, 115, bg=(11, 23, 44, 245), border=(6, 182, 212, 255), radius=16)
            
            draw.text((WIDTH//2, t_y + 16), "MEET SABRE CORE", font=font_title, fill=(6, 182, 212), anchor="mt")
            draw.text((WIDTH//2, t_y + 52), "Autonomous Operational & Financial Paperwork Engine", font=font_sub_bold, fill=(255, 255, 255), anchor="mt")
            draw.text((WIDTH//2, t_y + 82), "National Logistics Policy • ULIP • 4-Copy Bilty • FASTag • TReDS MSME", font=font_caption, fill=(52, 211, 153), anchor="mt")

    # =========================================================
    # SCENE 3 (19.0s - 29.0s): Instant ULIP Compliance (VAHAN & SARATHI)
    # =========================================================
    elif t_sec < 29.0:
        rel_t = t_sec - 19.0
        
        draw.text((WIDTH//2, 45), "STAGE 1: INSTANT ULIP COMPLIANCE VERIFICATION", font=font_title, fill=(56, 189, 248), anchor="mt")
        draw.text((WIDTH//2, 80), "Direct Integration with MoRTH VAHAN & SARATHI Databases Under National Logistics Policy", font=font_body, fill=(148, 163, 184), anchor="mt")

        mascot_x = WIDTH - 180
        mascot_y = 340 + int(math.sin(rel_t * 3) * 6)
        draw_mascot(draw, mascot_x, mascot_y, size=105, expression="happy" if rel_t < 5.0 else "wink", scale=1.0)
        
        draw_card(draw, mascot_x - 170, mascot_y - 120, 210, 48, bg=(6, 182, 212, 220), border=(255, 255, 255), radius=10)
        draw.text((mascot_x - 65, mascot_y - 96), "Instant MoRTH Check!", font=font_body_bold, fill=(15, 23, 42), anchor="mm")

        # Card 1: VAHAN
        vahan_prog = min(1.0, rel_t / 0.8)
        vx = int(100 + (1.0 - ease_out_cubic(vahan_prog)) * -100)
        draw_card(draw, vx, 135, 620, 180, bg=(15, 23, 42, 245), border=(56, 189, 248, 200))
        
        draw.text((vx + 24, 155), "VAHAN API • Commercial Vehicle RC & Permit", font=font_sub_bold, fill=(56, 189, 248))
        draw.text((vx + 24, 190), "Vehicle Registration: KA-01-AB-1234 (Tata Prima 5530.S)", font=font_body, fill=(255, 255, 255))
        draw.text((vx + 24, 216), "National Permit (NP): NP/KA/2025/88192 • Valid Upto 2027", font=font_body, fill=(203, 213, 225))
        draw.text((vx + 24, 242), "Fitness Certificate: VALID • State Road Tax: FULLY CURRENT", font=font_body, fill=(203, 213, 225))
        
        if rel_t > 3.0:
            draw.rounded_rectangle([vx + 480, 155, vx + 595, 190], radius=6, fill=(16, 185, 129, 40), outline=(16, 185, 129), width=2)
            draw.text((vx + 537, 172), "VERIFIED", font=font_body_bold, fill=(52, 211, 153), anchor="mm")

        # Card 2: SARATHI
        sarathi_prog = min(1.0, max(0.0, (rel_t - 1.2) / 0.8))
        sx = int(100 + (1.0 - ease_out_cubic(sarathi_prog)) * -100)
        draw_card(draw, sx, 335, 620, 180, bg=(15, 23, 42, 245), border=(16, 185, 129, 200))
        
        draw.text((sx + 24, 355), "SARATHI API • Commercial Driving License & CMVR 137", font=font_sub_bold, fill=(52, 211, 153))
        draw.text((sx + 24, 390), "Pilot Driver: Suresh Patil • DL: KA0120150049210", font=font_body, fill=(255, 255, 255))
        draw.text((sx + 24, 416), "Authorization Class: TRANS / Heavy Goods Motor Vehicle", font=font_body, fill=(203, 213, 225))
        draw.text((sx + 24, 442), "CMVR 137 Hazmat Endorsement: Verified Active • Badge: BDG-44109", font=font_body, fill=(203, 213, 225))

        if rel_t > 4.5:
            draw.rounded_rectangle([sx + 480, 355, sx + 595, 390], radius=6, fill=(16, 185, 129, 40), outline=(16, 185, 129), width=2)
            draw.text((sx + 537, 372), "CLEARED", font=font_body_bold, fill=(52, 211, 153), anchor="mm")

        if 2.5 < rel_t < 6.0:
            cur_x = int(500 + min(1.0, (rel_t - 2.5)/1.0) * 80)
            cur_y = int(240 + min(1.0, (rel_t - 2.5)/1.0) * 140)
            draw_cursor(draw, cur_x, cur_y, clicking=(3.5 < rel_t < 4.2))

        if rel_t > 6.0:
            draw_card(draw, 100, 535, 620, 52, bg=(6, 95, 70, 230), border=(16, 185, 129, 255), radius=10)
            draw.text((410, 561), "100% ULIP COMPLIANT • CLEARED FOR HIGHWAY DISPATCH", font=font_sub_bold, fill=(255, 255, 255), anchor="mm")

    # =========================================================
    # SCENE 4 (29.0s - 41.0s): 4-Copy Bilty Morph & 70% Advance Outflow
    # =========================================================
    elif t_sec < 41.0:
        rel_t = t_sec - 29.0

        draw.text((WIDTH//2, 45), "STAGE 2 & 3: 4-COPY BILTY & 70% DRIVER ADVANCE HISAAB", font=font_title, fill=(245, 158, 11), anchor="mt")
        draw.text((WIDTH//2, 80), "GTA SAC Code 9965 Consignment Note + 3-Way Advance Split (Cash + Fuel RFID + FASTag)", font=font_body, fill=(148, 163, 184), anchor="mt")

        copies = [
            {"title": "CONSIGNOR COPY", "sub": "Shipper Gate Pass", "color": (236, 72, 153), "x": 100},
            {"title": "CONSIGNEE COPY", "sub": "Buyer Delivery Note", "color": (59, 130, 246), "x": 370},
            {"title": "DRIVER COPY", "sub": "Highway RTO Check", "color": (16, 185, 129), "x": 640},
            {"title": "TRANSPORTER COPY", "sub": "Accounts Tax Billing", "color": (245, 158, 11), "x": 910}
        ]

        for i, cp in enumerate(copies):
            card_delay = i * 0.4
            if rel_t > card_delay:
                c_prog = min(1.0, (rel_t - card_delay) / 0.6)
                cy = int(120 + (1.0 - ease_out_back(c_prog)) * 50)
                
                draw_card(draw, cp['x'], cy, 250, 160, bg=(15, 23, 42, 245), border=cp['color'], radius=12)
                
                draw.rounded_rectangle([cp['x'], cy, cp['x'] + 250, cy + 36], radius=10, fill=cp['color'])
                draw.text((cp['x'] + 125, cy + 18), cp['title'], font=font_caption_bold, fill=(255, 255, 255), anchor="mm")
                
                draw.text((cp['x'] + 14, cy + 50), "LR: LR-2026-9901", font=font_body_bold, fill=(255, 255, 255))
                draw.text((cp['x'] + 14, cy + 72), "Tata Steel -> Peenya Hub", font=font_caption, fill=(203, 213, 225))
                draw.text((cp['x'] + 14, cy + 92), "24.8 MT Hot-Rolled Coils", font=font_caption, fill=(148, 163, 184))
                draw.text((cp['x'] + 14, cy + 115), cp['sub'], font=font_caption_bold, fill=cp['color'])

        if rel_t > 3.0:
            adv_prog = min(1.0, (rel_t - 3.0) / 0.8)
            ay = int(320 + (1.0 - ease_out_cubic(adv_prog)) * 40)
            
            draw_card(draw, 100, ay, 1060, 240, bg=(11, 23, 44, 250), border=(245, 158, 11, 220), radius=16)
            
            draw.text((130, ay + 20), "70% DRIVER ADVANCE OUTFLOW HISAAB (DISBURSED BEFORE WHEELS TURN)", font=font_sub_bold, fill=(245, 158, 11))
            draw.text((130, ay + 48), "Gross Freight: ₹8,45,000 • Total Advance: ₹5,91,500 (70.0%) • 30% Balance Due: ₹2,53,500", font=font_body, fill=(255, 255, 255))

            splits = [
                {"head": "CASH ROAD BATA", "amt": "₹ 45,000", "desc": "En-route food, weighbridge coins, tyre puncture buffer", "col": (52, 211, 153), "x": 130},
                {"head": "IOCL RFID FUEL CARD", "amt": "₹ 4,85,000", "desc": "Automated pump dispenser card #8841-209", "col": (245, 158, 11), "x": 480},
                {"head": "FASTAG RECHARGE", "amt": "₹ 61,500", "desc": "Direct NHAI wallet top-up (Tag #34161FA82)", "col": (56, 189, 248), "x": 830}
            ]
            for sp in splits:
                draw_card(draw, sp['x'], ay + 80, 310, 95, bg=(15, 23, 42, 240), border=sp['col'], radius=10)
                draw.text((sp['x'] + 14, ay + 96), sp['head'], font=font_caption_bold, fill=sp['col'])
                draw.text((sp['x'] + 14, ay + 118), sp['amt'], font=font_title, fill=(255, 255, 255))
                draw.text((sp['x'] + 14, ay + 152), sp['desc'], font=font_caption, fill=(148, 163, 184))

            draw.text((130, ay + 195), "FORM 15G/15H MARKET BROKER COMPLIANCE:", font=font_caption_bold, fill=(168, 85, 247))
            draw.text((430, ay + 195), "Verified Active u/s 194C(6) of Income Tax Act -> 0% TDS Exemption Confirmed", font=font_caption, fill=(52, 211, 153))

    # =========================================================
    # SCENE 5 (41.0s - 53.0s): Highway Artery Radar & Live FASTag
    # =========================================================
    elif t_sec < 53.0:
        rel_t = t_sec - 41.0

        draw.text((WIDTH//2, 45), "STAGE 4: IN-TRANSIT FASTag API & E-WAY BILL CLOCK", font=font_title, fill=(56, 189, 248), anchor="mt")
        draw.text((WIDTH//2, 80), "Live Bank Statement Toll Deductions & Section 129 GST Seizure Prevention", font=font_body, fill=(148, 163, 184), anchor="mt")

        draw_card(draw, 100, 120, 620, 460, bg=(10, 20, 38, 245), border=(56, 189, 248, 200), radius=16)
        
        draw.text((124, 142), "TACTICAL CORRIDOR RADAR: NH-16 / NH-44", font=font_sub_bold, fill=(56, 189, 248))
        draw.text((124, 168), "Jamshedpur -> Kharagpur -> Bhubaneswar -> Vizag -> Peenya", font=font_caption, fill=(148, 163, 184))

        hwy_pts = [(160, 480), (280, 400), (380, 320), (480, 240), (620, 210)]
        for i in range(len(hwy_pts)-1):
            draw.line([hwy_pts[i], hwy_pts[i+1]], fill=(30, 58, 95), width=8)
            draw.line([hwy_pts[i], hwy_pts[i+1]], fill=(6, 182, 212), width=3)

        truck_t = min(1.0, rel_t / 10.0)
        idx_float = truck_t * (len(hwy_pts) - 1)
        i0 = int(idx_float)
        i1 = min(i0 + 1, len(hwy_pts) - 1)
        frac = idx_float - i0
        tx = int(hwy_pts[i0][0] + frac * (hwy_pts[i1][0] - hwy_pts[i0][0]))
        ty = int(hwy_pts[i0][1] + frac * (hwy_pts[i1][1] - hwy_pts[i0][1]))

        draw.ellipse([tx - 18, ty - 18, tx + 18, ty + 18], fill=(6, 182, 212, 60))
        draw.ellipse([tx - 8, ty - 8, tx + 8, ty + 8], fill=(52, 211, 153))

        draw_card(draw, 750, 120, 430, 280, bg=(15, 23, 42, 245), border=(51, 65, 85, 255), radius=16)
        draw.text((774, 142), "LIVE FASTAG DEDUCTIONS (BANK API)", font=font_sub_bold, fill=(245, 158, 11))
        
        tolls = [
            {"name": "Kharagpur NH-16 Toll Plaza", "amt": "- ₹ 840.00", "t": 1.5},
            {"name": "Bhubaneswar South Tollway", "amt": "- ₹ 920.00", "t": 3.5},
            {"name": "Visakhapatnam Bypass Toll", "amt": "- ₹ 1,150.00", "t": 5.5},
            {"name": "Vijayawada Outer Ring Artery", "amt": "- ₹ 1,420.00", "t": 7.5}
        ]
        
        for idx, tl in enumerate(tolls):
            if rel_t > tl['t']:
                ty_pos = 180 + idx * 52
                draw.rounded_rectangle([774, ty_pos, 774 + 382, ty_pos + 42], radius=8, fill=(11, 23, 44), outline=(30, 41, 59))
                draw.text((790, ty_pos + 12), tl['name'], font=font_caption_bold, fill=(255, 255, 255))
                draw.text((1130, ty_pos + 12), tl['amt'], font=font_body_bold, fill=(245, 158, 11), anchor="rt")

        draw_card(draw, 750, 420, 430, 160, bg=(6, 95, 70, 220), border=(16, 185, 129, 255), radius=16)
        draw.text((774, 440), "E-WAY BILL COUNTDOWN (SEC 129 PROTECTED)", font=font_caption_bold, fill=(52, 211, 153))
        draw.text((774, 465), "38.5 Hours Remaining", font=font_title_large, fill=(255, 255, 255))
        draw.text((774, 518), "Distance Remaining: 42 KM • 200% GST Seizure Penalty: 0% RISK", font=font_caption, fill=(203, 213, 225))
        draw.text((774, 540), "Status: 100% Tax Compliant Transit Across Corridors", font=font_caption_bold, fill=(52, 211, 153))

    # =========================================================
    # SCENE 6 (53.0s - 64.0s): Stamped POD & 24hr MSME TReDS Factoring
    # =========================================================
    elif t_sec < 64.0:
        rel_t = t_sec - 53.0

        draw.text((WIDTH//2, 45), "STAGE 5 & 7: PHYSICAL STAMPED POD & 24HR TReDS FACTORING", font=font_title, fill=(52, 211, 153), anchor="mt")
        draw.text((WIDTH//2, 80), "Destination Gate Clearance -> Acknowledgment Seal -> 24hr Bank Cash Advance", font=font_body, fill=(148, 163, 184), anchor="mt")

        # Left: Stamped POD Document
        draw_card(draw, 100, 120, 520, 460, bg=(255, 255, 255), border=(203, 213, 225), radius=16)
        
        draw.text((124, 145), "CONSIGNMENT NOTE / LORRY RECEIPT", font=font_sub_bold, fill=(15, 23, 42))
        draw.text((124, 172), "Destination: Bharat Forge / BFW Peenya Works, Bengaluru", font=font_caption, fill=(71, 85, 105))
        draw.text((124, 195), "Weighbridge Slip WB-8841: Gross 24.8 MT • Net 24.8 MT (Zero Shortage)", font=font_caption_bold, fill=(15, 23, 42))

        if rel_t > 1.2:
            stamp_prog = min(1.0, (rel_t - 1.2) / 0.3)
            stamp_scale = 1.0 + (1.0 - stamp_prog) * 0.8
            stamp_w, stamp_h = int(380 * stamp_scale), int(120 * stamp_scale)
            st_x = 170
            st_y = 260
            
            draw.rounded_rectangle([st_x, st_y, st_x + stamp_w, st_y + stamp_h], radius=12, fill=(220, 252, 231, 230), outline=(22, 163, 74), width=4)
            draw.text((st_x + stamp_w//2, st_y + 24), "RECEIVED IN SOUND CONDITION", font=font_title, fill=(22, 163, 74), anchor="mt")
            draw.text((st_x + stamp_w//2, st_y + 64), "ALL 6 SECURITY SEALS INTACT • ZERO DEFECT", font=font_body_bold, fill=(21, 128, 61), anchor="mt")
            draw.text((st_x + stamp_w//2, st_y + 88), "Acknowledged: 26-Sep-2026 • Ref: BFW/WH/IN/4991", font=font_caption, fill=(71, 85, 105), anchor="mt")

        draw.text((124, 440), "SETTLEMENT RECONCILIATION:", font=font_caption_bold, fill=(15, 23, 42))
        draw.text((124, 465), "Freight (₹8,45,000) - 70% Adv (₹5,91,500) - TDS (₹16,900) - Damage (₹0)", font=font_caption, fill=(71, 85, 105))
        draw.text((124, 490), "= NET BALANCE DUE: ₹ 2,36,600", font=font_title, fill=(22, 163, 74))

        # Right: TReDS 24hr MSME Liquidity Card
        draw_card(draw, 660, 120, 520, 460, bg=(11, 23, 44, 250), border=(16, 185, 129, 255), radius=16)
        
        draw.text((690, 148), "TReDS MSME FACTORING EXCHANGE (RXIL)", font=font_title, fill=(52, 211, 153))
        draw.text((690, 188), "Skip the 60-day client payment delay! Instant bank financing within 24 hours.", font=font_body, fill=(203, 213, 225))

        draw_card(draw, 690, 230, 460, 120, bg=(15, 23, 42, 240), border=(56, 189, 248), radius=12)
        draw.text((710, 248), "WINNING FACTORING BID: STATE BANK OF INDIA", font=font_sub_bold, fill=(56, 189, 248))
        draw.text((710, 278), "Factoring Advance: 88.0% • Discounting Rate: 7.8% p.a.", font=font_body, fill=(255, 255, 255))
        draw.text((710, 305), "Disbursement Window: T+1 (24 Hours Direct to Bank)", font=font_caption_bold, fill=(52, 211, 153))

        if rel_t > 4.0:
            cash_prog = min(1.0, (rel_t - 4.0) / 1.5)
            curr_cash = int(cash_prog * 208208)
            
            draw_card(draw, 690, 375, 460, 160, bg=(6, 95, 70, 230), border=(52, 211, 153, 255), radius=14)
            draw.text((710, 395), "INSTANT BANK LIQUIDITY CREDITED:", font=font_caption_bold, fill=(203, 213, 225))
            draw.text((710, 425), f"+ ₹ {curr_cash:,}", font=font_kpi_huge, fill=(255, 255, 255))
            draw.text((710, 490), "Funds In Bank Account • Client Settles with SBI on Due Date", font=font_caption_bold, fill=(52, 211, 153))

    # =========================================================
    # SCENE 7 (64.0s - 70.0s): Standalone Truck Profitability & Brand Reveal
    # =========================================================
    else:
        rel_t = t_sec - 64.0

        if rel_t < 2.5:
            draw.text((WIDTH//2, 75), "INDIVIDUAL TRUCK STANDALONE PROFITABILITY", font=font_title, fill=(52, 211, 153), anchor="mt")
            draw.text((WIDTH//2, 115), "Monthly Freight - Fuel - Tolls - Wages - Tata Finance EMI = Net Profit", font=font_sub, fill=(148, 163, 184), anchor="mt")

            gauge_prog = min(1.0, rel_t / 1.8)
            pct = int(gauge_prog * 94)

            cx, cy, rad = WIDTH//2, 330, 130
            draw.arc([cx - rad, cy - rad, cx + rad, cy + rad], start=135, end=405, fill=(30, 41, 59), width=24)
            end_angle = 135 + int(gauge_prog * 270)
            draw.arc([cx - rad, cy - rad, cx + rad, cy + rad], start=135, end=end_angle, fill=(16, 185, 129), width=24)

            draw.text((cx, cy - 25), f"{pct}%", font=font_kpi_huge, fill=(255, 255, 255), anchor="mm")
            draw.text((cx, cy + 30), "HEALTHY PROFIT", font=font_sub_bold, fill=(52, 211, 153), anchor="mm")

            draw.text((cx, 505), "+ ₹ 29,600 STANDALONE NET MARGIN AFTER BANK EMI", font=font_title, fill=(245, 158, 11), anchor="mt")
            draw.text((cx, 550), "Tata Prima 5530.S • Loan A/c #TMF-BLR-88921 • EMI Coverage 1.43x", font=font_body, fill=(203, 213, 225), anchor="mt")

        else:
            brand_t = rel_t - 2.5
            b_scale = min(1.0, brand_t / 1.0)
            
            for r in [280, 210, 150, 90]:
                draw.ellipse([WIDTH//2 - r, HEIGHT//2 - r, WIDTH//2 + r, HEIGHT//2 + r], outline=(6, 182, 212, int(65 * b_scale)), width=2)

            draw_mascot(draw, WIDTH//2, int(HEIGHT * 0.30), size=125, expression="happy", scale=b_scale)

            draw.text((WIDTH//2, int(HEIGHT * 0.50)), "SABRE", font=font_hero, fill=(255, 255, 255), anchor="mt")
            draw.text((WIDTH//2, int(HEIGHT * 0.61)), "Autonomous Indian Transport Intelligence & Finance", font=font_title, fill=(6, 182, 212), anchor="mt")
            draw.text((WIDTH//2, int(HEIGHT * 0.69)), "ULIP VAHAN • 4-COPY BILTY • FASTAG SYNC • STAMPED POD • TReDS FACTORING", font=font_body_bold, fill=(52, 211, 153), anchor="mt")
            draw.text((WIDTH//2, int(HEIGHT * 0.77)), "sabre-fleet.in • Built for India's 10 Million Commercial Goods Vehicles", font=font_sub, fill=(148, 163, 184), anchor="mt")

    return np.array(img.convert("RGB"))

def render_ad_video(output_mp4="sabre_motion_ad.mp4", sfx_wav="sabre_motion_sfx.wav"):
    temp_raw_video = "temp_sabre_raw.mp4"
    print(f"[Render] Starting 1280x720 30FPS render for {TOTAL_FRAMES} frames ({TOTAL_SECONDS}s)...")
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    cmd = [
        ffmpeg_exe,
        '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{WIDTH}x{HEIGHT}',
        '-pix_fmt', 'rgb24',
        '-r', str(FPS),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '19',
        temp_raw_video
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    
    for i in range(TOTAL_FRAMES):
        if i % 200 == 0:
            print(f"[Render] Rendering frame {i}/{TOTAL_FRAMES} ({(i/TOTAL_FRAMES)*100:.1f}% - {i/FPS:.1f}s)...")
        frame_rgb = render_frame(i)
        proc.stdin.write(frame_rgb.tobytes())
        
    proc.stdin.close()
    proc.wait()
    print("[Render] Raw video frames written successfully!")

    print(f"[Render] Muxing video with audio track {sfx_wav}...")
    mux_cmd = [
        ffmpeg_exe,
        '-y',
        '-i', temp_raw_video,
        '-i', sfx_wav,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        output_mp4
    ]
    subprocess.run(mux_cmd, check=True)
    
    if os.path.exists(temp_raw_video):
        os.remove(temp_raw_video)
        
    print(f"[Render] SUCCESS! High-production motion graphics ad generated: {output_mp4}")

if __name__ == "__main__":
    render_ad_video()
