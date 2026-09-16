import re

files = ['index.html', 'founder.html', 'sarafina-shades.html']

marquee_html = """    <div class="announcement-bar">
        <div class="marquee">
            <span>functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé.</span>
        </div>
    </div>
"""

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'announcement-bar' not in content:
        content = content.replace('<body>', f'<body>\n{marquee_html}')
        
        with open(file, 'w') as f:
            f.write(content)

with open('style.css', 'r') as f:
    css = f.read()

marquee_css = """
/* --------------------
   ANNOUNCEMENT BAR
   -------------------- */
.announcement-bar {
    background-color: var(--color-sage);
    color: var(--color-brown);
    padding: 10px 0;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    z-index: 1100;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
}

.marquee {
    display: inline-block;
    padding-left: 100%;
    animation: marquee 25s linear infinite;
}

.marquee span {
    padding-right: 50px;
}

@keyframes marquee {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(-100%, 0); }
}

"""

if '.announcement-bar' not in css:
    css = marquee_css + css
    with open('style.css', 'w') as f:
        f.write(css)
