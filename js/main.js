const CONTENT_URL = './content/site.json'

const burger = document.getElementById('burger')
const mobileNav = document.getElementById('mobile-nav')
const mobileLinks = document.querySelectorAll('.menu > .nav-link')
const mobileNavDismissTargets = document.querySelectorAll('main, section, footer')

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const setMobileNavOpen = (isOpen) => {
  burger.dataset.open = isOpen ? 'true' : 'false'
  burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
  burger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu')
  mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true')
  mobileNav.style.transform = isOpen ? 'translateX(0%)' : 'translateX(-105%)'
}

const hideMobileNav = () => setMobileNavOpen(false)

const setupNavigation = () => {
  burger.addEventListener('click', () => {
    setMobileNavOpen(burger.dataset.open !== 'true')
  })

  for (let i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', hideMobileNav)
  }

  for (let i = 0; i < mobileNavDismissTargets.length; i++) {
    mobileNavDismissTargets[i].addEventListener('click', hideMobileNav)
  }
}

const setupScrollUp = () => {
  const upBtn = document.querySelector('.up')

  if (!upBtn) {
    return
  }

  const toggleUpBtn = () => {
    if (
      document.documentElement.scrollTop < window.innerHeight - 300 ||
      document.documentElement.scrollTop < screen.height - 300
    ) {
      upBtn.style.opacity = 0
      upBtn.style.pointerEvents = 'none'
    } else {
      upBtn.style.opacity = 1
      upBtn.style.pointerEvents = 'auto'
    }
  }

  window.onscroll = toggleUpBtn
  upBtn.addEventListener('click', () => {
    window.scrollTo(0, 0)
  })
  toggleUpBtn()
}

const setMetaContent = (selector, value) => {
  const el = document.querySelector(selector)
  if (el && value) {
    el.setAttribute('content', value)
  }
}

const setLinkHref = (selector, value) => {
  const el = document.querySelector(selector)
  if (el && value) {
    el.setAttribute('href', value)
  }
}

const setTextAll = (selector, value) => {
  const nodes = document.querySelectorAll(selector)
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].textContent = value
  }
}

