import re

with open('style.css', 'r') as f:
    css = f.read()

# Remove opacity and animations completely from subtitle
css = css.replace('    opacity: 0;\n    animation: fadeIn 1.5s ease-out 0.8s forwards;', '    /* animations removed */')

with open('style.css', 'w') as f:
    f.write(css)
