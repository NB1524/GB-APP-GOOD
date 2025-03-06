import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6kov3lrnVLpcyW-92UAshTqnczCzOkRM",
  authDomain: "cursor-fit-app.firebaseapp.com",
  projectId: "cursor-fit-app",
  storageBucket: "cursor-fit-app.firebasestorage.app",
  messagingSenderId: "429983420843",
  appId: "1:429983420843:web:69efcf71dde378839c82ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Program templates based on experience level
const programTemplates = {
  beginner: {
    daysPerWeek: 3,
    sessionsPerDay: 1,
    exercisesPerSession: 6,
    restBetweenExercises: 90, // seconds
    weekDuration: 8, // weeks
    progression: {
      weeklyVolumeIncrease: 5, // percentage
      deloadFrequency: 4 // weeks
    }
  },
  intermediate: {
    daysPerWeek: 4,
    sessionsPerDay: 1,
    exercisesPerSession: 8,
    restBetweenExercises: 60,
    weekDuration: 12,
    progression: {
      weeklyVolumeIncrease: 7.5,
      deloadFrequency: 6
    }
  },
  advanced: {
    daysPerWeek: 5,
    sessionsPerDay: 1,
    exercisesPerSession: 10,
    restBetweenExercises: 45,
    weekDuration: 16,
    progression: {
      weeklyVolumeIncrease: 10,
      deloadFrequency: 8
    }
  }
};

// Training split templates
const splitTemplates = {
  fullBody: {
    name: 'Full Body',
    splits: [
      {
        day: 1,
        focus: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'],
        exerciseDistribution: {
          chest: 0.2,
          back: 0.2,
          legs: 0.3,
          shoulders: 0.1,
          arms: 0.1,
          core: 0.1
        }
      }
    ],
    recommendedLevel: ['beginner'],
    frequency: 3
  },
  upperLower: {
    name: 'Upper/Lower Split',
    splits: [
      {
        day: 1,
        focus: ['chest', 'back', 'shoulders', 'arms'],
        exerciseDistribution: {
          chest: 0.3,
          back: 0.3,
          shoulders: 0.2,
          arms: 0.2
        }
      },
      {
        day: 2,
        focus: ['legs', 'core'],
        exerciseDistribution: {
          legs: 0.8,
          core: 0.2
        }
      }
    ],
    recommendedLevel: ['beginner', 'intermediate'],
    frequency: 4
  },
  pushPullLegs: {
    name: 'Push/Pull/Legs',
    splits: [
      {
        day: 1,
        focus: ['chest', 'shoulders', 'triceps'],
        exerciseDistribution: {
          chest: 0.4,
          shoulders: 0.3,
          arms: 0.3
        }
      },
      {
        day: 2,
        focus: ['back', 'biceps'],
        exerciseDistribution: {
          back: 0.7,
          arms: 0.3
        }
      },
      {
        day: 3,
        focus: ['legs', 'core'],
        exerciseDistribution: {
          legs: 0.8,
          core: 0.2
        }
      }
    ],
    recommendedLevel: ['intermediate', 'advanced'],
    frequency: 6
  }
};

// Volume and intensity recommendations
const trainingParameters = {
  beginner: {
    setsPerExercise: { min: 2, max: 3 },
    repsPerSet: { min: 10, max: 15 },
    intensityRange: { min: 60, max: 70 }, // percentage of 1RM
    restBetweenSets: 90 // seconds
  },
  intermediate: {
    setsPerExercise: { min: 3, max: 4 },
    repsPerSet: { min: 8, max: 12 },
    intensityRange: { min: 70, max: 80 },
    restBetweenSets: 60
  },
  advanced: {
    setsPerExercise: { min: 4, max: 5 },
    repsPerSet: { min: 6, max: 12 },
    intensityRange: { min: 75, max: 85 },
    restBetweenSets: 45
  }
};

/**
 * Generate a workout program based on user preferences and fitness level
 * @param {Object} userPreferences User's training preferences and constraints
 * @returns {Object} Generated workout program
 */
async function generateWorkoutProgram(userPreferences) {
  try {
    // Get all available exercises from the database
    const exercisesRef = collection(db, 'exercises');
    const exerciseSnapshot = await getDocs(exercisesRef);
    const exercises = exerciseSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Select appropriate program template
    const template = programTemplates[userPreferences.experienceLevel];
    const split = selectTrainingSplit(userPreferences);
    
    // Generate program structure
    const program = {
      name: `${split.name} Program - ${userPreferences.experienceLevel} Level`,
      duration: template.weekDuration,
      daysPerWeek: split.frequency,
      createdAt: new Date(),
      userId: userPreferences.userId,
      weeks: []
    };

    // Generate weeks
    for (let week = 1; week <= template.weekDuration; week++) {
      const isDeloadWeek = week % template.progression.deloadFrequency === 0;
      const weekPlan = generateWeekPlan(
        exercises,
        split,
        template,
        userPreferences,
        isDeloadWeek,
        week
      );
      program.weeks.push(weekPlan);
    }

    return program;
  } catch (error) {
    console.error('Error generating workout program:', error);
    throw error;
  }
}

