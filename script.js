document.addEventListener('DOMContentLoaded', () => {
    // ConvertKit ck.5.js script handles the form submission now, 
    // so we removed the manual fetch logic that used to be here.

    // Add subtle interactive particle effect (parallax)
    const bgAnimation = document.querySelector('.background-animation');
    
    if (bgAnimation) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            bgAnimation.style.transform = `translate(${x * -3}%, ${y * -3}%)`;
        });
    }
});
