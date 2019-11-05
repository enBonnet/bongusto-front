import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"
import styled from "styled-components"

import "./header.scss"

export const Header = ({ siteTitle }) => {
  return (
    <header className="header">
      <Wrapper className="nav">
        <div className="logo">
          <Link className="link" to="/">
            {siteTitle}
          </Link>
        </div>
        <div className="menu">
          <Link to="/acerca-de-mi" className="link">
            Acerca de mi
          </Link>
        </div>
      </Wrapper>
    </header>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

const Wrapper = styled.nav`
  .menu {
    display: none;
  }
  @media only screen and (min-width: 768px) {
    .menu {
      display: block;
    }
  }
`
