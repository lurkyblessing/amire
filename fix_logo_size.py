import re

with open('style.css', 'r') as f:
    css = f.read()

# Add max-height to the logo so it never takes up the whole screen
css = css.replace('.center-logo {\n    max-width: clamp(280px, 45vw, 650px);\n    height: auto;',
                  '.center-logo {\n    max-width: clamp(280px, 45vw, 650px);\n    height: auto;\n    max-height: 45vh;\n    object-fit: contain;')

with open('style.css', 'w') as f:
    f.write(css)
