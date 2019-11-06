import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import BigCard from "../components/bigCard"
import "../styles/receta.scss"

const Receta = ({ data }) => {
  return (
    <Layout>
      <SEO title={data.strapiReceta.title} />
      <BigCard className="receta">
        <div className="title">{data.strapiReceta.title}</div>
        <div className="photo">
          <img
            src={data.strapiReceta.photo.publicURL}
            alt="Foto de la receta"
            className="img"
          />
        </div>
        <div className="content">
          <div className="history">
            <div className="title">Historia</div>
            <div className="text">{data.strapiReceta.historia}</div>
          </div>
          <div className="ingredients">
            <div className="title">Ingredientes</div>
            <div className="text">{data.strapiReceta.ingredients}</div>
          </div>
          <div className="preparation">
            <div className="title">Preparación</div>
            <div className="text">{data.strapiReceta.preparacion}</div>
          </div>
        </div>
      </BigCard>
    </Layout>
  )
}

export default Receta

export const query = graphql`
  query RecetaTemplate($id: Int!) {
    strapiReceta(strapiId: { eq: $id }) {
      titulo
      photo {
        publicURL
      }
      historia
      ingredientes
      preparacion
    }
  }
`
