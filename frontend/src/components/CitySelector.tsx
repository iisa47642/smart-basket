import { useAppContext } from '../App'

export default function CitySelector() {
  const { cities, selectedCity, setSelectedCity } = useAppContext()

  return (
    <select
      value={selectedCity?.id ?? ''}
      onChange={e => {
        const city = cities.find(c => c.id === Number(e.target.value))
        if (city) setSelectedCity(city)
      }}
      className="bg-[#334155] text-white border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
    >
      {cities.map(city => (
        <option key={city.id} value={city.id}>
          {city.name}
        </option>
      ))}
    </select>
  )
}
