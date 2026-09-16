import re

with open('style.css', 'r') as f:
    css = f.read()

# Remove opacity and animation from notify-form-container to prevent visibility issues
css = css.replace('    opacity: 0;\n    animation: fadeIn 1.5s ease-out 1.2s forwards;', '    /* Animation removed to ensure ConvertKit form is visible */')

# Make absolutely sure it displays
css = css.replace('.notify-form-container {', '.notify-form-container {\n    opacity: 1 !important;\n    display: block !important;')

with open('style.css', 'w') as f:
    f.write(css)
