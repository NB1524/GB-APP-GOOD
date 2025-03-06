import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { initialExercises } from '../data/exerciseData.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGAGgQBRQNko9kxsZkrQBBVEYDDyHaGhE",
  authDomain: "gym-buddy-pro-1a1a1.firebaseapp.com",
  projectId: "gym-buddy-pro-1a1a1",
  storageBucket: "gym-buddy-pro-1a1a1.appspot.com",
  messagingSenderId: "1015647164265",
  appId: "1:1015647164265:web:b3a96d84c5c43f2a7a0045"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EXERCISES_COLLECTION = 'exercises';

async function populateExercises() {
  try {
    // Check if exercises already exist
    const exercisesRef = collection(db, EXERCISES_COLLECTION);
    const existingExercises = await getDocs(exercisesRef);
    
    if (!existingExercises.empty) {
      console.log('Exercises already exist in the database. Skipping population.');
      return;
    }

    // Add each exercise to Firebase
    const addPromises = initialExercises.map(async (exercise) => {
      try {
        const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), {
          ...exercise,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Added exercise: ${exercise.name} with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`Error adding exercise ${exercise.name}:`, error);
      }
    });

    await Promise.all(addPromises);
    console.log('Successfully populated exercises database!');
  } catch (error) {
    console.error('Error populating exercises:', error);
  }
}

// Execute the population script
populateExercises(); 