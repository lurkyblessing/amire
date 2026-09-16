import re

with open('style.css', 'r') as f:
    css = f.read()

css = re.sub(r'--color-pink: #[A-Fa-f0-9]+;', '--color-pink: #faedf1;', css)
css = re.sub(r'--color-brown: #[A-Fa-f0-9]+;', '--color-brown: #281915;', css)
css = re.sub(r'--color-sage: #[A-Fa-f0-9]+;', '--color-sage: #a0bddb;', css)
css = re.sub(r'--color-slate: #[A-Fa-f0-9]+;', '--color-slate: #22324a;', css)
css = re.sub(r'--color-red: #[A-Fa-f0-9]+;', '--color-red: #fffaf0;', css)

with open('style.css', 'w') as f:
    f.write(css)
