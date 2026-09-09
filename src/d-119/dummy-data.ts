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

export const cityTime = [
    {city:"Hyderabad", time:"4:00 pm"},
    {city:"London", time:"12:00 pm"},
    {city:"Delhi", time:"8:00 am"},
    {city:"Kolkata", time:"6:00 pm"},
    {city:"Washington", time:"1:00 pm"},
    {city:"Las vegas", time:"3:00 am"},
    {city:"San Francisco", time:"12:00 am"},
    {city:"Arizona", time:"9:00 pm"}, 
    {city:"Texas", time:"10:00 pm"}, 
    {city:"Singapore", time:"5:00 am"}, 
    {city:"Shanghai", time:"2:00 am"},  
]

type ExchangeData = {
    base:string;
    rates: Record<string, number> // This tells TS: any string key -> returns a number
}

export const exchangeRates: ExchangeData = {
    base: "USD",
    rates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
    JPY: 151.45,
    AUD: 1.52
  }
}


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

export function getCityTime(city:string):string{
    const targetCity = city.trim().toLowerCase()

    const cityexists = cityTime.find((item)=>(
        item.city.toLowerCase() ===  targetCity
    ))

    if(cityexists){
        return cityexists.time
    }

    return `The time data for this ${city} doesnt exist`
}

export function convertCurrency(amount:number, from:string, to:string):string{

    const fromCurrency = from.trim().toUpperCase()
    const toCurrency = to.trim().toUpperCase()

    const fromRate = exchangeRates.rates[fromCurrency]
    const toRate = exchangeRates.rates[toCurrency]

    if(!fromRate || !toRate){
        return `Error: One or both of the currencies (${fromCurrency},${toCurrency}) are not supported in our database`
    }

    const convertedAmount = (amount / fromRate) * toRate;
    
    return `${amount} ${fromCurrency} is equal to ${convertedAmount.toFixed(2)} ${toCurrency}`
}