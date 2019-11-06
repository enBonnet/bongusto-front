import React from "react"

import "./bigCard.scss"

export const BigCard = ({ children, className }) => {
  return <div className={`big-card ${className}`}>{children}</div>
}
