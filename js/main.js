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