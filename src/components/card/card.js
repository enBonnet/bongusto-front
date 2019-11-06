import React from "react"
import { Link } from "gatsby"

import "./card.scss"

export const Card = ({ receta }) => {
  return (
    <Link to="/receta" className="card link">
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
