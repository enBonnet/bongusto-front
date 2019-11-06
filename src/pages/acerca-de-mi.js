import React from "react"
import { graphql } from "gatsby"
import ReactMarkdown from "react-markdown"

import Layout from "../components/layout"
import SEO from "../components/seo"
import BigCard from "../components/bigCard"
import "../styles/acerca-de-mi.scss"

const AboutMe = ({ data }) => {
  return (
    <Layout>
      <SEO title="Acerca de mi" />
      <BigCard className="about-me">
        <div className="photo">
          <img
            src={data.strapiAcerca.photo.publicURL}
            alt="foto de perfil"
            className="img"
          />
        </div>
        <div className="content">
          <div className="bio">
            <div className="title">Biografia</div>
            <p className="text">
              <ReactMarkdown source={data.strapiAcerca.biografia} />
            </p>
          </div>
          <div className="courses">
            <div className="title">Cursos</div>
            <p className="text">
              <ReactMarkdown source={data.strapiAcerca.cursos} />
            </p>
          </div>
        </div>
      </BigCard>
    </Layout>
  )
}
export default AboutMe

export const query = graphql`
  query AboutMe {
    strapiAcerca(strapiId: { eq: 1 }) {
      biografia
      cursos
      photo {
        publicURL
      }
    }
  }
`
