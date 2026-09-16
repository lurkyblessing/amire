import re

with open('index.html', 'r') as f:
    content = f.read()

# The clean, perfectly styled raw HTML form
aesthetic_form = """
        <div class="notify-form-container">
            <form action="https://app.kit.com/forms/9818596/subscriptions" method="post" class="notify-form">
                <input type="email" id="email-input" name="email_address" placeholder="Enter email to get notified" required>
                <button type="submit" class="notify-btn">Join</button>
            </form>
        </div>"""

# Replace the current notify-form-container
content = re.sub(r'<div class="notify-form-container">.*?</div>', aesthetic_form, content, flags=re.DOTALL)

# Remove the ck.5.js from head
content = re.sub(r'<script src="https://f\.convertkit\.com/ckjs/ck\.5\.js"></script>', '', content)

with open('index.html', 'w') as f:
    f.write(content)

with open('style.css', 'r') as f:
    css = f.read()

# Ensure the CSS is clean for .notify-form
css = css.replace('.notify-form, .formkit-form {', '.notify-form {')

with open('style.css', 'w') as f:
    f.write(css)
