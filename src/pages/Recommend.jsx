import React from 'react'
import data from "../../public/results.json"

const Recommend = () => {
  return (
    <div>
      <h1>Recommend</h1>
      <div className='flex flex-wrap justify-center'>
        {data.map((data)=>(
            <div className=" w-52 bg-gray-500 m-2 border-2 rounded-md" key={data.id}>
              <h2>{data.title}</h2>
              <p>{data.description}</p>
              <p>{data.link}</p>
              <p>{data.image}</p>
            </div>
        ))}
      </div>
    </div>
  )
}

export default Recommend