export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'legs'
  | 'arms'
  | 'core'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'smith_machine'
  | 'bench';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  tips: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
}

export interface WorkoutExercise extends Exercise {
  sets: number;
  repsPerSet: number | string; // string for "failure" or ranges like "8-12"
  restBetweenSets: number; // in seconds
  weight?: number; // in kg or lbs
  notes?: string;
} 