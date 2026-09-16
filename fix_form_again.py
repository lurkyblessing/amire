import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace the script tag with the HTML version of their Kit form
html_form = """
        <div class="notify-form-container">
            <form action="https://app.kit.com/forms/9818596/subscriptions" method="post" data-sv-form="9818596" data-uid="6fda4c3bb7" class="notify-form">
                <div style="display: flex; width: 100%;">
                    <input type="email" id="email-input" name="email_address" placeholder="Enter email to get notified" required>
                    <button type="submit" class="notify-btn">Join</button>
                </div>
            </form>
        </div>"""

content = re.sub(r'<div class="notify-form-container">.*?</div>', html_form, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

with open('style.css', 'r') as f:
    css = f.read()

# Replace the crazy Kit overrides with normal CSS for the HTML form
normal_css = """
/* --------------------
   EMAIL CAPTURE (PROMINENT)
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

.notify-form {
    display: block;
    width: 100%;
}

.notify-form div {
    display: flex;
    flex-direction: row;
    background-color: var(--color-slate);
    border: 1px solid var(--color-sage);
    border-radius: 50px;
    overflow: hidden;
}

#email-input {
    flex-grow: 1;
    padding: 1.2rem 1.5rem;
    border: none;
    background: transparent;
    color: var(--color-cream);
    font-size: 1rem;
    font-family: inherit;
    outline: none;
}

#email-input::placeholder {
    color: rgba(255, 250, 240, 0.6);
}

.notify-btn {
    background: var(--color-sage);
    border: none;
    color: var(--color-brown);
    font-weight: 500;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color 0.3s ease;
    padding: 0 2rem;
}

.notify-btn:hover {
    background-color: var(--color-pink);
}
"""

css = re.sub(r'/\* --------------------\n   CONVERTKIT JS EMBED OVERRIDES \(AESTHETIC\).*?\.notify-form-container \.formkit-alert {\n.*?}\n', normal_css, css, flags=re.DOTALL)

with open('style.css', 'w') as f:
    f.write(css)
