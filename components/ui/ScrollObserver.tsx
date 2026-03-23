'use client'
import { useEffect } from 'react'

export default function ScrollObserver() {
  useEffect(() => {
    const elements = document.querySelectorAll('.section-fade, .stagger')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
