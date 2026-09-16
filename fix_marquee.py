import re

files = ['index.html', 'founder.html', 'sarafina-shades.html']

# Modern seamless marquee using two identical content blocks
marquee_html = """    <div class="announcement-bar">
        <div class="marquee">
            <span>functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • </span>
            <span>functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • functional beauty for the effortless cool girl • èmí reé. awa reé. a ti dé. • </span>
        </div>
    </div>"""

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace the old marquee HTML
    content = re.sub(r'<div class="announcement-bar">.*?</div>\s*</div>', marquee_html, content, flags=re.DOTALL)
    
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
    position: relative;
    z-index: 1100;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
    display: flex;
}

.marquee {
    display: flex;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
}

.marquee span {
    padding-right: 15px; /* Adjust spacing to look seamless with the dot */
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); } /* Scrolls exactly half its width (one of the identical spans) */
}
"""

css = re.sub(r'/\* --------------------\n   ANNOUNCEMENT BAR.*?@keyframes marquee {\n.*?}\n', marquee_css, css, flags=re.DOTALL)

with open('style.css', 'w') as f:
    f.write(css)
