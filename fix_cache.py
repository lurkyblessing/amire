import glob
import re

for file in glob.glob("*.html"):
    with open(file, 'r') as f:
        content = f.read()
    
    # Update cache buster to force browsers to download new CSS
    content = re.sub(r'style\.css\?v=[0-9]+', 'style.css?v=999', content)
    
    with open(file, 'w') as f:
        f.write(content)
