import re

files = ['index.html', 'founder.html', 'sarafina-shades.html']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # We want to replace new-amire-logo.png with amire-footer-logo.png ONLY inside the footer tag
    # Use a regex that matches from <footer> to </footer>
    
    def replacer(match):
        footer_content = match.group(0)
        return footer_content.replace('new-amire-logo.png', 'amire-footer-logo.png')
        
    new_content = re.sub(r'<footer>.*?</footer>', replacer, content, flags=re.DOTALL)
    
    with open(file, 'w') as f:
        f.write(new_content)
