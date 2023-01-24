import { prisma } from "./lib/prisma"
import { FastifyInstance } from "fastify"
import { z } from "zod"
import dayjs from "dayjs"

export async function appRoutes(app:FastifyInstance){
    app.post('/habits', async (request)=> {

        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(z.number().min(0).max(6))
        })

        const { title, weekDays } = createHabitBody.parse(request.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay
                        }
                    })
                }
            }
        })

    })

    app.get('/day', async (request) => {
        const getDayParams = z.object({
          date: z.coerce.date()
        })

        const { date } = getDayParams.parse(request.query)

        const parseDate = dayjs(date).startOf('day')
        const weekDay = parseDate.get('day')

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at:  {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })
       
        const day = await prisma.day.findUnique({
            where: {
                date: parseDate.toDate(),
            },
            include: {
                DayHabits: true
            }
        })

        const completedHabits = day?.DayHabits.map(dayHabit => {
            return dayHabit.habits_id
        }) ?? []

        return {
            possibleHabits,
            completedHabits
        }
    })

    app.patch('/habits/:id/toggle', async (request) => {

        const toggleHabitsParams = z.object({
            id: z.string().uuid()
        })

        const { id } = toggleHabitsParams.parse(request.params)

        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where: {
                date: today
            }
        })

        if(!day){
            day = await prisma.day.create({
                data: {
                    date: today
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habits_id: {
                    day_id: day.id,
                    habits_id: id
                }
            }
        })


        if(dayHabit){
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id
                }
            })
        }else {
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habits_id: id
                }
            })
        }


        
    })

    app.get('/summary', async (request) => {
         const summary = await prisma.$queryRaw`
            SELECT D.id, D.date,
            (
                SELECT 
                 cast(count(*) as float)
                FROM days_habits DH
                WHERE DH.day_id = D.id
            ) as completed,
            (
                SELECT  
                  cast(count(*) as float)
                FROM habits_week_days HWD
                JOIN habits H
                 ON H.id = HWD.habit_id
                WHERE 
                  HWD.week_day = cast(strftime('%w', D.date/1000.0,'unixepoch') as int)
                  AND H.created_at <= D.date
            ) as amount
            
            FROM days D
         `

         return summary
    })

    
}

