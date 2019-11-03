import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const AboutMe = () => (
  <Layout>
    <SEO title="Acerca de mi" />
    <div className="big-card">
      <div className="photo">
        <img
          src="https://images.pexels.com/photos/35666/cooking-baby-only-kitchen.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          alt="foto de perfil"
          className="img"
        />
      </div>
      <div className="content">
        <div className="bio">
          <div className="title">Biografia</div>
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
        <div className="courses">
          <div className="title">Cursos</div>
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
    </div>
  </Layout>
)

export default AboutMe
