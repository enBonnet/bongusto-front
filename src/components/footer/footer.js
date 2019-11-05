import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

import "./footer.scss"

export const Footer = () => {
  return (
    <Wrapper className="footer">
      <div className="mobile">
        <div className="option">
          <Link to="/acerca-de-mi" className="link">
            Acerca de mi
          </Link>
        </div>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.footer`
  @media only screen and (min-width: 768px) {
    .mobile {
      display: none;
    }
  }
`
