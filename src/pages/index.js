import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import CardsWrapper from "../components/cardsWrapper"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="BonGusto" />
    <CardsWrapper recetas={data.allStrapiReceta.edges} />
  </Layout>
)

export default IndexPage

export const query = graphql`
  query Index {
    allStrapiReceta(sort: { order: ASC, fields: strapiId }) {
      edges {
        node {
          strapiId
          photo {
            publicURL
          }
          titulo
          descripcion
          publico
        }
      }
    }
  }
`
