import React from "react"

import "./card.scss"

export const Card = () => {
  return (
    <article className="card">
      <a href="#" className="link">
        <div className="photo">
          <img
            src="https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
            alt="foto de plato"
          />
        </div>
        <div className="title">Lorem ipsum dolor sit amet.</div>
        <div className="description">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cum tenetur
          excepturi adipisci odit voluptas tempore temporibus pariatur dolorum
          repudiandae harum?
        </div>
      </a>
    </article>
  )
}
