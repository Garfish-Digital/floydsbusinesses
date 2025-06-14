// Dynamic Year
document.getElementById('year').textContent = new Date().getFullYear();

// Custom Cursor
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
});

// Intersection Observer Scroll Reveal
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Optional: animate only once
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    observer.observe(el);
  });
});

// Magnetic Hover (Basic Stub)
function magnetize(el) {
  el.style.transition = 'transform 0.3s ease-out'; // Add glide effect

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.1; // reduce pull strength
    const y = (e.clientY - rect.top - rect.height / 2) * 0.1;

    el.style.transform = `translate(${x}px, ${y}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
  });
}

document.querySelectorAll('.group').forEach(magnetize);

// Debounced Scroll (Optional Enhancement)
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Custom scroll events can go here
    }, 100);
});

// Smooth Scroll
document.addEventListener("DOMContentLoaded", function () {
  // Select all anchor links that point to sections on the page
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(anchor => {
    anchor.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default jump

      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
});
