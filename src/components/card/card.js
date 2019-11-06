import React from "react"
import { Link } from "gatsby"

import { slugify } from "../../utils/slugify"
import "./card.scss"

export const Card = ({ receta }) => {
  return (
    <Link
      to={`/receta/${receta.strapiId}/${slugify(receta.titulo)}`}
      className="card link"
    >
      <article className="">
        <div className="photo">
          <img src={receta.photo.publicURL} alt="foto de plato" />
        </div>
        <div className="title">{receta.titulo}</div>
        <div className="description">{receta.descripcion}</div>
      </article>
    </Link>
  )
}
