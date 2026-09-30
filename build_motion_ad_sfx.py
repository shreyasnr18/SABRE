"""
High-Precision Synthesized Sound Effects Track Generator for SABRE Motion Graphics Ad.
Generates all UI sound effects, swooshes, clicks, dings, cash registers, stamp impacts,
and mixed master audio track aligned with 30 FPS video frames.
"""

import numpy as np
from scipy.io import wavfile
import os

SAMPLE_RATE = 44100

def create_whoosh(duration=0.5, freq_start=150, freq_end=800, volume=0.7):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # White noise
    noise = np.random.normal(0, 1, n)
    # Exponential envelope
    env = np.sin(np.pi * t / duration) ** 2
    # Moving bandpass center frequency
    freqs = np.linspace(freq_start, freq_end, n)
    phase = 2 * np.pi * np.cumsum(freqs) / SAMPLE_RATE
    carrier = np.sin(phase)
    # Mix noise and tone
    sound = (0.7 * noise * env + 0.3 * carrier * env) * volume
    return sound

def create_sub_boom(duration=1.2, freq=65, volume=0.85):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    pitch_decay = np.exp(-3.5 * t)
    carrier = np.sin(2 * np.pi * (freq * (1.0 + pitch_decay * 1.5)) * t)
    env = np.exp(-2.2 * t)
    return carrier * env * volume

def create_ui_click(duration=0.06, volume=0.7):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # Quick high-frequency transient click
    sig = np.sin(2 * np.pi * 1800 * t) * np.exp(-120 * t)
    click = np.random.normal(0, 0.4, n) * np.exp(-180 * t)
    return (sig + click) * volume

def create_pop_chime(duration=0.25, freq=587.33, volume=0.65): # D5
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # Bubble pop pitch drop then bell decay
    pitch = freq * (1.0 + 0.8 * np.exp(-40 * t))
    sig = np.sin(2 * np.pi * pitch * t) * np.exp(-14 * t)
    return sig * volume

def create_success_ding(duration=0.9, freq=1046.5, volume=0.75): # C6
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # Harmonic bell: fundamental, 2nd, 3rd, 5th
    h1 = np.sin(2 * np.pi * freq * t) * np.exp(-4.5 * t)
    h2 = 0.5 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-6.0 * t)
    h3 = 0.3 * np.sin(2 * np.pi * freq * 3.0 * t) * np.exp(-8.0 * t)
    h4 = 0.15 * np.sin(2 * np.pi * freq * 4.2 * t) * np.exp(-10.0 * t)
    return (h1 + h2 + h3 + h4) * volume

def create_stamp_thud(duration=0.45, volume=0.9):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # Mechanical stamp impact: slap transient + heavy wooden thud
    slap = np.random.normal(0, 0.8, n) * np.exp(-85 * t)
    thud = np.sin(2 * np.pi * 95 * t * (1.0 + np.exp(-25 * t))) * np.exp(-12 * t)
    return (slap * 0.4 + thud * 0.8) * volume

def create_cash_register(duration=1.2, volume=0.8):
    n = int(SAMPLE_RATE * duration)
    total = np.zeros(n)
    # Drawer mechanical slide click
    t_slide = np.linspace(0, 0.15, int(SAMPLE_RATE * 0.15), endpoint=False)
    drawer = np.random.normal(0, 0.4, len(t_slide)) * np.exp(-20 * t_slide)
    total[:len(drawer)] += drawer * 0.5
    # Dual bell dings: F6 (1396Hz) & A6 (1760Hz)
    offset = int(0.12 * SAMPLE_RATE)
    rem = n - offset
    t_bell = np.linspace(0, rem / SAMPLE_RATE, rem, endpoint=False)
    b1 = np.sin(2 * np.pi * 1396.9 * t_bell) * np.exp(-5.0 * t_bell)
    b2 = 0.8 * np.sin(2 * np.pi * 1760.0 * t_bell) * np.exp(-5.5 * t_bell)
    b3 = 0.4 * np.sin(2 * np.pi * 2093.0 * t_bell) * np.exp(-7.0 * t_bell)
    total[offset:] += (b1 + b2 + b3) * volume
    return total

def create_fastag_beep(duration=0.18, freq=1864.66, volume=0.5): # A#6
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    sig = np.sin(2 * np.pi * freq * t) * np.exp(-12 * t)
    return sig * volume

def create_warning_buzz(duration=0.35, freq=180, volume=0.5):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # Sawtooth/buzz
    saw = 2 * (t * freq - np.floor(0.5 + t * freq))
    env = np.sin(np.pi * t / duration) ** 2
    return saw * env * volume

