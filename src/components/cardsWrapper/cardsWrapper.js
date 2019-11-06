import React from "react"

import Card from "../card"
import "./cardsWrapper.scss"

export const CardsWrapper = () => {
  return (
    <div className="cards-wrapper">
      <div className="title">
        <h1>Recetas</h1>
      </div>
      <div className="cards">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  )
}
