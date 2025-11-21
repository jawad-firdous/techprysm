const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const headerNav = qs(".site-nav");
const menuToggle = qs(".menu-toggle");
const contactModal = qs("#contact-modal");
const openModalButtons = qsa("[data-open-modal]");
const activityFeed = qs("#activity-feed");
const caseCarousel = qs("#case-carousel");
const casePrev = qs("[data-carousel-prev]");
const caseNext = qs("[data-carousel-next]");
const yearEl = qs("#year");

const state = {
  carouselIndex: 0,
  activities: [
    {
      title: "Retail Copilot",
      detail: "Automated product tagging deployed",
      time: "04:21 PM",
      tone: "violet",
    },
    {
      title: "Health Ops",
      detail: "HIPAA-compliant API audited",
      time: "03:58 PM",
      tone: "teal",
    },
    {
      title: "FinTech Studio",
      detail: "Predictive risk dashboard shipped",
      time: "03:14 PM",
      tone: "amber",
    },
    {
      title: "Smart Supply",
      detail: "Inventory forecasting tuned",
      time: "02:47 PM",
      tone: "teal",
    },
    {
      title: "College Advisor",
      detail: "New onboarding funnel launched",
      time: "02:05 PM",
      tone: "violet",
    },
    {
      title: "Ops Pilot",
      detail: "Predictive risk dashboard shipped",
      time: "01:42 PM",
      tone: "amber",
    },
  ],
  nextActivityIndex: 0,
};

function toggleNav() {
  headerNav.classList.toggle("is-open");
}

function closeNavOnLinkClick(e) {
  if (e.target.matches("a") && headerNav.classList.contains("is-open")) {
    headerNav.classList.remove("is-open");
  }
}

// Form will be found after DOM loads
let contactForm;
let closeModalButtons;

function openModal() {
  contactModal?.showModal();
}

function closeModal() {
  contactModal?.close();
}

function initModal() {
  // Find form and buttons when initializing
  contactForm = qs("#contact-form");
  closeModalButtons = qsa("[data-close-modal]");
  
  openModalButtons.forEach((btn) => btn.addEventListener("click", openModal));
  closeModalButtons.forEach((btn) => btn.addEventListener("click", closeModal));
  
  contactModal?.addEventListener("click", (event) => {
    const dialog = event.currentTarget;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      dialog.close("backdrop");
    }
  });

  // Handle form submission with Formspree
  if (contactForm) {
    // Set the redirect URL based on current host
    const nextUrlInput = contactForm.querySelector('#form-next-url');
    if (nextUrlInput) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      nextUrlInput.value = isLocal 
        ? `${window.location.origin}${window.location.pathname}?submitted=true`
        : 'https://www.techprysm.com/?submitted=true';
    }
    
    // Check if Formspree endpoint is configured
    if (contactForm.action.includes('YOUR_FORM_ID')) {
      console.warn("⚠️ Formspree endpoint not configured! Please replace YOUR_FORM_ID with your actual Formspree form ID.");
    }
    
    // Attach handler directly
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    // CRITICAL: Prevent default form submission FIRST
    contactForm.onsubmit = function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Also use addEventListener
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const emailInput = contactForm.querySelector('input[type="email"]');
      const messageInput = contactForm.querySelector('textarea[name="message"]');
      
      // Validate form
      if (!emailInput?.value || !messageInput?.value) {
        alert("Please fill in all required fields.");
        return;
      }
      
      // Disable submit button and show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }
      
      // Show user feedback
      const messageEl = contactForm.querySelector("p");
      const originalMessageText = messageEl?.textContent;
      if (messageEl) {
        messageEl.textContent = "Submitting your request...";
        messageEl.style.color = "var(--accent)";
      }
      
      try {
        // Create form data
        const formData = new FormData(contactForm);
        
        // Submit to Formspree
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            "Accept": "application/json"
          }
        });
        
        let data;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch (parseError) {
          // If it's a redirect or HTML response, that's okay
          if (response.ok || response.redirected) {
            data = { ok: true };
          } else {
            throw parseError;
          }
        }
        
        if (response.ok) {
          // Success - Formspree returns { "ok": true } or { "next": "url" }
          if (messageEl) {
            messageEl.textContent = "✓ Thank you! We'll get back to you within one business day.";
            messageEl.style.color = "var(--accent-2)";
            messageEl.style.fontWeight = "600";
          }
          
          // Reset form
          contactForm.reset();
          
          // Close modal after delay
          setTimeout(() => {
            contactModal?.close();
            if (messageEl) {
              messageEl.textContent = originalMessageText || "Drop your email and we'll reply within one business day.";
              messageEl.style.color = "";
              messageEl.style.fontWeight = "";
            }
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Submit";
            }
          }, 3000);
        } else {
          // Formspree returns error details
          throw new Error(data.error || `Submission failed: ${response.status}`);
        }
      } catch (error) {
        // Show error message
        if (messageEl) {
          messageEl.textContent = "Sorry, there was an error. Please try again or email us directly at careers@techprysm.com";
          messageEl.style.color = "#ff6b6b";
          messageEl.style.fontWeight = "600";
        }
        
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit";
        }
        
        // Reset message after delay
        setTimeout(() => {
          if (messageEl) {
            messageEl.textContent = originalMessageText || "Drop your email and we'll reply within one business day.";
            messageEl.style.color = "";
            messageEl.style.fontWeight = "";
          }
        }, 5000);
      }
    }, false); // Use bubble phase
    
    // Also attach button click handler
    if (submitButton) {
      submitButton.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      submitButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, true); // Capture phase
    }
    
    // Mark as attached
    contactForm.dataset.handlerAttached = "true";
  }
  
  // Also set up the contact section form
  const contactSectionForm = document.querySelector('#contact-section-form');
  if (contactSectionForm) {
    contactSectionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactSectionForm);
      const submitButton = contactSectionForm.querySelector('button[type="submit"]');
      const originalText = submitButton?.textContent;
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }
      
      try {
        const response = await fetch(contactSectionForm.action, {
          method: "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          submitButton.textContent = "✓ Submitted!";
          contactSectionForm.reset();
          setTimeout(() => {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = originalText || "Book a Strategy Call";
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error:", error);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || "Book a Strategy Call";
        }
      }
    });
  }

  // Check if form was just submitted
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("submitted") === "true") {
    // Show success message (you can enhance this with a toast notification)
    setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
  }
}

