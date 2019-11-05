import React from "react"
import { Link } from "gatsby"

import "./footer.scss"
import useIsMobile from "../../hooks/useIsMobile"

export const Footer = () => {
  const { isMobile } = useIsMobile()

  return (
    <footer className="footer">
      {isMobile ? (
        <div className="mobile">
          <div className="option">
            <Link to="/acerca-de-mi" className="link">
              Acerca de mi
            </Link>
          </div>
        </div>
      ) : null}
    </footer>
  )
}
