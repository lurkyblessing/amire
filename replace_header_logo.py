import re

files = ['index.html', 'founder.html', 'sarafina-shades.html']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # We want to replace new-amire-logo.png with amire-top-left-logo.png ONLY inside the header tag
    
    def replacer(match):
        header_content = match.group(0)
        return header_content.replace('new-amire-logo.png', 'amire-top-left-logo.png')
        
    new_content = re.sub(r'<header.*?</header>', replacer, content, flags=re.DOTALL)
    
    with open(file, 'w') as f:
        f.write(new_content)
