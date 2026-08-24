import re

with open('sarafina-shades.html', 'r') as f:
    content = f.read()

# 1. Remove the old small descriptions
content = re.sub(r'<span class="shade-desc baskerville-font">.*?</span>\s*', '', content)

# 2. Add data-desc attributes
swatch_replacements = {
    'morádé (s)': 'for girls ready to wear their crown. this stunning silver color way is a perfect staple in your closet. so whatever your statement, your bling says “i’m here”',
    'morádé (g)': 'for girls ready to wear their crown. this stunning gold color way is a perfect staple in your closet. so whatever your statement, your bling says “i’m here”',
    'abiola': 'a bold statement for the trendsetter who isn\'t afraid to stand out.',
    'damiana': 'rich and grounded, an everyday essential that elevates any look.',
    'abeke': 'cool and balanced, the perfect finishing touch for a flawless vibe.'
}

# Add data-desc to each swatch
for name, desc in swatch_replacements.items():
    pattern = rf'(<span class="shade-name">{re.escape(name)}</span>\s*<div class="color-swatch")'
    replacement = rf'\1 data-desc="{desc}"'
    content = re.sub(pattern, replacement, content)

# 3. Add dynamic text container
dynamic_text_html = '''                </div>

                <div id="dynamic-shade-desc" class="baskerville-font" style="display:none; color: var(--color-pink); font-size: 1.1rem; line-height: 1.5; margin-bottom: 2rem; opacity: 0; transition: opacity 0.3s ease;"></div>

                <a href="#" class="preorder-btn" id="preorder-btn">Preorder</a>'''
content = content.replace('                </div>\n\n                <a href="#" class="preorder-btn" id="preorder-btn">Preorder</a>', dynamic_text_html)

# 4. Update JavaScript to add click listeners
js_addition = '''
            // Colorway selection logic
            const swatches = document.querySelectorAll('.color-swatch');
            const dynamicDesc = document.getElementById('dynamic-shade-desc');
            
            swatches.forEach(swatch => {
                swatch.addEventListener('click', (e) => {
                    // Remove selected state from all
                    swatches.forEach(s => {
                        s.style.boxShadow = 'none';
                        s.style.transform = 'scale(1)';
                    });
                    
                    // Add selected state to clicked
                    e.target.style.boxShadow = '0 0 15px rgba(255,255,255,0.4)';
                    e.target.style.transform = 'scale(1.15)';
                    
                    // Show description
                    const desc = e.target.getAttribute('data-desc');
                    if (desc) {
                        dynamicDesc.style.display = 'block';
                        // small delay to allow display block to render before fading in
                        setTimeout(() => {
                            dynamicDesc.style.opacity = '1';
                            dynamicDesc.innerHTML = desc;
                        }, 10);
                    }
                });
            });
'''

# Find the end of the scroll event listener inside DOMContentLoaded
content = content.replace('window.dispatchEvent(new Event(\'scroll\'));', 'window.dispatchEvent(new Event(\'scroll\'));\n' + js_addition)

with open('sarafina-shades.html', 'w') as f:
    f.write(content)

print("Updated sarafina-shades.html")
