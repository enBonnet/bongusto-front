const path = require(`path`)
const { slugify } = require("./src/utils/slugify")

const makeRequest = (graphql, request) =>
  new Promise((resolve, reject) => {
    // Query for nodes to use in creating pages.
    resolve(
      graphql(request).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        return result
      })
    )
  })

// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  const getArticles = makeRequest(
    graphql,
    `
    {
      allStrapiReceta(sort: {order: ASC, fields: strapiId}) {
        edges {
          node {
            strapiId
            titulo
          }
        }
      }
    }
    `
  ).then(result => {
    // Create pages for each receta.
    console.info("🍔 Creando recetas")
    result.data.allStrapiArticle.edges.forEach(({ node }) => {
      console.info(`${node.strapiId} - ${node.titulo}`)
      createPage({
        path: `receta/${node.strapiId}/${slugify(node.titulo)}`,
        component: path.resolve(`src/templates/receta.js`),
        context: {
          id: node.strapiId,
          titulo: node.titulo,
        },
      })
    })
  })

  // Query for articles nodes to use in creating pages.
  return getArticles
}
