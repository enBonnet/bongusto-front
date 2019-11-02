import React from "react"

import "./footer.scss"

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="mobile">
        <div className="option">
          <a href="#cursos" className="link">
            Cursos
          </a>
        </div>
        <div className="option">
          <a href="#cursos" className="link">
            Acerca de mi
          </a>
        </div>
      </div>
    </footer>
  )
}
