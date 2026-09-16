import re

with open('index.html', 'r') as f:
    content = f.read()

# The JS embed script they provided
js_embed = """
        <div class="notify-form-container">
            <script async data-uid="6fda4c3bb7" src="https://amire-cosmetics.kit.com/6fda4c3bb7/index.js"></script>
        </div>"""

content = re.sub(r'<div class="notify-form-container">.*?</div>', js_embed, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

with open('style.css', 'r') as f:
    css = f.read()

# CSS Overrides for ConvertKit's injected form
# We will target .forma-builder classes which are common in Kit.com (formerly ConvertKit)
# Or we can just use generic attribute selectors to force the styling

kit_css = """
/* --------------------
   CONVERTKIT JS EMBED OVERRIDES (AESTHETIC)
   -------------------- */
.notify-form-container {
    margin-top: 3rem;
    width: 100%;
    max-width: 450px;
    opacity: 1 !important;
    display: block !important;
    position: relative;
    z-index: 10;
}

/* Force the Kit form wrapper to be a pill */
.notify-form-container form {
    display: flex !important;
    flex-direction: row !important;
    background-color: var(--color-slate) !important;
    border: 1px solid var(--color-sage) !important;
    border-radius: 50px !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
}

/* Hide labels or extraneous elements ConvertKit might add */
.notify-form-container form > div:not([data-element="fields"]) {
    display: none !important;
}

/* The fields wrapper */
.notify-form-container form [data-element="fields"],
.notify-form-container form .formkit-fields {
    display: flex !important;
    width: 100% !important;
    flex-direction: row !important;
}

/* The input field */
.notify-form-container input[type="email"] {
    flex-grow: 1 !important;
    padding: 1.2rem 1.5rem !important;
    border: none !important;
    background: transparent !important;
    color: var(--color-cream) !important;
    font-size: 1rem !important;
    font-family: inherit !important;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    height: auto !important;
    margin: 0 !important;
}

.notify-form-container input[type="email"]::placeholder {
    color: rgba(255, 250, 240, 0.6) !important;
}

/* The submit button */
.notify-form-container button[type="submit"] {
    background: var(--color-sage) !important;
    border: none !important;
    color: var(--color-brown) !important;
    font-weight: 500 !important;
    font-size: 0.9rem !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    cursor: pointer !important;
    transition: background-color 0.3s ease !important;
    padding: 0 2rem !important;
    border-radius: 0 !important;
    height: auto !important;
    margin: 0 !important;
}

.notify-form-container button[type="submit"]:hover {
    background-color: var(--color-pink) !important;
}

/* Success/Error message styling */
.notify-form-container .formkit-alert {
    color: var(--color-sage) !important;
    background: transparent !important;
    border: none !important;
    margin-top: 1rem !important;
    font-size: 0.9rem !important;
    text-align: center !important;
}
"""

# replace the old notify-form stuff
css = re.sub(r'/\* --------------------\n   EMAIL CAPTURE \(PROMINENT\).*?\.notify-btn:hover {\n    background-color: var\(--color-pink\);\n}', kit_css, css, flags=re.DOTALL)

with open('style.css', 'w') as f:
    f.write(css)
