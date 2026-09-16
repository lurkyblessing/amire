import re

files = ['index.html', 'founder.html', 'sarafina-shades.html']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # 1. Remove the announcement bar
    content = re.sub(r'<div class="announcement-bar">.*?</div>\s*</div>\s*', '', content, flags=re.DOTALL)
    
    # 2. Add the JS for smart header scroll
    js_script = """
    <script>
        // Smart Sticky Header
        let lastScrollTop = 0;
        const header = document.querySelector('.main-header');
        
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                // Scrolling down
                header.style.transform = `translateY(-100%)`;
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        });
    </script>
</body>"""

    content = content.replace('</body>', js_script)
    
    with open(file, 'w') as f:
        f.write(content)

with open('style.css', 'r') as f:
    css = f.read()

# Remove the announcement bar CSS
css = re.sub(r'/\* --------------------\n   ANNOUNCEMENT BAR.*?@keyframes marquee {\n    0% { transform: translateX\(0\); }\n    100% { transform: translateX\(-50%\); } /\* Scrolls exactly half its width \(one of the identical spans\) \*/\n}\n', '', css, flags=re.DOTALL)

# Update main-header to support the transform transition
css = css.replace('.main-header {\n    position: sticky;\n    top: 0;', '.main-header {\n    position: sticky;\n    top: 0;\n    transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1);')

with open('style.css', 'w') as f:
    f.write(css)
