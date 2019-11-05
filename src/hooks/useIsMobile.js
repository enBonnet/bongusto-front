import { useState, useEffect } from "react"
import useWindowDimensions from "./useWindowDimensions"

const useIsMobile = () => {
  const { width } = useWindowDimensions()
  const [isMobile, setMobile] = useState(
    window.innerHeight >= 900 ? false : true
  )

  useEffect(() => {
    if (width >= 900) {
      setMobile(false)
    } else {
      setMobile(true)
    }
  }, [width])

  return { isMobile }
}

export default useIsMobile
