import dayjs from "dayjs";

export function generateDatesFromYearBeginning(){
    const firstDayOfTheYear = dayjs().startOf('year')
    const today = new Date()

    const dates = []
    let compereDate = firstDayOfTheYear

    while(compereDate.isBefore(today)){
        dates.push(compereDate.toDate())
        compereDate = compereDate.add(1, 'day')
    }

    return dates
}