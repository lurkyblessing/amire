import re

with open('index.html', 'r') as f:
    content = f.read()

# The original convertkit form to insert
original_form = """
        <div class="notify-form-container">
            <form id="notify-form" action="https://app.kit.com/forms/9818596/subscriptions" method="post" data-sv-form="9818596" data-uid="6fda4c3bb7" data-format="inline" data-version="5" data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! Now check your email to confirm your subscription.","redirect_url":""},"analytics":{},"powered_by":{"show":false},"recaptcha":{"enabled":false}},"version":"5"}' class="notify-form formkit-form">
                <div data-element="fields" style="width: 100%; display: flex; position: relative;">
                    <input type="email" id="email-input" name="email_address" placeholder="Enter email to get notified" required aria-label="Email address">
                    <button type="submit" class="notify-btn" data-element="submit">
                        <span class="submit-text">Join</span>
                    </button>
                </div>
            </form>
            <script src="https://f.convertkit.com/ckjs/ck.5.scripts.js"></script>
        </div>"""

# Replace the current notify-form-container
content = re.sub(r'<div class="notify-form-container">.*?</div>\s*</main>', original_form + '\n    </main>', content, flags=re.DOTALL)

# Remove my custom fetch script
content = re.sub(r'<script>\s*const form = document\.getElementById\(\'notify-form\'\);.*?</script>', '', content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

with open('style.css', 'r') as f:
    css = f.read()

css = css.replace('.notify-form {', '.notify-form, .formkit-form {')

with open('style.css', 'w') as f:
    f.write(css)