function updateYear() {
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function applyActivityData(element, data) {
  if (!data || !element) return;
  const titleEl = element.querySelector("strong");
  const detailEl = element.querySelector("p");
  const timeEl = element.querySelector(".activity__time");
  const dotEl = element.querySelector(".activity__dot");
  if (titleEl) titleEl.textContent = data.title;
  if (detailEl) detailEl.textContent = data.detail;
  if (timeEl) timeEl.textContent = data.time;
  if (dotEl) dotEl.dataset.tone = data.tone || "violet";
}

function spinActivityFeed() {
  if (!activityFeed) return;
  const items = qsa("li", activityFeed);
  if (!items.length) return;
  const reusedItem = items[0];
  activityFeed.appendChild(reusedItem);
  const nextActivity = state.activities[state.nextActivityIndex];
  state.nextActivityIndex =
    (state.nextActivityIndex + 1) % state.activities.length;
  applyActivityData(reusedItem, nextActivity);
}

function hydrateActivityFeed() {
  if (!activityFeed) return;
  const items = qsa("li", activityFeed);
  items.forEach((item, index) => {
    const data = state.activities[index % state.activities.length];
    applyActivityData(item, data);
  });
  state.nextActivityIndex = items.length % state.activities.length;
}

function initActivityTicker() {
  hydrateActivityFeed();
  setInterval(spinActivityFeed, 5000);
}

function renderCarousel() {
  if (!caseCarousel) return;
  const cards = qsa("article", caseCarousel);
  cards.forEach((card, index) => {
    const order = (index - state.carouselIndex + cards.length) % cards.length;
    card.style.order = order;
    card.style.opacity = order > 2 ? 0.4 : 1;
  });
}

function nextCase() {
  const cards = qsa("article", caseCarousel);
  state.carouselIndex = (state.carouselIndex + 1) % cards.length;
  renderCarousel();
}

function prevCase() {
  const cards = qsa("article", caseCarousel);
  state.carouselIndex =
    (state.carouselIndex - 1 + cards.length) % cards.length;
  renderCarousel();
}

function initCarousel() {
  if (!caseCarousel) return;
  caseNext?.addEventListener("click", nextCase);
  casePrev?.addEventListener("click", prevCase);
  renderCarousel();
}

function init() {
  menuToggle?.addEventListener("click", toggleNav);
  headerNav?.addEventListener("click", closeNavOnLinkClick);
  initModal();
  updateYear();
  initActivityTicker();
  initCarousel();
}

// Global click listener to prevent default form submission
document.addEventListener("click", (e) => {
  const button = e.target.matches('button[type="submit"]') ? e.target : e.target.closest('button[type="submit"]');
  
  if (button) {
    // Find the form
    let form = button.closest('form');
    
    if (!form) {
      form = document.getElementById('contact-form');
    }
    
    // Check if it's either the modal form or the contact section form
    const isContactForm = form && (
      form.id === 'contact-form' || 
      form.id === 'contact-section-form' ||
      form.classList.contains('contact__form') ||
      form.classList.contains('contact-modal')
    );
    
    if (isContactForm) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Manually trigger our form handler
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
      return false;
    }
  }
}, true);

document.addEventListener("DOMContentLoaded", init);

