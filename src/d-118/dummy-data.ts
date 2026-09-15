export const countryCapital = [
    {country:"Japan", capital:"Tokyo"},
    {country:"India", capital:"New Delhi"},
    {country:"Usa", capital:"Washington dc"},
    {country:"Sri Lanka", capital:"Columbo"},
    {country:"China", capital:"Beijing"},
    {country:"Australia", capital:"Canberra"},
    {country:"metaroos", capital:"genna"},
    {country:"cicilina", capital:"tomajen"},
    {country:"brenshire", capital:"niatem"},
]

export const capitalPopulation = [
    {capital:"Tokyo", population:100000},
    {capital:"New Delhi", population:1535000},
    {capital:"Washington dc", population:10000},
    {capital:"Columbo", population:25000},
    {capital:"Beijing", population:1213123},
    {capital:"Canberra", population:65646},
    {capital:"genna", population:534534},
    {capital:"tomajen", population:112233},
    {capital:"niatem", population:776655}
]

export function getCountryCapital(country:string):string{

    const targetCountry = country.trim().toLowerCase()

    const cityexists = countryCapital.find((item)=>(
        item.country.toLowerCase() === targetCountry
    ))
    if(cityexists){
        return cityexists.capital
    }
    throw new Error (`The city for this ${targetCountry} doesnt exist`)
}

export function getCityPopulation(city:string):number{
    const targetCapital = city.trim().toLowerCase()

    const capitalexists = capitalPopulation.find((item)=>(
        item.capital.toLowerCase() === targetCapital
    )) 

    if(capitalexists){
        return capitalexists.population
    }

    throw new Error(`the population data for the city ${targetCapital} doesnt exist`)
}

export function getPopulationDensity(population:number):string{
    if(population <= 10000){
        return "low"
    }

    if(population <=100000){
        return "medium"
    }
        return "high"
}