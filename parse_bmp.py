import struct
with open('palette.bmp', 'rb') as f:
    header = f.read(54)
    width, height = struct.unpack('<II', header[18:26])
    bpp = struct.unpack('<H', header[28:30])[0]
    bytes_per_pixel = bpp // 8
    row_padded = (width * bytes_per_pixel + 3) & ~3
    
    colors = []
    for factor in [0.9, 0.7, 0.5, 0.3, 0.1]:
        y = int(height * factor)
        f.seek(54 + y * row_padded)
        row_data = f.read(width * bytes_per_pixel)
        x = width // 2
        pixel = row_data[x*bytes_per_pixel:x*bytes_per_pixel+3]
        b, g, r = struct.unpack('BBB', pixel)
        colors.append('#{:02x}{:02x}{:02x}'.format(r, g, b))

print("Colors:", colors)
