export const cityWeather = [
    {city:"Hyderabad", weather:"sunny"},
    {city:"London", weather:"cloudy"},
    {city:"Delhi", weather:"sunny"},
    {city:"Kolkata", weather:"rainy"},
    {city:"Washington", weather:"windy"},
    {city:"Las vegas", weather:"thunderstorm"},
    {city:"San Francisco", weather:"cloudy"},
    {city:"Dubai", weather:"sand storms"},  
]

export function getCityWeather(city:string):string{
    const targetCity = city.trim().toLowerCase()

    const cityexists = cityWeather.find((item)=>(
        item.city.toLowerCase() === targetCity
    ))

    if (cityexists){
        return cityexists.weather;
    }

    return `The weather data for this ${targetCity} city doesnt exist`
}

