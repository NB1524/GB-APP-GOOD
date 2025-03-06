import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SetLog {
  weight: number;
  reps: number;
  rpe: number;
  notes?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutLog {
  id?: string;
  userId: string;
  programId?: string;
  workoutDay: string;
  date: Date;
  exercises: ExerciseLog[];
  duration: number;
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

export interface PersonalRecord {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  workoutLogId: string;
}

interface WeightProgression {
  currentWeight: number;
  suggestedWeight: number;
  confidence: number;
  reason: string;
}

class WorkoutTrackingService {
  private readonly WORKOUT_LOGS_COLLECTION = 'workoutLogs';
  private readonly PERSONAL_RECORDS_COLLECTION = 'personalRecords';

  /**
   * Log a completed workout
   */
  async logWorkout(log: Omit<WorkoutLog, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.WORKOUT_LOGS_COLLECTION), {
        ...log,
        date: Timestamp.fromDate(log.date),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging workout:', error);
      throw error;
    }
  }

  /**
   * Update an existing workout log
   */
  async updateWorkoutLog(logId: string, updates: Partial<WorkoutLog>): Promise<void> {
    try {
      const docRef = doc(db, this.WORKOUT_LOGS_COLLECTION, logId);
      const timestamp = Timestamp.now();
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: timestamp
      });

      // Re-check PRs if exercises were updated
      if (updates.exercises) {
        const fullLog = await this.getWorkoutLog(logId);
        if (fullLog) {
          await this.checkAndUpdatePRs(fullLog, logId);
        }
      }
    } catch (error) {
      console.error('Error updating workout log:', error);
      throw error;
    }
  }

  /**
   * Get a specific workout log
   */
  async getWorkoutLog(logId: string): Promise<WorkoutLog | null> {
    try {
      const docRef = doc(db, this.WORKOUT_LOGS_COLLECTION, logId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as WorkoutLog;
      }

      return null;
    } catch (error) {
      console.error('Error getting workout log:', error);
      throw error;
    }
  }

  /**
   * Get workout logs for a user within a date range
   */
  async getUserWorkoutLogs(
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<WorkoutLog[]> {
    try {
      let q = query(
        collection(db, this.WORKOUT_LOGS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      if (startDate) {
        q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as WorkoutLog[];
    } catch (error) {
      console.error('Error getting user workout logs:', error);
      throw error;
    }
  }

  /**
   * Get personal records for a user
   */
  async getUserPRs(userId: string, exerciseId?: string): Promise<PersonalRecord[]> {
    try {
      let q = query(
        collection(db, this.PERSONAL_RECORDS_COLLECTION),
        where('userId', '==', userId)
      );

      if (exerciseId) {
        q = query(q, where('exerciseId', '==', exerciseId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate()
      })) as PersonalRecord[];
    } catch (error) {
      console.error('Error getting user PRs:', error);
      throw error;
    }
  }

  /**
   * Check and update personal records based on a workout log
   */
  private async checkAndUpdatePRs(workoutLog: WorkoutLog, workoutLogId: string): Promise<void> {
    try {
      for (const exercise of workoutLog.exercises) {
        // Only check non-warmup sets
        const workingSets = exercise.sets.filter(set => !set.isWarmup);
        
        if (workingSets.length === 0) continue;

        // Get current PRs for this exercise
        const currentPRs = await this.getUserPRs(workoutLog.userId, exercise.exerciseId);
        
        // Check each set for potential PRs
        for (const set of workingSets) {
          const isNewPR = this.isPotentialPR(set, currentPRs);
          
          if (isNewPR) {
            await addDoc(collection(db, this.PERSONAL_RECORDS_COLLECTION), {
              userId: workoutLog.userId,
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              weight: set.weight,
              reps: set.reps,
              date: workoutLog.date,
              workoutLogId
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking and updating PRs:', error);
      throw error;
    }
  }

  /**
   * Determine if a set is a new personal record
   */
  private isPotentialPR(set: SetLog, currentPRs: PersonalRecord[]): boolean {
    // Filter PRs for the same rep range
    const sameRepPRs = currentPRs.filter(pr => pr.reps === set.reps);
    
    // If no PRs exist for this rep range, this is automatically a PR
    if (sameRepPRs.length === 0) return true;
    
    // Check if this weight is higher than any existing PR at this rep range
    return !sameRepPRs.some(pr => pr.weight >= set.weight);
  }

  /**
   * Get user's workout history for a specific exercise
   */
  async getExerciseHistory(userId: string, exerciseName: string): Promise<ExerciseLog[]> {
    try {
      const q = query(
        collection(db, this.WORKOUT_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('exercises.exerciseName', '==', exerciseName),
        orderBy('date', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const history: ExerciseLog[] = [];

      querySnapshot.forEach(doc => {
        const workoutLog = doc.data() as WorkoutLog;
        const exerciseLog = workoutLog.exercises.find(e => e.exerciseName === exerciseName);
        if (exerciseLog) {
          history.push(exerciseLog);
        }
      });

      return history;
    } catch (error) {
      console.error('Error getting exercise history:', error);
      throw error;
    }
  }

  /**
   * Calculate suggested weight progression based on RPE
   */
  calculateWeightProgression(
    exerciseHistory: ExerciseLog[],
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ): WeightProgression {
    if (!exerciseHistory.length) {
      return {
        currentWeight: 0,
        suggestedWeight: 0,
        confidence: 0,
        reason: 'No previous data available'
      };
    }

    const lastWorkout = exerciseHistory[0];
    const lastSets = lastWorkout.sets;
    const avgRPE = lastSets.reduce((sum, set) => sum + set.rpe, 0) / lastSets.length;
    const maxWeight = Math.max(...lastSets.map(set => set.weight));

    // RPE targets by experience level
    const rpeTargets = {
      beginner: { min: 7, max: 8 },
      intermediate: { min: 7, max: 9 },
      advanced: { min: 8, max: 10 }
    };

    const target = rpeTargets[experienceLevel];
    let suggestedWeight = maxWeight;
    let reason = '';
    let confidence = 0.8; // Base confidence

    if (avgRPE < target.min) {
      // Increase weight if RPE is too low
      const increase = maxWeight * 0.05; // 5% increase
      suggestedWeight = maxWeight + increase;
      reason = `Average RPE (${avgRPE.toFixed(1)}) below target range (${target.min}-${target.max}). Suggesting ${increase.toFixed(1)}kg increase.`;
      confidence = 0.9;
    } else if (avgRPE > target.max) {
      // Decrease weight if RPE is too high
      const decrease = maxWeight * 0.05; // 5% decrease
      suggestedWeight = maxWeight - decrease;
      reason = `Average RPE (${avgRPE.toFixed(1)}) above target range (${target.min}-${target.max}). Suggesting ${decrease.toFixed(1)}kg decrease.`;
      confidence = 0.9;
    } else {
      // Maintain weight if RPE is in target range
      reason = `Average RPE (${avgRPE.toFixed(1)}) within target range (${target.min}-${target.max}). Maintaining current weight.`;
      confidence = 1.0;
    }

    // Adjust confidence based on data consistency
    if (exerciseHistory.length < 3) {
      confidence *= 0.8; // Lower confidence with limited data
      reason += ' Limited historical data available.';
    }

    return {
      currentWeight: maxWeight,
      suggestedWeight: Math.round(suggestedWeight * 2) / 2, // Round to nearest 0.5
      confidence,
      reason
    };
  }

  /**
   * Get user's recent workout logs
   */
  async getRecentWorkouts(userId: string, limit: number = 10): Promise<WorkoutLog[]> {
    try {
      const q = query(
        collection(db, this.WORKOUT_LOGS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp).toDate()
      })) as WorkoutLog[];
    } catch (error) {
      console.error('Error getting recent workouts:', error);
      throw error;
    }
  }

  /**
   * Calculate workout streak
   */
  async getWorkoutStreak(userId: string): Promise<number> {
    try {
      const recentWorkouts = await this.getRecentWorkouts(userId, 30);
      if (!recentWorkouts.length) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < recentWorkouts.length; i++) {
        const workoutDate = new Date(recentWorkouts[i].date);
        workoutDate.setHours(0, 0, 0, 0);

        if (i === 0) {
          const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) break; // Break if more than 1 day gap from today
          streak++;
        } else {
          const prevWorkoutDate = new Date(recentWorkouts[i - 1].date);
          prevWorkoutDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((prevWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) break; // Break if more than 1 day gap between workouts
          streak++;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating workout streak:', error);
      throw error;
    }
  }
}

export const workoutTrackingService = new WorkoutTrackingService(); 