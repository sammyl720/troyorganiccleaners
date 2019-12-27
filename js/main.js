const burger = document.getElementById('burger');
let mobileNav = document.getElementById('mobile-nav');

let menuVisible = false;
burger.addEventListener('click', ()=> {
  // console.log(mobileNav)
  if(burger.dataset.open === 'true'){

    burger.dataset.open = 'false'
    mobileNav.style.transform = 'translateX(-105%)'
  }else{
    burger.dataset.open = 'true'
    mobileNav.style.transform = 'translateX(0%)'
    
  }
  
})