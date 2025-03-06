import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

const initialExercises = [
  // Chest Exercises
  {
    name: 'Barbell Bench Press',
    description: 'A compound exercise that primarily targets the chest muscles, with secondary focus on shoulders and triceps.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on a flat bench with your feet firmly planted on the ground',
      'Grip the barbell slightly wider than shoulder-width',
      'Unrack the bar and lower it to your mid-chest with control',
      'Press the bar back up to the starting position while maintaining a stable core',
      'Keep your wrists straight and elbows at roughly 45-degree angles'
    ],
    tips: [
      'Keep your shoulder blades retracted throughout the movement',
      'Maintain a slight arch in your lower back',
      'Breathe in during the lowering phase and exhale during the press',
      'Never bounce the bar off your chest'
    ],
    targetMuscles: ['pectoralis major', 'anterior deltoids'],
    secondaryMuscles: ['triceps brachii', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-bench-press.gif'
  },
  {
    name: 'Dumbbell Incline Press',
    description: 'An upper chest focused pressing movement that helps develop the clavicular head of the pectoralis major.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    instructions: [
      'Set bench to 30-45 degree angle',
      'Sit with dumbbells on thighs, then lie back while bringing dumbbells to shoulder level',
      'Press dumbbells up and slightly inward until arms are extended',
      'Lower weights with control back to starting position',
      'Maintain neutral wrist position throughout'
    ],
    tips: [
      'Keep your core engaged throughout the movement',
      'Don\'t let the dumbbells touch at the top',
      'Control the descent to maximize muscle engagement',
      'Keep your elbows at about 45 degrees from your body'
    ],
    targetMuscles: ['upper pectoralis major', 'anterior deltoids'],
    secondaryMuscles: ['triceps brachii', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/incline-dumbbell-press.gif'
  },
  // Back Exercises
  {
    name: 'Barbell Row',
    description: 'A compound pulling exercise that targets the entire back musculature while engaging core stability.',
    muscleGroups: ['back', 'arms'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet shoulder-width apart, knees slightly bent',
      'Bend at hips until torso is nearly parallel to floor, keeping back straight',
      'Grip barbell with hands slightly wider than shoulder width',
      'Pull bar to lower chest/upper abdomen while keeping elbows close to body',
      'Lower bar with control back to starting position'
    ],
    tips: [
      'Keep your core tight and back straight throughout',
      'Squeeze your shoulder blades together at the top',
      'Don\'t use momentum to lift the weight',
      'Look down and slightly forward to maintain neutral spine'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids', 'trapezius'],
    secondaryMuscles: ['biceps brachii', 'rear deltoids', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-row.gif'
  },
  {
    name: 'Pull-ups',
    description: 'A fundamental upper body pulling exercise that builds back strength and width.',
    muscleGroups: ['back', 'arms'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    instructions: [
      'Hang from pull-up bar with hands slightly wider than shoulders',
      'Engage your core and squeeze shoulder blades together',
      'Pull yourself up until chin clears the bar',
      'Lower yourself with control back to starting position',
      'Maintain full control throughout the movement'
    ],
    tips: [
      'Start from a dead hang position',
      'Keep your core engaged to prevent swinging',
      'Focus on pulling with your back, not your arms',
      'Breathe steadily throughout the movement'
    ],
    targetMuscles: ['latissimus dorsi', 'teres major'],
    secondaryMuscles: ['biceps brachii', 'forearms', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/pull-up.gif'
  },
  // Leg Exercises
  {
    name: 'Barbell Back Squat',
    description: 'The king of leg exercises, targeting the entire lower body while building overall strength.',
    muscleGroups: ['legs', 'core'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Position bar on upper back, not neck',
      'Stand with feet shoulder-width apart, toes slightly pointed out',
      'Bend at knees and hips simultaneously, keeping chest up',
      'Lower until thighs are parallel to ground or slightly below',
      'Drive through heels to return to starting position'
    ],
    tips: [
      'Keep your core tight throughout the movement',
      'Track knees in line with toes',
      'Maintain neutral spine position',
      'Drive through your heels'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus', 'hamstrings'],
    secondaryMuscles: ['core', 'lower back', 'calves'],
    videoUrl: 'https://www.youtube.com/watch?v=1oed-UmAxFs',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-back-squat.gif'
  },
  // Shoulder Exercises
  {
    name: 'Standing Military Press',
    description: 'A fundamental overhead pressing movement that builds strong, stable shoulders.',
    muscleGroups: ['shoulders', 'arms'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold barbell at shoulder level with hands just outside shoulders',
      'Press the bar overhead while keeping core tight',
      'Lower the bar back to shoulder level with control',
      'Keep your wrists straight throughout the movement'
    ],
    tips: [
      'Keep your core tight to prevent arching your back',
      'Squeeze your glutes during the press',
      'Don\'t lean back excessively',
      'Breathe out as you press up'
    ],
    targetMuscles: ['deltoids', 'upper trapezius'],
    secondaryMuscles: ['triceps', 'core', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/overhead-press.gif'
  },
  // Core Exercises
  {
    name: 'Plank',
    description: 'A fundamental core exercise that builds isometric strength and stability.',
    muscleGroups: ['core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a push-up position with forearms on the ground',
      'Keep your body in a straight line from head to heels',
      'Engage your core by pulling your navel toward your spine',
      'Hold the position while breathing steadily',
      'Keep your neck neutral by looking at the floor'
    ],
    tips: [
      'Don\'t let your hips sag',
      'Don\'t lift your buttocks too high',
      'Keep breathing throughout the hold',
      'Start with shorter holds and gradually increase duration'
    ],
    targetMuscles: ['rectus abdominis', 'transverse abdominis'],
    secondaryMuscles: ['obliques', 'lower back', 'shoulders'],
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/plank.gif'
  }
];

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