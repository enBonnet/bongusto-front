import React from "react"

import "./footer.scss"

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="mobile">
        <div className="option">
          <a href="#pan" className="link">
            Panaderia
          </a>
        </div>
        <div className="option">
          <a href="#reposteria" className="link">
            Reposteria
          </a>
        </div>
        <div className="option">
          <a href="#cursos" className="link">
            Cursos
          </a>
        </div>
      </div>
    </footer>
  )
}
