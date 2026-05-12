import {create} from "zustand"

export const useWorkoutStore = create((set, get) => ({
     setCompletion: {},
     toggleSet: (exerciseName, setIndex, totalSets) => {
        const current = get().setCompletion[setIndex] || Array(totalSets).fill(false);

        const updated = [...current]

        updated[setIndex] = !updated[setIndex]

        set({
            setCompletion: {
                 ...get().setCompletion,
                [exerciseName]: updated,
            }
        })
    },

    isExerciseCompleted: (exerciseName, totalSets) => {
        const set = get().setCompletion[exerciseName] || []

        return set.length === totalSets && set.every(Boolean)
    }
}))