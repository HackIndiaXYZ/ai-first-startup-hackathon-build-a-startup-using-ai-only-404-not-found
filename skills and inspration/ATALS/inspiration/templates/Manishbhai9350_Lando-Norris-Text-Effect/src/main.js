import gsap from 'gsap'
import './style.css'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

function AddContent(element){
  const content = element.getAttribute('content')
  const h1 = document.createElement('h1')
  h1.innerHTML = content;
  const h12 = h1.cloneNode()
  h12.innerHTML = h1.innerHTML
  h1.classList.add('h1-1')
  h12.classList.add('h1-2')
  element.appendChild(h1)
  element.appendChild(h12)
  const h1chars = new SplitText(h1,{
    type:'chars',
    charsClass:'h1-char'
  })
  const h2chars = new SplitText(h12,{
    type:'chars',
    charsClass:'h12-char'
  })
  return [h1chars.chars,h2chars.chars,h1,h12]
}

window.addEventListener('DOMContentLoaded',() => {

  const hovers = gsap.utils.toArray('.hover')

  hovers.forEach(hover => {
    const [chars1,chars2,h1,h12] = AddContent(hover)
    hover.addEventListener('mouseenter',e => {
      gsap.killTweensOf([chars1,chars2])
      gsap.to([h1,h12],{
        color:'#B2C73A',
        ease:"power2",
      })
      gsap.to(chars1,{
        yPercent:-100,
        ease:"power2",
        stagger:.017,
        duration:.3
      })
      gsap.to(chars2,{
        yPercent:-100,
        ease:"power2",
        stagger:.017,
        duration:.3
      })
    })
    hover.addEventListener('mouseleave',e => {
      gsap.killTweensOf([chars1,chars2])
      gsap.to([h1,h12],{
        color:'#DDE1D2',
        ease:"power2",
      })
      gsap.to(chars1,{
        yPercent:0,
        ease:"power2",
        stagger:.017,
        duration:.3
      })
      gsap.to(chars2,{
        yPercent:0,
        ease:"power2",
        stagger:.017,
        duration:.3
      })
    })
  })

})