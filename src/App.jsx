import axios from 'axios'
import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [value, setValue] = useState()
  const [pokemon, setPokemon] = useState('')
  const [allPokemon, setAllPokemon] = useState([])
  const [pageData, setPageData] = useState([])
  const [loadingPage, setLoadingPage] = useState(false)
  const [page, setPage] = useState(1)

  const limit = 20

  async function fetchPokemon(name) {
    const p = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${name}`
    )

    const s = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${name}`
    )

    const description = s.data.flavor_text_entries.find(
      x => x.language.name === 'en'
    )

    setValue({
      ...p.data,
      description: description?.flavor_text.replace(/\n|\f/g, ' ')
    })

    setPokemon(p.data.name)
  }

  function buttonHandler() {
    if (pokemon) fetchPokemon(pokemon)
  }

  function handleInputChange(event) {
    setPokemon(event.target.value)
  }

  useEffect(() => {
    axios
      .get('https://pokeapi.co/api/v2/pokemon?limit=2000')
      .then(res => setAllPokemon(res.data.results))
  }, [])

  const start = (page - 1) * limit
  const pageSlice = allPokemon.slice(start, start + limit)

  useEffect(() => {
    if (pageSlice.length === 0) return

    let cancelled = false
    setLoadingPage(true)

    Promise.all(
      pageSlice.map((p, i) => {
        const id = start + i + 1
        return axios
          .get(`https://pokeapi.co/api/v2/pokemon/${id}`)
          .then(res => ({
            id,
            name: res.data.name,
            types: res.data.types.map(t => t.type.name)
          }))
      })
    ).then(results => {
      if (!cancelled) {
        setPageData(results)
        setLoadingPage(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [page, allPokemon])

  return (
    <div className="pokedex">

      <header>
        <h1>POKÉDEX</h1>
      </header>

      <div className="search">
        <input
          value={pokemon}
          onChange={handleInputChange}
          placeholder="Search Pokémon..."
        />
        <button onClick={buttonHandler}>
          SEARCH
        </button>
      </div>

      {value && (
        <div className="pokemon-display">
          <h2>
            #{String(value.id).padStart(3, '0')} {value.name}
          </h2>

          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${value.id}.png`}
            alt={value.name}
          />

          <div className="types">
            {value.types.map(t => (
              <span
                className={`type ${t.type.name}`}
                key={t.type.name}
              >
                {t.type.name}
              </span>
            ))}
          </div>

          <p>{value.description}</p>
        </div>
      )}

      <h2 className="title">ALL POKÉMON</h2>

      <div className="grid">
        {loadingPage && pageData.length === 0 && <p>Loading…</p>}

        {pageData.map(p => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            types={p.types}
            onClick={() => fetchPokemon(p.id)}
          />
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ◀
        </button>

        <span>Page {page}</span>

        <button
          disabled={start + limit >= allPokemon.length}
          onClick={() => setPage(page + 1)}
        >
          ▶
        </button>
      </div>

    </div>
  )
}

function PokemonCard({ id, name, types, onClick }) {
  return (
    <div className="card" onClick={onClick}>

      <span>#{String(id).padStart(3, '0')}</span>

      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
        alt={name}
      />

      <h3>{name}</h3>

      <div>
        {types.map(t => (
          <span
            className={`type small ${t}`}
            key={t}
          >
            {t}
          </span>
        ))}
      </div>

    </div>
  )
}

export default App