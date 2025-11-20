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

const contactForm = qs("#contact-form");
const closeModalButtons = qsa("[data-close-modal]");

function openModal() {
  contactModal?.showModal();
}

function closeModal() {
  contactModal?.close();
}

function initModal() {
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

document.addEventListener("DOMContentLoaded", init);

