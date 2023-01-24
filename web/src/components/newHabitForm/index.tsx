import { Check } from "phosphor-react";
import * as Checkbox from '@radix-ui/react-checkbox';
import { FormEvent, useState } from "react";
import { api } from "../../lib/axios";

const isweekDays = [
   'Domingo',
   'Segunda-feira',
   'Terça-feira',
   'Quarta-feira',
   'Quinta-feira',
   'Sexta-feira',
   'Sabado'
]

export function NewHabitForm() {
   const [title, setTitle] = useState("")
   const [weekDays, setWeekDays] = useState<number[]>([])



    function createNewHabit(e: FormEvent) {
      e.preventDefault()

      if (!title && weekDays.length === 0) {
         alert("Preencha o formulario")
         return
      }

       api.post('habits', {
         title,
         weekDays
      }).then(() => {
         setTitle('')
         setWeekDays([])
   
         alert("Habito criado")
      })

     




   }

   function handleToggleWeekDay(weekDay: number) {
      if (weekDays.includes(weekDay)) {
         const weekDaysWithRemovedOne = weekDays.filter(day => day !== weekDay)
         setWeekDays(weekDaysWithRemovedOne)
      } else {
         const newWeekDays = [...weekDays, weekDay]
         setWeekDays(newWeekDays)

      }
   }

   return (
      <form onSubmit={createNewHabit} className="w-full flex flex-col mt-6">
         <label htmlFor="title" className="font-semibold leading-tight">
            Qual seu comprometimento?
         </label>

         <input
            type="text"
            id="title"
            placeholder="Estudar"
            autoFocus
            className="p-4 rounded-r-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:ring-offset-2 focus:ring-offset-zinc-900"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
         />

         <label htmlFor="" className="font-semibold leading-tight mt-4">
            Qual a recorrência?
         </label>

         {isweekDays.map((day, index) => {
            return (
               <div className="flex flex-col gap-2 mt-3">

                  <Checkbox.Root
                     className='flex items-center gap-3 group '
                     key={day}
                     onCheckedChange={() => handleToggleWeekDay(index)}
                     checked={weekDays.includes(index)}
                  >
                     <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500  transition-colors  group-focus:ring-2 group-focus:ring-violet-700 group-focus:ring-offset-2 group-focus:ring-offset-background'>
                        <Checkbox.Indicator >
                           <Check size={20} className="text-white" />
                        </Checkbox.Indicator>
                     </div>

                     <span className=' text-white leading-tight'>
                        {day}
                     </span>
                  </Checkbox.Root>
               </div>
            )
         })}


         <button 
         type="submit" 
         className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500  transition-colors focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-75 disabled:cursor-not-allowed"
         disabled={!title}
         >
            <Check size={20} weight="bold" />
            Confirmar
         </button>
      </form>
   )
}