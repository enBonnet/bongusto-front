import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import useIsMobile from "../../hooks/useIsMobile"
import "./header.scss"

export const Header = ({ siteTitle }) => {
  const { isMobile } = useIsMobile()

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Link className="link" to="/">
            {siteTitle}
          </Link>
        </div>
        {isMobile ? null : (
          <div className="menu">
            <Link to="/acerca-de-mi" className="link">
              Acerca de mi
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}
