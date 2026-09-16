import re

with open('style.css', 'r') as f:
    css = f.read()

# Make the email form explicitly visible
new_form_css = """
/* --------------------
   EMAIL CAPTURE (PROMINENT)
   -------------------- */
.notify-form-container {
    margin-top: 3rem;
    width: 100%;
    max-width: 400px;
    opacity: 0;
    animation: fadeIn 1.5s ease-out 1.2s forwards;
    position: relative;
    z-index: 10;
}

.notify-form {
    display: flex;
    width: 100%;
    position: relative;
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
    font-weight: 300;
    letter-spacing: 0.05em;
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

css = re.sub(r'/\* --------------------\n   EMAIL CAPTURE.*?\.notify-btn:hover {\n    opacity: 0\.7;\n}', new_form_css, css, flags=re.DOTALL)

with open('style.css', 'w') as f:
    f.write(css)
