import React from "react"
import { graphql, Link } from "gatsby"
import ReactMarkdown from "react-markdown"

import Layout from "../components/layout"
import SEO from "../components/seo"
import BigCard from "../components/bigCard"
import "../styles/receta.scss"

const Receta = ({ data }) => {
  return (
    <Layout>
      <SEO title={data.strapiReceta.titulo} />
      <BigCard className="receta">
        <div className="title">{data.strapiReceta.titulo}</div>
        <div className="photo">
          <img
            src={data.strapiReceta.photo.publicURL}
            alt="Foto de la receta"
            className="img"
          />
        </div>
        <div className="content">
          {data.strapiReceta.historia ? (
            <div className="history">
              <div className="title">Historia</div>
              <div className="text">
                <ReactMarkdown source={data.strapiReceta.historia} />
              </div>
            </div>
          ) : null}
          {data.strapiReceta.ingredientes ? (
            <div className="ingredients">
              <div className="title">Ingredientes</div>
              <div className="text">
                <ReactMarkdown source={data.strapiReceta.ingredientes} />
              </div>
            </div>
          ) : null}
          {data.strapiReceta.preparacion ? (
            <div className="preparation">
              <div className="title">Preparación</div>
              <div className="text">
                <ReactMarkdown source={data.strapiReceta.preparacion} />
              </div>
            </div>
          ) : null}
        </div>
        <div className="more">
          <Link to="/" className="link">
            Ver más recetas
          </Link>
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
