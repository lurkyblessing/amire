import zlib
import struct

def parse_png(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    
    pos = 8
    chunks = {}
    idats = []
    
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        chunk_type = data[pos+4:pos+8]
        chunk_data = data[pos+8:pos+8+length]
        pos += 12 + length
        
        if chunk_type == b'IHDR':
            w, h, bit, colortype, comp, filt, inter = struct.unpack('>IIBBBBB', chunk_data)
            chunks['IHDR'] = (w, h, bit, colortype)
        elif chunk_type == b'IDAT':
            idats.append(chunk_data)
            
    decompressed = zlib.decompress(b''.join(idats))
    w, h, bit, colortype = chunks['IHDR']
    
    # Assuming colortype == 2 (RGB) or 6 (RGBA), 8-bit
    bpp = 3 if colortype == 2 else 4
    stride = w * bpp + 1
    
    def paeth_predictor(a, b, c):
        p = a + b - c
        pa = abs(p - a)
        pb = abs(p - b)
        pc = abs(p - c)
        if pa <= pb and pa <= pc: return a
        elif pb <= pc: return b
        return c

    out = bytearray(h * w * bpp)
    prev_row = bytearray(w * bpp)
    
    for y in range(h):
        filter_type = decompressed[y * stride]
        row_data = decompressed[y * stride + 1 : (y + 1) * stride]
        out_row = bytearray(w * bpp)
        
        for x in range(w * bpp):
            a = out_row[x - bpp] if x >= bpp else 0
            b = prev_row[x]
            c = prev_row[x - bpp] if x >= bpp else 0
            
            raw = row_data[x]
            if filter_type == 0: val = raw
            elif filter_type == 1: val = (raw + a) & 255
            elif filter_type == 2: val = (raw + b) & 255
            elif filter_type == 3: val = (raw + (a + b) // 2) & 255
            elif filter_type == 4: val = (raw + paeth_predictor(a, b, c)) & 255
            
            out_row[x] = val
            out[(y * w + x//bpp)*bpp + x%bpp] = val
            
        prev_row = out_row
        
    return out, w, h, bpp

img_path = '/Users/blessingbafunso/.gemini/antigravity/brain/ce1323dc-bb47-4237-95e4-e03e6e931a1f/.user_uploaded/media_1789578855835.png'
out, w, h, bpp = parse_png(img_path)

colors = []
for factor in [0.1, 0.3, 0.5, 0.7, 0.9]:
    y = int(h * factor)
    x = w // 2
    idx = (y * w + x) * bpp
    r, g, b = out[idx:idx+3]
    colors.append('#{:02x}{:02x}{:02x}'.format(r, g, b))

print("Colors:", colors)