const loadContent = async () => {
  const response = await fetch(CONTENT_URL, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Failed to load content: ${response.status}`)
  }

  return response.json()
}

const renderHero = (content) => {
  const hero = document.getElementById('hero')

  if (!hero) return

  hero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
      <h1 id="hero-title">${escapeHtml(content.hero.title)}</h1>
      <p class="hero-summary">${escapeHtml(content.hero.summary)}</p>
      <div class="hero-actions">
        ${content.hero.actions
          .map((action) => `
            <a
              href="${escapeHtml(action.href)}"
              class="button button-${escapeHtml(action.variant)}"
            >${escapeHtml(action.label)}</a>
          `)
          .join('')}
      </div>
    </div>
    <aside class="hours-card" aria-labelledby="hours-title">
      <h2 id="hours-title">${escapeHtml(content.hours.title)}</h2>
      ${content.hours.items
        .map(
          (item) => `
            <div class="dayofweek${item.closed ? ' dayofweek-closed' : ''}">
              <span>${escapeHtml(item.day)}</span>
              <span>${escapeHtml(item.hours)}</span>
            </div>
          `
        )
        .join('')}
    </aside>
  `
}

const renderServices = (content) => {
  const section = document.getElementById('services')

  if (!section) return

  section.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(content.services.eyebrow)}</p>
      <h2 id="services-title">${escapeHtml(content.services.title)}</h2>
    </div>
    ${content.services.items
      .map(
        (item) => `
          <div class="service-card">
            <i class="fas ${escapeHtml(item.icon)} service-icon" aria-hidden="true"></i>
            <h3 class="service-title">${escapeHtml(item.title)}</h3>
            <p class="service-description">${escapeHtml(item.description)}</p>
          </div>
        `
      )
      .join('')}
  `
}

const renderAbout = (content) => {
  const section = document.getElementById('about')

  if (!section) return

  section.innerHTML = `
    <div class="about-panel" aria-label="Troy Organic Cleaners care standards">
      <div class="about-panel-mark" aria-hidden="true"></div>
      <p class="eyebrow">${escapeHtml(content.about.panel.eyebrow)}</p>
      <ul>
        ${content.about.panel.stats
          .map(
            (stat) => `
              <li>
                <span>${escapeHtml(stat.value)}</span>
                ${escapeHtml(stat.label)}
              </li>
            `
          )
          .join('')}
      </ul>
    </div>
    <div class="about-info">
      <p class="eyebrow">${escapeHtml(content.about.eyebrow)}</p>
      <h2 id="about-title">${escapeHtml(content.about.title)}</h2>
      ${content.about.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('')}
      <p class="owner-note">${escapeHtml(content.about.ownerNote)}</p>
      <blockquote>
        <span>${escapeHtml(content.about.quoteLead)}</span>
        "${escapeHtml(content.about.quote)}"
        <cite>${escapeHtml(content.about.cite)}</cite>
      </blockquote>
    </div>
  `
}

const renderLocation = (content) => {
  const section = document.getElementById('location')

  if (!section) return

  section.innerHTML = `
    <div class="location-details">
      <p class="eyebrow">${escapeHtml(content.location.eyebrow)}</p>
      <h2 id="location-title">${escapeHtml(content.location.title)}</h2>
      <address>
        ${content.location.addressLines.map((line) => `<span>${escapeHtml(line)}</span>`).join('')}
        <a href="tel:+17187718769" class="contact-link-phone">${escapeHtml(content.location.phoneDisplay)}</a>
      </address>
      <div class="location-actions">
        <a href="${escapeHtml(content.location.directionsHref)}" target="_blank" rel="noopener noreferrer" class="button button-primary">Get Directions</a>
        <a target="_blank" rel="noopener noreferrer" class="button button-secondary" href="${escapeHtml(content.location.whatsappHref)}">${escapeHtml(content.location.whatsappLabel)}</a>
      </div>
    </div>
    <a id="map" href="${escapeHtml(content.location.directionsHref)}" target="_blank" rel="noopener noreferrer" aria-label="Get directions to Troy Organic Cleaners"></a>
  `
}

const renderContact = (content) => {
  const section = document.getElementById('contact')

  if (!section) return

  const eyebrow = section.querySelector('.section-heading .eyebrow')
  const title = section.querySelector('#contact-title')
  const submit = section.querySelector('.submit-button')

  if (eyebrow) eyebrow.textContent = content.contact.eyebrow
  if (title) title.textContent = content.contact.title
  if (submit) submit.textContent = content.contact.submit

  Object.keys(content.contact.labels).forEach((field) => {
    const label = section.querySelector(`label[for="${field}"]`)
    if (label) label.textContent = content.contact.labels[field]
  })
}

const renderFooter = (content) => {
  const footer = document.getElementById('site-footer')

  if (!footer) return

  footer.innerHTML = `
    <div class="container">
      <div class="follow-us">
        <h4 class="footer-social-title">${escapeHtml(content.footer.socialTitle)}</h4>
        <a href="${escapeHtml(content.footer.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Follow Troy Organic Cleaners on Instagram">
          <i class="fab fa-instagram social-icon social-icon-light social-icon-footer-first"></i>
        </a>
        <a href="${escapeHtml(content.footer.facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Follow Troy Organic Cleaners on Facebook">
          <i class="fab fa-facebook social-icon social-icon-light social-icon-footer"></i>
        </a>
      </div>
      <div class="contact-info">
        <h1 class="visually-hidden">Contact Information</h1>
        <address>
          ${content.footer.addressLines.map((line) => `<span>${escapeHtml(line)}</span>`).join('')}
          <a href="tel:+17187718769" class="contact-link-phone">${escapeHtml(content.footer.phoneLinkDisplay)}</a>
        </address>
      </div>
    </div>
  `
}

const renderNavigation = (content) => {
  setTextAll('.services-link', content.navigation.services)
  setTextAll('.about-link', content.navigation.about)
  setTextAll('.location-link', content.navigation.location)
  setTextAll('.contact-link', content.navigation.contact)
  setTextAll('.nav-cta', content.navigation.call)
}

const renderSeo = (content) => {
  document.title = content.seo.title
  setMetaContent("meta[name='description']", content.seo.description)
  setMetaContent("meta[name='theme-color']", content.seo.themeColor)
  setMetaContent("meta[property='og:title']", content.seo.title)
  setMetaContent("meta[property='og:description']", content.seo.description)
  setMetaContent("meta[property='og:url']", content.seo.canonical)
  setMetaContent("meta[property='og:image']", content.seo.ogImage)
  setMetaContent("meta[name='twitter:title']", content.seo.title)
  setMetaContent("meta[name='twitter:description']", content.seo.description)
  setMetaContent("meta[name='twitter:image']", content.seo.twitterImage)
  setMetaContent("meta[name='keywords']", content.seo.keywords)
  setLinkHref("link[rel='canonical']", content.seo.canonical)

  const schemaData = document.getElementById('schema-data')
  if (schemaData) {
    schemaData.textContent = JSON.stringify(content.schema, null, 2)
  }
}

const renderSite = (content) => {
  renderSeo(content)
  renderNavigation(content)
  renderHero(content)
  renderServices(content)
  renderAbout(content)
  renderLocation(content)
  renderContact(content)
  renderFooter(content)
}

setupNavigation()
setupScrollUp()

loadContent()
  .then(renderSite)
  .catch((error) => {
    console.warn('Site content failed to load; using HTML fallback.', error)
  })