def create_fanfare_chord(duration=2.2, volume=0.8):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    # C major triad chime cascade: C5 (523), E5 (659), G5 (784), C6 (1046)
    chord = np.zeros(n)
    freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]
    delays = [0.0, 0.08, 0.16, 0.24, 0.32]
    for f, d in zip(freqs, delays):
        d_idx = int(d * SAMPLE_RATE)
        rem = n - d_idx
        if rem > 0:
            t_rem = np.linspace(0, rem / SAMPLE_RATE, rem, endpoint=False)
            tone = np.sin(2 * np.pi * f * t_rem) * np.exp(-2.8 * t_rem)
            tone += 0.3 * np.sin(2 * np.pi * f * 2.0 * t_rem) * np.exp(-4.0 * t_rem)
            chord[d_idx:] += tone * 0.3
    return chord * volume

def create_gauge_whir(duration=1.5, start_f=200, end_f=880, volume=0.6):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    freqs = np.linspace(start_f, end_f, n)
    phase = 2 * np.pi * np.cumsum(freqs) / SAMPLE_RATE
    tone = np.sin(phase) * (0.3 + 0.7 * t / duration)
    # ticking
    ticks = np.sin(2 * np.pi * 30 * t) > 0.8
    env = np.sin(np.pi * t / duration)
    return (tone * 0.7 + ticks * 0.3) * env * volume

def create_shimmer_sparkle(duration=1.0, volume=0.5):
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    sparkles = np.zeros(n)
    for f in [2200, 3100, 4400, 5600, 6800]:
        phase_rand = np.random.uniform(0, 2*np.pi)
        sparkles += np.sin(2 * np.pi * f * t + phase_rand) * np.exp(-np.random.uniform(3, 8) * t)
    return sparkles * (volume / 5.0)

