document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('notify-form');
    const emailInput = document.getElementById('email-input');
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (email) {
            // Simulate API call
            const btn = form.querySelector('.notify-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Submitting...';
            btn.disabled = true;
            
            setTimeout(() => {
                formMessage.textContent = 'Thank you! We will notify you when we launch.';
                formMessage.className = 'form-message success';
                emailInput.value = '';
                btn.textContent = originalText;
                btn.disabled = false;
                
                setTimeout(() => {
                    formMessage.style.opacity = '0';
                    setTimeout(() => {
                        formMessage.textContent = '';
                        formMessage.className = 'form-message';
                        formMessage.style.opacity = '';
                    }, 300);
                }, 4000);
            }, 1200);
        }
    });

    // Add subtle interactive particle effect (parallax)
    const bgAnimation = document.querySelector('.background-animation');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        bgAnimation.style.transform = `translate(${x * -3}%, ${y * -3}%)`;
    });
});
