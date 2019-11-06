import React from "react"

import Card from "../card"
import "./cardsWrapper.scss"

export const CardsWrapper = ({ recetas }) => {
  const recetas_public = recetas.filter(receta => receta.node.publico)

  return (
    <div className="cards-wrapper">
      <div className="title">
        <h1>Recetas</h1>
      </div>
      <div className="cards">
        {recetas_public.length >= 0 ? (
          recetas_public.map((receta, index) => (
            <Card receta={receta.node} key={index} />
          ))
        ) : (
          <p>Aún no hay recetas cargadas</p>
        )}
      </div>
    </div>
  )
}
