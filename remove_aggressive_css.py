import re

with open('style.css', 'r') as f:
    css = f.read()

# Remove the dangerous display:none rules
css = re.sub(r'/\* Hide labels or extraneous elements ConvertKit might add \*/.*?\}', '', css, flags=re.DOTALL)

with open('style.css', 'w') as f:
    f.write(css)
