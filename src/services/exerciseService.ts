import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Exercise, MuscleGroup, Equipment } from '../types/exercise';

const EXERCISES_COLLECTION = 'exercises';

export async function getAllExercises(): Promise<Exercise[]> {
  const querySnapshot = await getDocs(collection(db, EXERCISES_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Exercise));
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const docRef = doc(db, EXERCISES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Exercise;
  }
  
  return null;
}

export async function searchExercises(params: {
  muscleGroups?: MuscleGroup[];
  equipment?: Equipment[];
  difficulty?: Exercise['difficulty'];
  searchTerm?: string;
}): Promise<Exercise[]> {
  const constraints: QueryConstraint[] = [];
  
  if (params.muscleGroups?.length) {
    constraints.push(where('muscleGroups', 'array-contains-any', params.muscleGroups));
  }
  
  if (params.equipment?.length) {
    constraints.push(where('equipment', 'array-contains-any', params.equipment));
  }
  
  if (params.difficulty) {
    constraints.push(where('difficulty', '==', params.difficulty));
  }
  
  const q = query(collection(db, EXERCISES_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  
  let exercises = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Exercise));
  
  // Client-side search for name/description if searchTerm is provided
  if (params.searchTerm) {
    const searchLower = params.searchTerm.toLowerCase();
    exercises = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(searchLower) ||
      exercise.description.toLowerCase().includes(searchLower)
    );
  }
  
  return exercises;
}

export async function addExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
  const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), exercise);
  return {
    id: docRef.id,
    ...exercise
  };
}

export async function updateExercise(id: string, exercise: Partial<Exercise>): Promise<void> {
  const docRef = doc(db, EXERCISES_COLLECTION, id);
  await updateDoc(docRef, {
    ...exercise,
    updatedAt: new Date()
  });
}

export async function deleteExercise(id: string): Promise<void> {
  const docRef = doc(db, EXERCISES_COLLECTION, id);
  await deleteDoc(docRef);
} 