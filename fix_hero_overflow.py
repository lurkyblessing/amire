import re

with open('style.css', 'r') as f:
    css = f.read()

# Fix the hero section to prevent cutting off content on smaller screens
css = css.replace('    height: calc(100vh - var(--header-height));\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    overflow: hidden;',
                  '    min-height: calc(100vh - var(--header-height));\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    overflow-x: hidden;\n    padding-bottom: 5rem;')

with open('style.css', 'w') as f:
    f.write(css)
