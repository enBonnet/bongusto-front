import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import "./header.scss"

export const Header = ({ siteTitle }) => (
  <header className="header">
    <nav className="mobile">
      <div>
        <Link className="link" to="/">
          {siteTitle}
        </Link>
      </div>
    </nav>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}
