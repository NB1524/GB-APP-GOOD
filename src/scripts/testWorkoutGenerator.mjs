import { generateWorkoutProgram } from './workoutProgramGenerator.mjs';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

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
const auth = getAuth(app);
const db = getFirestore(app);

async function testWorkoutGenerator(email, password) {
  try {
    console.log('Starting workout program generation test...');
    console.log('Attempting to authenticate...');

    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Successfully authenticated as:', userCredential.user.email);

    // Test user preferences
    const testPreferences = {
      userId: userCredential.user.uid,
      experienceLevel: 'intermediate',
      daysAvailable: 4,
      equipment: ['barbell', 'dumbbell', 'bench', 'cable machine', 'bodyweight'],
      goals: ['strength', 'muscle'],
      timePerSession: 60, // minutes
      preferredTime: 'morning'
    };

    console.log('\nGenerating workout program with test preferences...');
    const program = await generateWorkoutProgram(testPreferences);

    // Save the generated program
    const programsRef = collection(db, 'workoutPrograms');
    const docRef = await addDoc(programsRef, program);

    console.log('\nWorkout program generated successfully!');
    console.log('Program saved with ID:', docRef.id);
    console.log('\nProgram Summary:');
    console.log('Name:', program.name);
    console.log('Duration:', program.duration, 'weeks');
    console.log('Days per week:', program.daysPerWeek);
    
    // Print first week's workout as example
    console.log('\nSample Week 1 Overview:');
    program.weeks[0].days.forEach(day => {
      console.log(`\nDay ${day.dayNumber} - Focus: ${day.focus.join(', ')}`);
      day.workouts.forEach(workout => {
        console.log(`- ${workout.name}: ${workout.sets} sets x ${workout.reps} reps @ ${workout.intensity}% intensity`);
      });
    });

  } catch (error) {
    console.error('\nError during test:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('\nError: Incorrect number of arguments');
  console.error('Usage: npm run test-generator <email> <password>');
  console.error('Example: npm run test-generator user@example.com mypassword');
  process.exit(1);
}

const [email, password] = args;

// Run the test
testWorkoutGenerator(email, password); 