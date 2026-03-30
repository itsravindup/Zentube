"""
ZenTube Icon Generator
Generates 16x16, 48x48, 128x128 PNG icons using only stdlib.
"""
import struct, zlib, math, os

def write_png(filename, width, height, pixels):
    """Write RGBA pixels list (flat, row-major) as PNG."""
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack('>I', crc)

    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter type = None
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw += bytes([r, g, b, a])

    compressed = zlib.compress(raw, 9)

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    # RGBA mode = color type 6
    ihdr_data = struct.pack('>II', width, height) + bytes([8, 6, 0, 0, 0])
    png = sig
    png += chunk(b'IHDR', ihdr_data)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)

def lerp(a, b, t):
    return a + (b - a) * t

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def circle_aa(cx, cy, r, px, py):
    """Returns anti-aliased alpha for a circle."""
    dist = math.sqrt((px - cx)**2 + (py - cy)**2)
    return clamp(r - dist + 0.5, 0.0, 1.0)

def ring_aa(cx, cy, r, thickness, px, py):
    """Returns anti-aliased alpha for a ring."""
    dist = math.sqrt((px - cx)**2 + (py - cy)**2)
    inner = dist - (r - thickness / 2)
    outer = (r + thickness / 2) - dist
    return clamp(min(inner, outer) + 0.5, 0.0, 1.0)

def rounded_rect_aa(x0, y0, x1, y1, radius, px, py):
    """Returns anti-aliased alpha for a rounded rectangle."""
    # Clamp point to nearest point on rounded rect
    dx = max(x0 + radius - px, 0, px - (x1 - radius))
    dy = max(y0 + radius - py, 0, py - (y1 - radius))
    dist = math.sqrt(dx*dx + dy*dy)
    return clamp(radius - dist + 0.5, 0.0, 1.0)

def make_icon(size):
    pixels = []
    cx = size / 2
    cy = size / 2

    # Colors
    BG  = (15, 17, 21)        # #0F1115
    ACC = (0, 200, 150)       # #00C896
    ACC2 = (123, 224, 184)    # #7BE0B8

    margin    = size * 0.12
    corner_r  = size * 0.22

    # Stylized "Z" coords (normalized 0-1)
    # Silhouette: 
    # (0.2, 0.2) -> (0.8, 0.2)  top bar
    # (0.8, 0.2) -> (0.2, 0.8)  diagonal
    # (0.2, 0.8) -> (0.8, 0.8)  bottom bar
    z_thickness = 0.22
    
    for y in range(size):
        for x in range(size):
            px, py = x + 0.5, y + 0.5
            nx, ny = px / size, py / size # normalized coordinates

            # Start transparent
            r, g, b, a = 0, 0, 0, 0

            # 1. Rounded background (Zen Green)
            bg_alpha = rounded_rect_aa(0, 0, size, size, corner_r, px, py)
            if bg_alpha > 0:
                r, g, b = ACC[0], ACC[1], ACC[2] # Zen Green Background
                a = int(bg_alpha * 255)

            # 2. White "Z" Logic
            z_alpha = 0
            
            # Top bar
            if 0.2 < nx < 0.8 and 0.2 < ny < 0.2 + z_thickness:
                z_alpha = 1.0
            # Bottom bar
            elif 0.2 < nx < 0.8 and 0.8 - z_thickness < ny < 0.8:
                z_alpha = 1.0
            # Diagonal
            # Line: ny = -nx + 1.0 approx (from top-right to bottom-left)
            # Distance from point to line nx + ny - 1.0 = 0
            dist_to_diag = abs(nx + ny - 1.0) / math.sqrt(2)
            if dist_to_diag < z_thickness / 2 and 0.2 < ny < 0.8:
                z_alpha = 1.0
            
            # Anti-aliasing for Z (coarse but effective)
            edge_soft = 0.05
            if z_alpha > 0:
                # White "Z"
                r = int(lerp(r, 255, z_alpha * bg_alpha))
                g = int(lerp(g, 255, z_alpha * bg_alpha))
                b = int(lerp(b, 255, z_alpha * bg_alpha))
                a = max(a, int(z_alpha * bg_alpha * 255))

            pixels.append((r, g, b, a))

    return pixels


out_dir = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(out_dir, exist_ok=True)

for sz in [16, 48, 128]:
    pxs = make_icon(sz)
    path = os.path.join(out_dir, f'icon{sz}.png')
    write_png(path, sz, sz, pxs)
    print(f'Generated {path}')

print('Done.')
