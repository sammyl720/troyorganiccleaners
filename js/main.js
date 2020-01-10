const burger = document.getElementById('burger');
let mobileNav = document.getElementById('mobile-nav');
const mobileLinks = document.querySelectorAll('.menu > .nav-link')

burger.addEventListener('click', ()=> {
  // console.log(mobileNav)
  if (burger.dataset.open === 'true') {
    burger.dataset.open = 'false'
    hideMobileNav()
  } else {
    burger.dataset.open = 'true'
    mobileNav.style.transform = 'translateX(0%)'

  }
})
// console.log(mobileLinks)
for (let i = 0; i < mobileLinks.length; i++) {
  mobileLinks[i].addEventListener('click', () => {
    hideMobileNav()
  })
}

const hideMobileNav = () => {
  burger.dataset.open = 'false'

  mobileNav.style.transform = 'translateX(-105%)'
}

const dataAnalyst = () => {
  fetch("https://guarded-dawn-95949.herokuapp.com")
}

const upBtn = document.querySelector('.up')
const toggleUpBtn = () => {
  if (document.documentElement.scrollTop < window.innerHeight - 300 ||document.documentElement.scrollTop < screen.height - 300 ) {
    upBtn.style.opacity = 0
    upBtn.style.pointerEvents = 'none'

  } else {
    upBtn.style.opacity = 1
    upBtn.style.pointerEvents = 'auto'
  }
}

window.addEventListener('load', (event) => {
  dataAnalyst()
  window.onscroll = toggleUpBtn
  upBtn.addEventListener('click', _ => {
    window.scrollTo(0, 0)
  })
})
