import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace all of that mess with the clean form block
clean_form = """        <div class="notify-form-container">
            <form action="https://app.kit.com/forms/9818596/subscriptions" method="post" class="notify-form">
                <div style="display: flex; width: 100%;">
                    <input type="email" id="email-input" name="email_address" placeholder="Enter email to get notified" required>
                    <button type="submit" class="notify-btn">Join</button>
                </div>
            </form>
        </div>"""

# Remove the broken block
pattern = r'<div class="notify-form-container">.*?</script>\s*</div>'
content = re.sub(pattern, clean_form, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)
