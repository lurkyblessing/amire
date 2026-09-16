import re

with open('index.html', 'r') as f:
    content = f.read()

# Add the script to the head
script = '\n    <script src="https://f.convertkit.com/ckjs/ck.5.js"></script>\n</head>'
content = content.replace('</head>', script)

with open('index.html', 'w') as f:
    f.write(content)
