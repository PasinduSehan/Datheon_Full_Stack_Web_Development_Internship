// 1. Dark / Light Theme Toggle with localStorage
const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('i');

const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('portfolio-theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'fas fa-sun';
  } else {
    themeIcon.className = 'fas fa-moon';
  }
}

// 2. Mobile Hamburger Menu Toggle
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-item');

hamburgerBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// 3. Project Modal Data & Logic
const projectsData = [
  {
    badge: "Task 01 · Featured",
    title: "Personal Developer Portfolio Website",
    description: "A responsive, modern developer portfolio designed with semantic HTML5, CSS Grid/Flexbox, and Vanilla JavaScript to showcase technical skills and internship milestones.",
    features: [
      "Mobile-first responsive layout with collapsible hamburger menu",
      "Persistent Dark & Light theme switcher using localStorage",
      "Interactive project preview modals and smooth section scrolling"
    ],
    tech: ["HTML5", "CSS3", "JavaScript (ES6+)", "GitHub Pages"],
    github: "https://github.com/PasinduSehan/Datheon_Full_Stack_Web_Development_Internship"
  },
  {
    badge: "Task 02 · Productivity",
    title: "Dynamic Task Manager & Productivity Tracker",
    description: "A zero-dependency task management web app built with Vanilla JavaScript supporting full CRUD operations and instant state persistence.",
    features: [
      "Create, edit, delete, and mark tasks as completed",
      "Organize tasks by category (Work, Personal, Study) and due dates",
      "Filter tasks by status (All, Active, Completed) with localStorage sync"
    ],
    tech: ["JavaScript (ES6+)", "DOM API", "localStorage", "CSS Transitions"],
    github: "https://github.com/PasinduSehan/Datheon_Full_Stack_Web_Development_Internship"
  },
  {
    badge: "Task 04 · E-Commerce",
    title: "E-Commerce Product Catalog & Shopping Cart",
    description: "An interactive storefront consuming live product data from FakeStoreAPI with category filtering and a slide-out cart drawer.",
    features: [
      "Asynchronous product fetching and live search/category filters",
      "Slide-out cart drawer with item quantity increment/decrement",
      "Automated subtotal, tax, and shipping cost calculations"
    ],
    tech: ["Fetch API", "Async/Await", "FakeStoreAPI", "CSS Grid"],
    github: "https://github.com/PasinduSehan/Datheon_Full_Stack_Web_Development_Internship"
  }
];

const modal = document.getElementById('projectModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const openModalBtns = document.querySelectorAll('.open-modal-btn');

openModalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const projectIndex = btn.getAttribute('data-project');
    const project = projectsData[projectIndex];

    document.getElementById('modalBadge').textContent = project.badge;
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    document.getElementById('modalGithubLink').href = project.github;

    // Populate features list
    const featuresList = document.getElementById('modalFeaturesList');
    featuresList.innerHTML = project.features.map(f => `<li>${f}</li>`).join('');

    // Populate tech tags
    const techContainer = document.getElementById('modalTech');
    techContainer.innerHTML = project.tech.map(t => `<span>${t}</span>`).join('');

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  });
});

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}