import React from 'react'

export default function Card({title, children}){
  return (
    <div className="bg-white p-4 rounded shadow">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  )
}
