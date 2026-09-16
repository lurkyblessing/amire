import re

with open('style.css', 'r') as f:
    lines = f.readlines()

new_lines = []
in_about = False
for line in lines:
    if 'About Page Red Theme Overrides' in line:
        in_about = True
    
    if in_about:
        line = line.replace('var(--color-pink)', 'var(--color-cream)')
        # Fix the footer for about page
        if 'background-color: var(--color-cream)' in line and 'footer {' in ''.join(lines):
            # Actually, I'll just rewrite the about page section
            pass
            
    new_lines.append(line)

# Let's just do a specific sed for lines 319-350
