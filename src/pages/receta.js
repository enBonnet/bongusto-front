import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import BigCard from "../components/bigCard"
import "../styles/receta.scss"

const Receta = ({ title = "" }) => (
  <Layout>
    <SEO title={title} />
    <BigCard className="receta">
      <div className="title">Titulo</div>
      <div className="photo">
        <img
          src="https://images.pexels.com/photos/35666/cooking-baby-only-kitchen.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          alt="foto de perfil"
          className="img"
        />
      </div>
      <div className="content">
        <div className="history">
          <div className="title">Historia</div>
          <p className="text">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vitae ex
            tempore assumenda blanditiis neque velit voluptatibus iste vero
            deserunt debitis, eveniet maxime ut quam perspiciatis omnis. Veniam,
            reprehenderit! Blanditiis, sapiente labore. Recusandae eos atque
            similique eveniet unde laboriosam, accusamus sit, ullam ipsum sed
            facere. Blanditiis sint quas atque? Quidem quis minima nobis eius
            porro dolorum in minus earum accusantium explicabo voluptatibus,
            beatae ipsum illum maxime consequatur quam dolores, distinctio
            tempora? Sequi similique cumque autem possimus aspernatur molestiae
            eos deserunt voluptatem ipsam eius dolor, laudantium ut veniam
            perspiciatis aut recusandae consequatur laborum est, eum iste!
            Exercitationem quasi nulla deserunt ipsum tempora.
          </p>
        </div>
        <div className="ingredients">
          <div className="title">Ingredientes</div>
          <p className="text">
            <lu>
              <li>Item</li>
              <li>Item</li>
              <li>Item</li>
              <li>Item</li>
              <li>Item</li>
              <li>Item</li>
            </lu>
          </p>
        </div>
        <div className="preparation">
          <div className="title">Preparación</div>
          <p className="text">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vitae ex
            tempore assumenda blanditiis neque velit voluptatibus iste vero
            deserunt debitis, eveniet maxime ut quam perspiciatis omnis. Veniam,
            reprehenderit! Blanditiis, sapiente labore. Recusandae eos atque
            similique eveniet unde laboriosam, accusamus sit, ullam ipsum sed
            facere. Blanditiis sint quas atque? Quidem quis minima nobis eius
            porro dolorum in minus earum accusantium explicabo voluptatibus,
            beatae ipsum illum maxime consequatur quam dolores, distinctio
            tempora? Sequi similique cumque autem possimus aspernatur molestiae
            eos deserunt voluptatem ipsam eius dolor, laudantium ut veniam
            perspiciatis aut recusandae consequatur laborum est, eum iste!
            Exercitationem quasi nulla deserunt ipsum tempora.
          </p>
        </div>
      </div>
    </BigCard>
  </Layout>
)

export default Receta
