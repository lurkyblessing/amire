with open('style.css', 'r') as f:
    content = f.read()

import re

new_about_css = """/* About Page Theme Overrides */
body.about-page {
    background-color: var(--color-slate);
    color: var(--color-cream);
}

body.about-page .nav-links a {
    color: var(--color-cream);
}

body.about-page .nav-links a:hover, body.about-page .nav-links a.active {
    color: var(--color-sage);
    opacity: 0.9;
}

body.about-page .about-title {
    color: var(--color-cream);
}

body.about-page .about-text {
    color: var(--color-cream);
}

body.about-page footer {
    background-color: var(--color-sage);
    border-top: none;
    margin-top: 4rem;
}

body.about-page footer p, 
body.about-page footer .social-links span {
    color: var(--color-slate);
}

body.about-page footer svg path {
    fill: var(--color-slate);
}

body.about-page .submark-img {
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(34, 50, 74, 0.25);
}"""

content = re.sub(r'/\* About Page Red Theme Overrides \*/.*', new_about_css, content, flags=re.DOTALL)

with open('style.css', 'w') as f:
    f.write(content)
