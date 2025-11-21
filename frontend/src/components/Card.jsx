import React from 'react'

export default function Card({title, children, onClick}){
  return (
    <div className="bg-white p-4 rounded shadow" onClick={onClick}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  )
}
