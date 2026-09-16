from PIL import Image

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

# Load image
img_path = '/Users/blessingbafunso/.gemini/antigravity/brain/ce1323dc-bb47-4237-95e4-e03e6e931a1f/.user_uploaded/media_1789578855835.png'
img = Image.open(img_path).convert('RGB')
width, height = img.size

# The image has 5 horizontal stripes. We can sample at y = height * 0.1, 0.3, 0.5, 0.7, 0.9
x = width // 2
colors = []
for factor in [0.1, 0.3, 0.5, 0.7, 0.9]:
    y = int(height * factor)
    r, g, b = img.getpixel((x, y))
    colors.append(rgb_to_hex((r, g, b)))

print("Extracted colors:", colors)
