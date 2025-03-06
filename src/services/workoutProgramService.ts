import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingSplit = 'fullBody' | 'upperLower' | 'pushPullLegs' | 'bodyPart';

export interface Exercise {
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restMin: number; // Rest time in seconds
  restMax: number;
  notes?: string;
}

export interface WorkoutDay {
  name: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  experienceLevel: ExperienceLevel;
  split: TrainingSplit;
  daysPerWeek: number;
  workouts: WorkoutDay[];
  equipmentAvailable: string[];
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface ProgramTemplate {
  name: string;
  description: string;
  experienceLevel: ExperienceLevel;
  split: TrainingSplit;
  daysPerWeek: number;
  workouts: WorkoutDay[];
  requiredEquipment: string[];
}

class WorkoutProgramService {
  private readonly PROGRAMS_COLLECTION = 'workoutPrograms';

  // Pre-defined program templates
  private readonly programTemplates: ProgramTemplate[] = [
    {
      name: 'Beginner Full Body',
      description: 'A 3-day full body program perfect for beginners focusing on compound movements',
      experienceLevel: 'beginner',
      split: 'fullBody',
      daysPerWeek: 3,
      requiredEquipment: ['barbell', 'bench', 'rack'],
      workouts: [
        {
          name: 'Full Body A',
          exercises: [
            {
              name: 'Barbell Squat',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180,
              notes: 'Focus on form and controlled descent'
            },
            {
              name: 'Bench Press',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Bent Over Row',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            }
          ]
        },
        {
          name: 'Full Body B',
          exercises: [
            {
              name: 'Romanian Deadlift',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Overhead Press',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Lat Pulldown',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            }
          ]
        },
        {
          name: 'Full Body C',
          exercises: [
            {
              name: 'Leg Press',
              sets: 3,
              repsMin: 10,
              repsMax: 15,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Dumbbell Bench Press',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Cable Row',
              sets: 3,
              repsMin: 10,
              repsMax: 15,
              restMin: 120,
              restMax: 180
            }
          ]
        }
      ]
    },
    {
      name: 'Intermediate Push/Pull/Legs',
      description: 'A 6-day PPL split for intermediate lifters focusing on hypertrophy',
      experienceLevel: 'intermediate',
      split: 'pushPullLegs',
      daysPerWeek: 6,
      requiredEquipment: ['barbell', 'dumbbell', 'cables', 'machines'],
      workouts: [
        {
          name: 'Push A',
          exercises: [
            {
              name: 'Bench Press',
              sets: 4,
              repsMin: 6,
              repsMax: 10,
              restMin: 150,
              restMax: 210
            },
            {
              name: 'Overhead Press',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Incline Dumbbell Press',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            }
          ]
        },
        {
          name: 'Pull A',
          exercises: [
            {
              name: 'Barbell Row',
              sets: 4,
              repsMin: 6,
              repsMax: 10,
              restMin: 150,
              restMax: 210
            },
            {
              name: 'Pull-ups',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restMin: 120,
              restMax: 180
            },
            {
              name: 'Face Pull',
              sets: 3,
              repsMin: 12,
              repsMax: 15,
              restMin: 90,
              restMax: 120
            }
          ]
        }
        // Additional workouts would be defined here
      ]
    }
  ];

  /**
   * Create a new workout program
   */
  async createProgram(program: Omit<WorkoutProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = Timestamp.now();
      const programData = {
        ...program,
        createdAt: timestamp,
        updatedAt: timestamp,
        startDate: program.startDate ? Timestamp.fromDate(program.startDate) : null,
        endDate: program.endDate ? Timestamp.fromDate(program.endDate) : null
      };

      const docRef = await addDoc(collection(db, this.PROGRAMS_COLLECTION), programData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating workout program:', error);
      throw error;
    }
  }

  /**
   * Get available program templates based on criteria
   */
  getTemplates(
    experienceLevel?: ExperienceLevel,
    split?: TrainingSplit,
    equipment?: string[]
  ): ProgramTemplate[] {
    let templates = [...this.programTemplates];

    if (experienceLevel) {
      templates = templates.filter(t => t.experienceLevel === experienceLevel);
    }

    if (split) {
      templates = templates.filter(t => t.split === split);
    }

    if (equipment) {
      templates = templates.filter(t => 
        t.requiredEquipment.every(eq => equipment.includes(eq))
      );
    }

    return templates;
  }

  /**
   * Get a user's active workout program
   */
  async getUserActiveProgram(userId: string): Promise<WorkoutProgram | null> {
    try {
      const q = query(
        collection(db, this.PROGRAMS_COLLECTION),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const programs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as WorkoutProgram[];

      return programs[0] || null;
    } catch (error) {
      console.error('Error getting user active program:', error);
      throw error;
    }
  }

  /**
   * Update a workout program
   */
  async updateProgram(programId: string, updates: Partial<WorkoutProgram>): Promise<void> {
    try {
      const docRef = doc(db, this.PROGRAMS_COLLECTION, programId);
      const timestamp = Timestamp.now();
      
      const updateData = {
        ...updates,
        updatedAt: timestamp,
        startDate: updates.startDate ? Timestamp.fromDate(updates.startDate) : undefined,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate) : undefined
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating workout program:', error);
      throw error;
    }
  }

  /**
   * Generate a custom program based on user preferences
   */
  generateCustomProgram(
    experienceLevel: ExperienceLevel,
    split: TrainingSplit,
    daysPerWeek: number,
    equipment: string[]
  ): WorkoutDay[] {
    // This would contain logic to generate a custom program
    // For now, we'll return a template that best matches the criteria
    const templates = this.getTemplates(experienceLevel, split, equipment);
    return templates[0]?.workouts || [];
  }
}

export const workoutProgramService = new WorkoutProgramService(); 