def generate_master_soundtrack(total_duration_sec=70.0, output_wav='sabre_motion_sfx.wav'):
    total_samples = int(SAMPLE_RATE * total_duration_sec)
    # 2-channel stereo
    master_left = np.zeros(total_samples, dtype=np.float32)
    master_right = np.zeros(total_samples, dtype=np.float32)

    def mix_event(start_sec, sound, pan=0.0): # pan: -1.0 (left) to 1.0 (right)
        start_idx = int(start_sec * SAMPLE_RATE)
        sound_len = len(sound)
        if start_idx >= total_samples:
            return
        end_idx = min(start_idx + sound_len, total_samples)
        chunk = sound[:end_idx - start_idx]
        
        # Panning law
        l_gain = np.cos((pan + 1) * np.pi / 4)
        r_gain = np.sin((pan + 1) * np.pi / 4)
        
        master_left[start_idx:end_idx] += chunk * l_gain
        master_right[start_idx:end_idx] += chunk * r_gain

    # ==========================================
    # SCENE 1: The Chaos of Logistics Paperwork (0s - 10s)
    # ==========================================
    mix_event(0.2, create_whoosh(0.7, 100, 400, 0.45), pan=-0.3)
    mix_event(1.0, create_warning_buzz(0.4, 160, 0.4), pan=-0.4)
    mix_event(2.2, create_warning_buzz(0.3, 220, 0.35), pan=0.4)
    mix_event(3.5, create_whoosh(0.5, 200, 600, 0.4), pan=0.2)
    mix_event(4.8, create_warning_buzz(0.45, 140, 0.45), pan=-0.2)
    mix_event(6.2, create_warning_buzz(0.3, 190, 0.4), pan=0.5)
    mix_event(7.5, create_whoosh(0.6, 150, 500, 0.5), pan=-0.3)
    mix_event(8.8, create_warning_buzz(0.4, 210, 0.45), pan=0.1)

    # ==========================================
    # SCENE 2: Meet SABRE Core &bull; The AI Agent (10s - 19s)
    # ==========================================
    mix_event(10.0, create_sub_boom(1.6, 50, 0.9), pan=0.0)
    mix_event(10.2, create_whoosh(1.0, 100, 950, 0.75), pan=0.0)
    mix_event(11.2, create_pop_chime(0.4, 659.25, 0.8), pan=0.0) # Pop in
    mix_event(12.0, create_shimmer_sparkle(0.9, 0.6), pan=0.2) # Blink
    mix_event(13.5, create_success_ding(1.0, 1046.5, 0.7), pan=0.0) # Smile
    mix_event(15.2, create_pop_chime(0.3, 783.99, 0.65), pan=-0.2)
    mix_event(16.8, create_shimmer_sparkle(1.1, 0.7), pan=0.1) # Wink

    # ==========================================
    # SCENE 3: Instant ULIP Compliance (19s - 29s)
    # ==========================================
    mix_event(19.0, create_whoosh(0.6, 200, 750, 0.6), pan=0.3)
    mix_event(20.0, create_pop_chime(0.3, 523.25, 0.6), pan=-0.4)
    mix_event(21.2, create_pop_chime(0.3, 587.33, 0.6), pan=0.4)
    mix_event(22.8, create_ui_click(0.06, 0.8), pan=0.1) # Click verify
    mix_event(23.2, create_success_ding(1.2, 1174.66, 0.85), pan=-0.2) # VAHAN verified
    mix_event(24.5, create_success_ding(1.2, 1318.51, 0.85), pan=0.2) # SARATHI verified
    mix_event(26.0, create_fanfare_chord(1.5, 0.65), pan=0.0) # All cleared
    mix_event(27.5, create_shimmer_sparkle(0.8, 0.5), pan=0.3)

    # ==========================================
    # SCENE 4: 4-Copy Bilty Morph & 70% Advance (29s - 41s)
    # ==========================================
    mix_event(29.0, create_whoosh(0.7, 180, 800, 0.65), pan=-0.2)
    mix_event(30.2, create_pop_chime(0.2, 440, 0.6), pan=-0.5) # Copy 1
    mix_event(30.8, create_pop_chime(0.2, 554, 0.6), pan=-0.2) # Copy 2
    mix_event(31.4, create_pop_chime(0.2, 659, 0.6), pan=0.2) # Copy 3
    mix_event(32.0, create_pop_chime(0.2, 880, 0.65), pan=0.5) # Copy 4
    mix_event(33.5, create_ui_click(0.06, 0.75), pan=0.0)
    mix_event(34.0, create_cash_register(1.3, 0.85), pan=0.1) # Advance split
    mix_event(36.5, create_fastag_beep(0.2, 1400, 0.6), pan=-0.3)
    mix_event(38.0, create_success_ding(0.9, 1046.5, 0.65), pan=0.2)

    # ==========================================
    # SCENE 5: Highway Artery Radar & Live FASTag (41s - 53s)
    # ==========================================
    mix_event(41.0, create_whoosh(0.8, 120, 600, 0.6), pan=0.0)
    mix_event(42.5, create_fastag_beep(0.18, 1760, 0.7), pan=-0.4) # Toll 1
    mix_event(44.2, create_fastag_beep(0.18, 1760, 0.7), pan=0.1) # Toll 2
    mix_event(46.0, create_fastag_beep(0.18, 1760, 0.75), pan=0.4) # Toll 3
    mix_event(47.8, create_success_ding(1.0, 987.77, 0.7), pan=0.0) # E-Way safe
    mix_event(50.0, create_shimmer_sparkle(1.0, 0.5), pan=0.2)

    # ==========================================
    # SCENE 6: Stamped POD & 24hr MSME TReDS (53s - 64s)
    # ==========================================
    mix_event(53.0, create_whoosh(0.6, 200, 700, 0.6), pan=0.0)
    mix_event(54.2, create_stamp_thud(0.5, 0.95), pan=0.0) # Physical Stamp Thud!
    mix_event(55.8, create_ui_click(0.06, 0.8), pan=0.2) # Acknowledgment click
    mix_event(57.0, create_ui_click(0.06, 0.85), pan=0.0) # TReDS Click
    mix_event(57.4, create_cash_register(1.4, 0.9), pan=0.0) # Instant Bank Advance!
    mix_event(58.5, create_fanfare_chord(2.0, 0.9), pan=0.0) # Celebration Fanfare
    mix_event(61.0, create_shimmer_sparkle(1.2, 0.6), pan=0.2)

    # ==========================================
    # SCENE 7: Truck Standalone Profit & Brand Outro (64s - 70s)
    # ==========================================
    mix_event(64.0, create_gauge_whir(1.6, 250, 950, 0.65), pan=0.0) # Gauge winds up
    mix_event(65.6, create_success_ding(1.2, 1318.51, 0.85), pan=0.0) # Gauge locks at +29,600
    mix_event(66.5, create_sub_boom(1.8, 48, 0.95), pan=0.0) # Grand Logo reveal
    mix_event(66.7, create_whoosh(1.0, 150, 1100, 0.8), pan=0.0)
    mix_event(67.5, create_fanfare_chord(2.5, 0.85), pan=0.0)
    mix_event(68.5, create_shimmer_sparkle(1.5, 0.7), pan=0.0)

    # Master Normalization & Peak Limiting
    peak = max(np.max(np.abs(master_left)), np.max(np.abs(master_right)))
    if peak > 0.95:
        master_left = master_left * (0.95 / peak)
        master_right = master_right * (0.95 / peak)

    # Convert to 16-bit PCM stereo
    stereo = np.vstack(((master_left * 32767).astype(np.int16), (master_right * 32767).astype(np.int16))).T
    wavfile.write(output_wav, SAMPLE_RATE, stereo)
    print(f"[SFX] Generated master audio track: {output_wav} ({total_duration_sec}s, {SAMPLE_RATE}Hz Stereo)")

if __name__ == "__main__":
    generate_master_soundtrack()
