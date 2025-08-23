import { useEffect, useState } from 'react'

function App() {
  
  const [count, setCount] = useState(0)
  const handleAdd = () =>{
    setCount(prev => prev+1)
  }
  useEffect(()=>{
    // Este es el prefijo para consumir algun enpoint - mirenlo por la consola.
    const urlbackend = import.meta.env?.VITE_API_BASE_URL
    console.log(urlbackend)
  },[])

  return (
    <>
      <div className='min-h-screen flex items-center justify-center flex-col gap-6 bg-pnp-green text-white'>
        <div className='text-4xl font-bold '>MESA DE PARTES PNP</div>
        <div className='flex items-center justify-center gap-8'>
          <button className='px-4 py-1 rounded-3xl bg-pnp-gold text-gray text-2xl' onClick={handleAdd}>Agregar</button>
          <p>{count}</p>
        </div>
      </div>
    </>
  )
}

export default App