/**
 * Select appropriate training split based on user preferences
 * @param {Object} userPreferences User's training preferences
 * @returns {Object} Selected training split template
 */
function selectTrainingSplit(userPreferences) {
  const { experienceLevel, daysAvailable } = userPreferences;
  
  // Filter splits based on experience level and available days
  const eligibleSplits = Object.values(splitTemplates).filter(split => {
    return split.recommendedLevel.includes(experienceLevel) && 
           split.frequency <= daysAvailable;
  });

  // Select the most appropriate split
  if (eligibleSplits.length === 0) {
    return splitTemplates.fullBody; // Default to full body if no suitable split found
  }

  // Prefer more advanced splits for experienced users
  if (experienceLevel === 'advanced') {
    return eligibleSplits.reduce((prev, current) => 
      current.frequency > prev.frequency ? current : prev
    );
  }

  // Return the first eligible split
  return eligibleSplits[0];
}

/**
 * Generate a week's workout plan
 * @param {Array} exercises Available exercises
 * @param {Object} split Training split template
 * @param {Object} template Program template
 * @param {Object} userPreferences User preferences
 * @param {boolean} isDeloadWeek Whether this is a deload week
 * @param {number} weekNumber Current week number
 * @returns {Object} Week's workout plan
 */
function generateWeekPlan(exercises, split, template, userPreferences, isDeloadWeek, weekNumber) {
  const weekPlan = {
    weekNumber,
    isDeloadWeek,
    days: []
  };

  // Generate each training day
  split.splits.forEach((daySplit, index) => {
    const workouts = generateDayWorkouts(
      exercises,
      daySplit,
      template,
      userPreferences,
      isDeloadWeek
    );

    weekPlan.days.push({
      dayNumber: index + 1,
      focus: daySplit.focus,
      workouts
    });
  });

  return weekPlan;
}

/**
 * Generate workouts for a specific day
 * @param {Array} exercises Available exercises
 * @param {Object} daySplit Day's training split
 * @param {Object} template Program template
 * @param {Object} userPreferences User preferences
 * @param {boolean} isDeloadWeek Whether this is a deload week
 * @returns {Array} Day's workouts
 */
function generateDayWorkouts(exercises, daySplit, template, userPreferences, isDeloadWeek) {
  const { experienceLevel, equipment = [] } = userPreferences;
  const params = trainingParameters[experienceLevel];
  const workouts = [];

  // Filter exercises based on equipment availability and muscle groups
  const availableExercises = exercises.filter(exercise => {
    const hasRequiredEquipment = exercise.equipment.every(eq => equipment.includes(eq));
    const targetsMuscleGroup = daySplit.focus.some(group => 
      exercise.muscleGroups.includes(group)
    );
    return hasRequiredEquipment && targetsMuscleGroup;
  });

  // Calculate number of exercises for each muscle group
  Object.entries(daySplit.exerciseDistribution).forEach(([muscleGroup, ratio]) => {
    const exerciseCount = Math.round(template.exercisesPerSession * ratio);
    const muscleExercises = availableExercises.filter(ex => 
      ex.muscleGroups.includes(muscleGroup)
    );

    // Select exercises for this muscle group
    for (let i = 0; i < exerciseCount && muscleExercises.length > 0; i++) {
      const exercise = selectExercise(muscleExercises, workouts);
      if (exercise) {
        workouts.push(generateExerciseSet(
          exercise,
          params,
          isDeloadWeek
        ));
      }
    }
  });

  return workouts;
}

/**
 * Select an appropriate exercise from available options
 * @param {Array} exercises Available exercises
 * @param {Array} currentWorkouts Already selected workouts
 * @returns {Object} Selected exercise
 */
function selectExercise(exercises, currentWorkouts) {
  // Filter out exercises already selected
  const availableExercises = exercises.filter(ex => 
    !currentWorkouts.some(workout => workout.exerciseId === ex.id)
  );

  if (availableExercises.length === 0) return null;

  // Randomly select an exercise
  const randomIndex = Math.floor(Math.random() * availableExercises.length);
  return availableExercises[randomIndex];
}

/**
 * Generate a set of exercise parameters
 * @param {Object} exercise Exercise details
 * @param {Object} params Training parameters
 * @param {boolean} isDeloadWeek Whether this is a deload week
 * @returns {Object} Exercise set parameters
 */
function generateExerciseSet(exercise, params, isDeloadWeek) {
  const sets = isDeloadWeek ? 
    params.setsPerExercise.min :
    Math.floor(Math.random() * (params.setsPerExercise.max - params.setsPerExercise.min + 1)) + params.setsPerExercise.min;

  const reps = Math.floor(Math.random() * (params.repsPerSet.max - params.repsPerSet.min + 1)) + params.repsPerSet.min;

  const intensity = isDeloadWeek ?
    params.intensityRange.min :
    Math.floor(Math.random() * (params.intensityRange.max - params.intensityRange.min + 1)) + params.intensityRange.min;

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    sets,
    reps,
    intensity,
    restBetweenSets: params.restBetweenSets
  };
}

export {
  generateWorkoutProgram,
  programTemplates,
  splitTemplates,
  trainingParameters
}; 