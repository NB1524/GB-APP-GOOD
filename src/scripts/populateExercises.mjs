import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

// Add more exercises to the initial set
const additionalExercises = [
  {
    name: 'Romanian Deadlift',
    description: 'A hip-hinge movement that targets the posterior chain, particularly the hamstrings and lower back.',
    muscleGroups: ['legs', 'back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet hip-width apart, holding barbell in front of thighs',
      'Keep slight bend in knees throughout movement',
      'Hinge at hips, pushing them back while lowering the bar',
      'Keep bar close to legs, lower until you feel stretch in hamstrings',
      'Drive hips forward to return to starting position'
    ],
    tips: [
      'Keep back straight throughout the movement',
      'Maintain bar contact with legs',
      'Feel stretch in hamstrings at bottom',
      'Keep shoulders pulled back'
    ],
    targetMuscles: ['hamstrings', 'gluteus maximus'],
    secondaryMuscles: ['lower back', 'core', 'forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=5Isl_IL_o6Q',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/romanian-deadlift.gif'
  },
  {
    name: 'Dumbbell Lateral Raise',
    description: 'An isolation exercise that targets the lateral deltoids for broader shoulders.',
    muscleGroups: ['shoulders'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    instructions: [
      'Stand with dumbbells at sides, palms facing thighs',
      'Keep slight bend in elbows',
      'Raise arms out to sides until parallel with ground',
      'Pause briefly at top',
      'Lower weights with control'
    ],
    tips: [
      'Don\'t swing or use momentum',
      'Keep core tight',
      'Maintain neutral wrists',
      'Lead with elbows'
    ],
    targetMuscles: ['lateral deltoids'],
    secondaryMuscles: ['anterior deltoids', 'trapezius'],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-lateral-raise.gif'
  },
  {
    name: 'Standing Dumbbell Curl',
    description: 'A classic biceps exercise that builds arm strength and definition.',
    muscleGroups: ['arms'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    instructions: [
      'Stand with dumbbells at sides, palms facing forward',
      'Keep upper arms stationary against sides',
      'Curl weights up toward shoulders',
      'Pause briefly at top contraction',
      'Lower with control to starting position'
    ],
    tips: [
      'Avoid swinging or using momentum',
      'Keep elbows close to body',
      'Maintain full control throughout',
      'Focus on squeezing biceps at top'
    ],
    targetMuscles: ['biceps brachii'],
    secondaryMuscles: ['forearms', 'anterior deltoid'],
    videoUrl: 'https://www.youtube.com/watch?v=av7-8igSXTs',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-bicep-curl.gif'
  },
  {
    name: 'Tricep Rope Pushdown',
    description: 'An isolation exercise targeting the triceps muscles.',
    muscleGroups: ['arms'],
    equipment: ['cable machine'],
    difficulty: 'beginner',
    instructions: [
      'Stand facing cable machine with rope attachment at highest position',
      'Grab rope with palms facing each other',
      'Keep upper arms locked at sides',
      'Push rope down until arms are fully extended',
      'Control the return to starting position'
    ],
    tips: [
      'Keep elbows tucked to sides',
      'Maintain upright posture',
      'Focus on triceps contraction',
      'Don\'t let the weight stack touch between reps'
    ],
    targetMuscles: ['triceps brachii'],
    secondaryMuscles: ['forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/rope-tricep-pushdown.gif'
  },
  {
    name: 'Bulgarian Split Squat',
    description: 'A unilateral leg exercise that develops balance, strength, and muscle symmetry.',
    muscleGroups: ['legs'],
    equipment: ['bench', 'dumbbell'],
    difficulty: 'intermediate',
    instructions: [
      'Place one foot on bench behind you',
      'Stand with other foot about 2-3 feet in front',
      'Lower your body until back knee nearly touches ground',
      'Keep front knee tracking over toes',
      'Push through front heel to return to start'
    ],
    tips: [
      'Keep torso upright',
      'Focus on balance and control',
      'Don\'t let front knee cave inward',
      'Keep core engaged throughout'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bulgarian-split-squat.gif'
  },
  {
    name: 'Face Pull',
    description: 'An upper back exercise that improves posture and rear deltoid development.',
    muscleGroups: ['back', 'shoulders'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
    instructions: [
      'Attach rope to cable machine at head height',
      'Grab rope with overhand grip',
      'Pull rope toward face, separating hands at end of movement',
      'Focus on squeezing shoulder blades together',
      'Return to start position with control'
    ],
    tips: [
      'Keep upper arms parallel to ground',
      'Lead with elbows',
      'Maintain tall posture',
      'Control the negative portion'
    ],
    targetMuscles: ['rear deltoids', 'upper trapezius'],
    secondaryMuscles: ['rhomboids', 'external rotators'],
    videoUrl: 'https://www.youtube.com/watch?v=V8dZ3pyiCBo',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/face-pull.gif'
  },
  {
    name: 'Calf Raises',
    description: 'An isolation exercise targeting the calf muscles for lower leg development.',
    muscleGroups: ['legs'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    instructions: [
      'Stand on edge of step with heels hanging off',
      'Rise up onto your toes as high as possible',
      'Hold the peak contraction briefly',
      'Lower heels below step level',
      'Repeat for desired reps'
    ],
    tips: [
      'Keep legs straight but not locked',
      'Perform full range of motion',
      'Can be done with or without weights',
      'Control the movement throughout'
    ],
    targetMuscles: ['gastrocnemius', 'soleus'],
    secondaryMuscles: ['tibialis anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/standing-calf-raise.gif'
  },
  {
    name: 'Cable Wood Chop',
    description: 'A dynamic core exercise that improves rotational strength and stability.',
    muscleGroups: ['core'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
    instructions: [
      'Set cable at high position',
      'Stand sideways to machine',
      'Pull cable down and across body in chopping motion',
      'Rotate torso while keeping arms straight',
      'Control return to starting position'
    ],
    tips: [
      'Keep core engaged throughout',
      'Move from your core, not arms',
      'Maintain stable lower body',
      'Control the rotation speed'
    ],
    targetMuscles: ['obliques', 'rectus abdominis'],
    secondaryMuscles: ['shoulders', 'hip flexors'],
    videoUrl: 'https://www.youtube.com/watch?v=0UvE2Qi0Wrw',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cable-wood-chop.gif'
  },
  {
    name: 'Dumbbell Walking Lunges',
    description: 'A dynamic leg exercise that builds strength, balance, and coordination.',
    muscleGroups: ['legs'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    instructions: [
      'Hold dumbbells at sides',
      'Step forward into lunge position',
      'Lower back knee toward ground',
      'Push off front foot to step through to next lunge',
      'Alternate legs with each step'
    ],
    tips: [
      'Keep torso upright',
      'Take appropriately sized steps',
      'Keep front knee tracking over toes',
      'Maintain steady pace'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=DlhojghkaQ0',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-walking-lunge.gif'
  },
  {
    name: 'Hanging Leg Raises',
    description: 'An advanced core exercise that targets the lower abs and hip flexors.',
    muscleGroups: ['core'],
    equipment: ['pull-up bar'],
    difficulty: 'advanced',
    instructions: [
      'Hang from pull-up bar with straight arms',
      'Keep legs straight and together',
      'Raise legs until parallel to ground or higher',
      'Lower legs with control',
      'Avoid swinging or momentum'
    ],
    tips: [
      'Engage core throughout movement',
      'Breathe steadily',
      'Keep legs straight if possible',
      'Control the descent'
    ],
    targetMuscles: ['lower rectus abdominis', 'hip flexors'],
    secondaryMuscles: ['obliques', 'grip muscles'],
    videoUrl: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hanging-leg-raise.gif'
  },
  {
    name: 'Dumbbell Shrugs',
    description: 'An isolation exercise for developing the upper trapezius muscles.',
    muscleGroups: ['back', 'shoulders'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    instructions: [
      'Stand holding dumbbells at sides',
      'Keep arms straight and relaxed',
      'Elevate shoulders straight up toward ears',
      'Hold contraction briefly',
      'Lower with control to start'
    ],
    tips: [
      'Avoid rolling shoulders',
      'Keep neck neutral',
      'Focus on straight up and down',
      'Use controlled movements'
    ],
    targetMuscles: ['upper trapezius'],
    secondaryMuscles: ['levator scapulae', 'rhomboids'],
    videoUrl: 'https://www.youtube.com/watch?v=cJRVVxmytaM',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-shrug.gif'
  },
  {
    name: 'Seated Cable Rows',
    description: 'A machine-based back exercise that targets the middle back muscles.',
    muscleGroups: ['back', 'arms'],
    equipment: ['cable machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit at cable row machine with feet on platform',
      'Grab handle with arms extended',
      'Pull handle to lower chest while keeping back straight',
      'Squeeze shoulder blades together at end of movement',
      'Return to start position with control'
    ],
    tips: [
      'Keep chest up throughout movement',
      'Don\'t lean too far forward or back',
      'Drive elbows back, not up',
      'Control the negative portion'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-cable-row.gif'
  },
  {
    name: 'Leg Press',
    description: 'A machine-based compound leg exercise that builds overall leg strength.',
    muscleGroups: ['legs'],
    equipment: ['leg press machine'],
    difficulty: 'intermediate',
    instructions: [
      'Sit in leg press machine with feet shoulder-width apart',
      'Lower weight with control until knees are at 90 degrees',
      'Push through heels to return to start position',
      'Keep lower back pressed against seat',
      'Don\'t lock knees at top of movement'
    ],
    tips: [
      'Control the descent',
      'Keep feet flat on platform',
      'Don\'t let knees cave inward',
      'Breathe steadily throughout'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'calves'],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-press.gif'
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'A dumbbell variation of the bench press offering greater range of motion.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on flat bench holding dumbbells at chest level',
      'Press dumbbells up until arms are extended',
      'Lower weights with control to starting position',
      'Keep wrists straight throughout movement',
      'Maintain stable shoulder position'
    ],
    tips: [
      'Keep core engaged',
      'Control the weights throughout',
      'Don\'t let dumbbells touch at top',
      'Keep elbows at 45-degree angle'
    ],
    targetMuscles: ['pectoralis major', 'anterior deltoids'],
    secondaryMuscles: ['triceps', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-bench-press.gif'
  },
  {
    name: 'Lat Pulldown',
    description: 'A machine exercise that mimics the pull-up movement pattern.',
    muscleGroups: ['back', 'arms'],
    equipment: ['cable machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit at lat pulldown machine, grip bar wider than shoulders',
      'Pull bar down to upper chest while leaning back slightly',
      'Squeeze shoulder blades together at bottom',
      'Control the return to starting position',
      'Keep core engaged throughout'
    ],
    tips: [
      'Don\'t lean back excessively',
      'Keep chest up',
      'Focus on using back muscles',
      'Full range of motion'
    ],
    targetMuscles: ['latissimus dorsi', 'teres major'],
    secondaryMuscles: ['biceps', 'rhomboids'],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lat-pulldown.gif'
  },
  {
    name: 'Machine Chest Fly',
    description: 'An isolation exercise targeting the chest muscles through horizontal adduction.',
    muscleGroups: ['chest'],
    equipment: ['pec deck machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit on machine with back flat against pad',
      'Grasp handles with elbows slightly bent',
      'Bring handles together in front of chest',
      'Squeeze chest muscles at peak contraction',
      'Control return to starting position'
    ],
    tips: [
      'Keep elbows at chest height',
      'Maintain slight bend in elbows',
      'Don\'t let weight stack touch between reps',
      'Focus on chest contraction'
    ],
    targetMuscles: ['pectoralis major'],
    secondaryMuscles: ['anterior deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=Z57CtFmRMxA',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pec-deck-fly.gif'
  },
  {
    name: 'Cable Crossover',
    description: 'A cable-based chest exercise that provides constant tension throughout the movement.',
    muscleGroups: ['chest'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
    instructions: [
      'Stand between cable machines with pulleys set high',
      'Grab handles with slight forward lean',
      'Pull handles down and together in front of body',
      'Hold peak contraction briefly',
      'Return to start with control'
    ],
    tips: [
      'Keep slight bend in elbows',
      'Lean forward slightly',
      'Focus on chest squeeze',
      'Control the negative portion'
    ],
    targetMuscles: ['pectoralis major'],
    secondaryMuscles: ['anterior deltoids', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cable-crossover.gif'
  },
  {
    name: 'Hammer Strength Chest Press',
    description: 'A machine-based pressing movement that provides stability and isolation.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['hammer strength machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit on machine with back flat against pad',
      'Grasp handles at chest level',
      'Press handles forward until arms extend',
      'Control return to starting position',
      'Keep chest up throughout movement'
    ],
    tips: [
      'Drive through chest, not shoulders',
      'Keep back against pad',
      'Don\'t lock elbows at top',
      'Focus on muscle contraction'
    ],
    targetMuscles: ['pectoralis major', 'anterior deltoids'],
    secondaryMuscles: ['triceps'],
    videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/machine-chest-press.gif'
  },
  {
    name: 'Smith Machine Squat',
    description: 'A guided variation of the barbell squat that provides additional stability.',
    muscleGroups: ['legs'],
    equipment: ['smith machine'],
    difficulty: 'beginner',
    instructions: [
      'Position bar on upper back',
      'Stand with feet shoulder-width apart',
      'Squat down until thighs are parallel to ground',
      'Drive through heels to stand',
      'Keep chest up throughout movement'
    ],
    tips: [
      'Keep weight on heels',
      'Control the descent',
      'Don\'t let knees cave in',
      'Maintain neutral spine'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=y1zB-Bu6V44',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/smith-machine-squat.gif'
  },
  {
    name: 'Incline Hammer Curl',
    description: 'A variation of the bicep curl that emphasizes the brachialis muscle.',
    muscleGroups: ['arms'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Sit on incline bench set to 45 degrees',
      'Hold dumbbells with palms facing each other',
      'Curl weights up while keeping upper arms still',
      'Squeeze biceps at top',
      'Lower with control to start'
    ],
    tips: [
      'Keep back against bench',
      'Don\'t swing weights',
      'Full range of motion',
      'Control the negative'
    ],
    targetMuscles: ['biceps brachii', 'brachialis'],
    secondaryMuscles: ['forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=cbRSu8Ws_hs',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/incline-hammer-curl.gif'
  },
  {
    name: 'Seated Leg Extension',
    description: 'An isolation exercise targeting the quadriceps muscles.',
    muscleGroups: ['legs'],
    equipment: ['leg extension machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit on machine with back against pad',
      'Hook feet under ankle pad',
      'Extend legs until straight',
      'Hold contraction briefly',
      'Lower with control'
    ],
    tips: [
      'Don\'t swing or use momentum',
      'Keep back against pad',
      'Focus on quad contraction',
      'Control the negative'
    ],
    targetMuscles: ['quadriceps'],
    secondaryMuscles: [],
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-extension.gif'
  },
  {
    name: 'Lying Leg Curl',
    description: 'An isolation exercise targeting the hamstring muscles.',
    muscleGroups: ['legs'],
    equipment: ['leg curl machine'],
    difficulty: 'beginner',
    instructions: [
      'Lie face down on machine',
      'Hook ankles under pad',
      'Curl legs up towards glutes',
      'Hold contraction briefly',
      'Lower with control'
    ],
    tips: [
      'Keep hips pressed against pad',
      'Don\'t swing or use momentum',
      'Focus on hamstring contraction',
      'Full range of motion'
    ],
    targetMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lying-leg-curl.gif'
  },
  {
    name: 'Seated Calf Raise Machine',
    description: 'A machine-based isolation exercise for the soleus muscle.',
    muscleGroups: ['legs'],
    equipment: ['calf raise machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit at machine with knees bent at 90 degrees',
      'Place balls of feet on platform',
      'Raise heels as high as possible',
      'Hold peak contraction',
      'Lower heels below platform level'
    ],
    tips: [
      'Full range of motion',
      'Control the movement',
      'Don\'t bounce at bottom',
      'Keep knees bent throughout'
    ],
    targetMuscles: ['soleus'],
    secondaryMuscles: ['gastrocnemius'],
    videoUrl: 'https://www.youtube.com/watch?v=JbyjNymZOt0',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-calf-raise.gif'
  },
  {
    name: 'Cable Lateral Raise',
    description: 'A cable variation of the lateral raise for constant tension.',
    muscleGroups: ['shoulders'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
    instructions: [
      'Stand sideways to low cable',
      'Grab handle with outside hand',
      'Raise arm out to side to shoulder level',
      'Control the return',
      'Maintain slight bend in elbow'
    ],
    tips: [
      'Keep core tight',
      'Don\'t swing or momentum',
      'Lead with elbow',
      'Control negative portion'
    ],
    targetMuscles: ['lateral deltoids'],
    secondaryMuscles: ['anterior deltoids', 'trapezius'],
    videoUrl: 'https://www.youtube.com/watch?v=PPrzBWZDOhA',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cable-lateral-raise.gif'
  },
  {
    name: 'Reverse Pec Deck',
    description: 'A machine exercise targeting the rear deltoids and upper back.',
    muscleGroups: ['shoulders', 'back'],
    equipment: ['pec deck machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit facing chest pad',
      'Grab handles with palms facing back',
      'Pull handles back and apart',
      'Squeeze shoulder blades together',
      'Return to start with control'
    ],
    tips: [
      'Keep chest against pad',
      'Lead with elbows',
      'Don\'t use excessive weight',
      'Focus on rear delt contraction'
    ],
    targetMuscles: ['rear deltoids'],
    secondaryMuscles: ['rhomboids', 'trapezius'],
    videoUrl: 'https://www.youtube.com/watch?v=6yMdhi2DVao',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-pec-deck.gif'
  },
  {
    name: 'Machine Shoulder Press',
    description: 'A machine-based overhead pressing movement.',
    muscleGroups: ['shoulders', 'arms'],
    equipment: ['shoulder press machine'],
    difficulty: 'beginner',
    instructions: [
      'Adjust seat height appropriately',
      'Grasp handles at shoulder level',
      'Press handles overhead',
      'Lower with control to start',
      'Keep core engaged throughout'
    ],
    tips: [
      'Don\'t lock elbows at top',
      'Keep back against pad',
      'Control the negative',
      'Breathe steadily'
    ],
    targetMuscles: ['deltoids'],
    secondaryMuscles: ['triceps', 'upper trapezius'],
    videoUrl: 'https://www.youtube.com/watch?v=Wqq-X8F_Ieg',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/machine-shoulder-press.gif'
  },
  {
    name: 'Incline Dumbbell Row',
    description: 'A dumbbell row variation that targets the upper back muscles.',
    muscleGroups: ['back', 'arms'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Set bench to 30-45 degree angle',
      'Lie chest-down on incline bench',
      'Let arms hang straight down',
      'Pull dumbbells to sides of chest',
      'Lower with control'
    ],
    tips: [
      'Keep chest pressed to bench',
      'Squeeze shoulder blades',
      'Don\'t rotate torso',
      'Full range of motion'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=5YStMv6m2g8',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/incline-dumbbell-row.gif'
  },
  {
    name: 'Cable Rope Hammer Curl',
    description: 'A cable variation of the hammer curl for constant tension.',
    muscleGroups: ['arms'],
    equipment: ['cable machine'],
    difficulty: 'beginner',
    instructions: [
      'Attach rope to low pulley',
      'Stand facing machine',
      'Curl rope up keeping palms facing each other',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    tips: [
      'Keep elbows at sides',
      'Don\'t swing or use momentum',
      'Control the negative',
      'Focus on bicep contraction'
    ],
    targetMuscles: ['biceps brachii', 'brachialis'],
    secondaryMuscles: ['forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=36mnx8dBbGE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cable-hammer-curl.gif'
  },
  {
    name: 'Decline Bench Press',
    description: 'A bench press variation targeting the lower chest.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['barbell', 'decline bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on decline bench with feet secured',
      'Unrack bar with slightly wider than shoulder grip',
      'Lower bar to lower chest',
      'Press bar back up to start',
      'Keep wrists straight throughout'
    ],
    tips: [
      'Control the descent',
      'Keep shoulder blades retracted',
      'Don\'t bounce bar off chest',
      'Maintain stable core'
    ],
    targetMuscles: ['lower pectoralis major'],
    secondaryMuscles: ['anterior deltoids', 'triceps'],
    videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/decline-bench-press.gif'
  },
  {
    name: 'Hack Squat',
    description: 'A machine-based squat variation that targets the quadriceps.',
    muscleGroups: ['legs'],
    equipment: ['hack squat machine'],
    difficulty: 'intermediate',
    instructions: [
      'Position shoulders under pads',
      'Place feet shoulder-width on platform',
      'Unlock machine and lower body',
      'Squat until thighs parallel to platform',
      'Push through heels to return to start'
    ],
    tips: [
      'Keep back against pad',
      'Don\'t let knees cave in',
      'Control the descent',
      'Drive through heels'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'calves'],
    videoUrl: 'https://www.youtube.com/watch?v=0tn7F-BO_EY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hack-squat.gif'
  },
  {
    name: 'Assisted Dip Machine',
    description: 'A machine-assisted version of the bodyweight dip.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['assisted dip machine'],
    difficulty: 'beginner',
    instructions: [
      'Kneel on assistance pad',
      'Grasp handles with straight arms',
      'Lower body until upper arms parallel',
      'Push back up to start',
      'Keep chest up throughout'
    ],
    tips: [
      'Control the descent',
      'Keep elbows tucked',
      'Don\'t bounce at bottom',
      'Maintain upright posture'
    ],
    targetMuscles: ['pectoralis major', 'triceps'],
    secondaryMuscles: ['anterior deltoids', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=6kALZikXxLc',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/assisted-dip.gif'
  },
  {
    name: 'T-Bar Row',
    description: 'A compound back exercise using a fixed barbell for stability.',
    muscleGroups: ['back', 'arms'],
    equipment: ['t-bar row machine', 'weight plates'],
    difficulty: 'intermediate',
    instructions: [
      'Straddle the bar facing the weight plates',
      'Bend at hips keeping back straight',
      'Grasp handles and pull weight to chest',
      'Squeeze shoulder blades at top',
      'Lower with control'
    ],
    tips: [
      'Keep chest up',
      'Don\'t round lower back',
      'Control the negative',
      'Drive elbows back'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/t-bar-row.gif'
  },
  {
    name: 'Preacher Curl Machine',
    description: 'A machine-based bicep exercise that eliminates momentum.',
    muscleGroups: ['arms'],
    equipment: ['preacher curl machine'],
    difficulty: 'beginner',
    instructions: [
      'Adjust seat height appropriately',
      'Rest arms on pad',
      'Curl weight up with controlled motion',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    tips: [
      'Keep upper arms on pad',
      'Don\'t swing or use momentum',
      'Full range of motion',
      'Focus on bicep contraction'
    ],
    targetMuscles: ['biceps brachii'],
    secondaryMuscles: ['brachialis', 'forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/preacher-curl-machine.gif'
  },
  {
    name: 'Seated Row Machine',
    description: 'A machine-based rowing movement for back development.',
    muscleGroups: ['back', 'arms'],
    equipment: ['row machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit at machine with chest against pad',
      'Grasp handles with arms extended',
      'Pull handles to sides of torso',
      'Squeeze shoulder blades together',
      'Return to start with control'
    ],
    tips: [
      'Keep chest up',
      'Don\'t lean back excessively',
      'Control the negative',
      'Focus on back contraction'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=xQNrFHEMhI4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/machine-row.gif'
  },
  {
    name: 'Incline Smith Machine Bench Press',
    description: 'A guided incline press for upper chest development.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['smith machine', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Set bench to 30-45 degree angle',
      'Lie on bench and unrack bar',
      'Lower bar to upper chest',
      'Press bar up and slightly back',
      'Keep wrists straight throughout'
    ],
    tips: [
      'Control the descent',
      'Keep back against bench',
      'Don\'t bounce at bottom',
      'Focus on upper chest'
    ],
    targetMuscles: ['upper pectoralis major'],
    secondaryMuscles: ['anterior deltoids', 'triceps'],
    videoUrl: 'https://www.youtube.com/watch?v=Fv5EYoJfRt4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/incline-smith-machine-press.gif'
  },
  {
    name: 'Assisted Pull-up Machine',
    description: 'A machine-assisted version of the pull-up for beginners.',
    muscleGroups: ['back', 'arms'],
    equipment: ['assisted pull-up machine'],
    difficulty: 'beginner',
    instructions: [
      'Kneel on assistance pad',
      'Grasp bar with wide grip',
      'Pull body up until chin over bar',
      'Lower with control',
      'Maintain straight body position'
    ],
    tips: [
      'Keep core tight',
      'Don\'t swing body',
      'Focus on back muscles',
      'Control the descent'
    ],
    targetMuscles: ['latissimus dorsi', 'teres major'],
    secondaryMuscles: ['biceps', 'rhomboids'],
    videoUrl: 'https://www.youtube.com/watch?v=y_Z7cJ6W-Hs',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/assisted-pull-up.gif'
  },
  {
    name: 'Glute-Ham Raise',
    description: 'An advanced posterior chain exercise.',
    muscleGroups: ['legs', 'back'],
    equipment: ['GHD machine'],
    difficulty: 'advanced',
    instructions: [
      'Position body on GHD pad',
      'Hook feet under rollers',
      'Lower torso toward ground',
      'Raise body back up using hamstrings',
      'Keep body straight throughout'
    ],
    tips: [
      'Control the descent',
      'Keep core tight',
      'Focus on hamstring contraction',
      'Don\'t hyperextend back'
    ],
    targetMuscles: ['hamstrings', 'gluteus maximus'],
    secondaryMuscles: ['lower back', 'calves'],
    videoUrl: 'https://www.youtube.com/watch?v=lZbONXtf07k',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/glute-ham-raise.gif'
  },
  {
    name: 'Iso-Lateral Row Machine',
    description: 'A machine row that allows independent arm movement.',
    muscleGroups: ['back', 'arms'],
    equipment: ['iso-lateral row machine'],
    difficulty: 'intermediate',
    instructions: [
      'Sit facing machine with chest against pad',
      'Grasp handles with arms extended',
      'Pull one or both handles to torso',
      'Squeeze shoulder blades together',
      'Return to start position with control'
    ],
    tips: [
      'Keep chest pressed to pad',
      'Don\'t rotate torso',
      'Control the negative',
      'Focus on back contraction'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=8c8Qh2Jb4Lw',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/iso-lateral-row.gif'
  },
  {
    name: 'Smith Machine Calf Raise',
    description: 'A guided calf exercise for maximum stability.',
    muscleGroups: ['legs'],
    equipment: ['smith machine', 'platform'],
    difficulty: 'beginner',
    instructions: [
      'Position balls of feet on platform edge',
      'Place bar across shoulders',
      'Lower heels below platform',
      'Rise up onto toes',
      'Lower with control'
    ],
    tips: [
      'Full range of motion',
      'Don\'t bounce at bottom',
      'Keep legs straight but not locked',
      'Control the movement'
    ],
    targetMuscles: ['gastrocnemius', 'soleus'],
    secondaryMuscles: [],
    videoUrl: 'https://www.youtube.com/watch?v=YnPJVFvOhHY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/smith-machine-calf-raise.gif'
  },
  {
    name: 'Landmine Press',
    description: 'A unique pressing movement that combines strength and stability training.',
    muscleGroups: ['shoulders', 'chest', 'core'],
    equipment: ['landmine attachment', 'weight plates'],
    difficulty: 'intermediate',
    instructions: [
      'Set up landmine attachment with loaded barbell',
      'Stand in athletic stance facing away from pivot point',
      'Hold end of barbell at shoulder height',
      'Press bar up and forward at 45-degree angle',
      'Control return to start position'
    ],
    tips: [
      'Keep core tight throughout',
      'Don\'t lean back excessively',
      'Can be done single or double-arm',
      'Maintain stable lower body'
    ],
    targetMuscles: ['anterior deltoids', 'upper pectoralis'],
    secondaryMuscles: ['triceps', 'serratus anterior', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=iDFxJz0VGvY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/landmine-press.gif'
  },
  {
    name: 'Pendlay Row',
    description: 'A strict barbell row variation starting from a dead stop.',
    muscleGroups: ['back', 'arms'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: [
      'Start with barbell on ground',
      'Bend at hips with flat back, nearly parallel to floor',
      'Grip bar slightly wider than shoulder width',
      'Explosively pull bar to lower chest',
      'Lower bar completely to ground between reps'
    ],
    tips: [
      'Reset between each rep',
      'Keep back angle constant',
      'Pull with maximum effort',
      'Don\'t use momentum'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids', 'traps'],
    videoUrl: 'https://www.youtube.com/watch?v=F3QY5vMz_6I',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pendlay-row.gif'
  },
  {
    name: 'Belt Squat',
    description: 'A lower body exercise that reduces spinal loading.',
    muscleGroups: ['legs'],
    equipment: ['belt squat machine'],
    difficulty: 'intermediate',
    instructions: [
      'Stand on elevated platforms',
      'Attach belt around hips',
      'Keep chest up and core tight',
      'Squat down with weight hanging',
      'Drive through heels to stand'
    ],
    tips: [
      'Maintain upright posture',
      'Keep weight centered',
      'Control the descent',
      'Full range of motion'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'adductors'],
    videoUrl: 'https://www.youtube.com/watch?v=_LgzI5qhjBY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/belt-squat.gif'
  },
  {
    name: 'Meadows Row',
    description: 'A unique unilateral back exercise using a landmine setup.',
    muscleGroups: ['back', 'arms'],
    equipment: ['landmine attachment', 'weight plates'],
    difficulty: 'intermediate',
    instructions: [
      'Stand parallel to loaded landmine',
      'Hinge at hips with flat back',
      'Grasp end of barbell with one hand',
      'Pull weight up towards hip',
      'Lower with control and repeat'
    ],
    tips: [
      'Keep shoulder blade retracted',
      'Don\'t rotate torso',
      'Control the negative',
      'Stay hinged throughout'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=0DxESz_eKhY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/meadows-row.gif'
  },
  {
    name: 'Viking Press',
    description: 'A shoulder press variation using specialized handles or landmine.',
    muscleGroups: ['shoulders', 'arms'],
    equipment: ['viking press attachment', 'weight plates'],
    difficulty: 'intermediate',
    instructions: [
      'Stand facing handles at shoulder height',
      'Grip handles with neutral grip',
      'Press weight overhead',
      'Control return to shoulder level',
      'Maintain stable base'
    ],
    tips: [
      'Keep core engaged',
      'Drive through heels',
      'Don\'t lean back excessively',
      'Breathe consistently'
    ],
    targetMuscles: ['deltoids'],
    secondaryMuscles: ['triceps', 'upper pectoralis'],
    videoUrl: 'https://www.youtube.com/watch?v=0DxESz_eKhY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/viking-press.gif'
  },
  {
    name: 'Sissy Squat',
    description: 'An advanced quad-focused exercise that emphasizes the rectus femoris.',
    muscleGroups: ['legs'],
    equipment: ['bodyweight', 'sissy squat bench'],
    difficulty: 'advanced',
    instructions: [
      'Stand with heels elevated',
      'Lean back while bending knees',
      'Lower body toward ground',
      'Keep hips extended throughout',
      'Return to start position'
    ],
    tips: [
      'Start with assisted version',
      'Maintain tension in quads',
      'Don\'t round lower back',
      'Progress slowly'
    ],
    targetMuscles: ['quadriceps'],
    secondaryMuscles: ['hip flexors'],
    videoUrl: 'https://www.youtube.com/watch?v=Z3zgWz7HJ7c',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/sissy-squat.gif'
  },
  {
    name: 'Reverse Grip Bench Press',
    description: 'A bench press variation targeting upper chest and triceps.',
    muscleGroups: ['chest', 'arms'],
    equipment: ['barbell', 'bench'],
    difficulty: 'advanced',
    instructions: [
      'Lie on flat bench',
      'Grip bar with palms facing you',
      'Unrack and lower to lower chest',
      'Press bar up and slightly back',
      'Keep elbows close to body'
    ],
    tips: [
      'Use lighter weight than standard bench',
      'Keep wrists straight',
      'Focus on triceps engagement',
      'Maintain tight form'
    ],
    targetMuscles: ['upper pectoralis', 'triceps'],
    secondaryMuscles: ['anterior deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=x0y2BvxZXxg',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-grip-bench-press.gif'
  },
  {
    name: 'Zercher Squat',
    description: 'A squat variation holding the barbell in the crooks of the elbows.',
    muscleGroups: ['legs', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: [
      'Hold barbell in elbow creases',
      'Stand with feet shoulder-width',
      'Keep chest up and elbows high',
      'Squat down maintaining upright torso',
      'Drive through heels to stand'
    ],
    tips: [
      'Use padding on arms if needed',
      'Keep upper back tight',
      'Maintain vertical shin angle',
      'Brace core throughout'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['core', 'upper back'],
    videoUrl: 'https://www.youtube.com/watch?v=jKGHOZR2RbU',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/zercher-squat.gif'
  },
  {
    name: 'Seal Row',
    description: 'A chest-supported row variation for strict back isolation.',
    muscleGroups: ['back', 'arms'],
    equipment: ['bench', 'dumbbells'],
    difficulty: 'intermediate',
    instructions: [
      'Lie prone on high bench',
      'Let arms hang with dumbbells',
      'Pull weights to sides of bench',
      'Squeeze shoulder blades together',
      'Lower with control'
    ],
    tips: [
      'Keep chest pressed to bench',
      'Don\'t arch back',
      'Focus on lat contraction',
      'Full range of motion'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=JEb-dwU3VF4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seal-row.gif'
  },
  {
    name: 'Pin Press',
    description: 'A bench press variation starting from pins in a power rack.',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['barbell', 'power rack'],
    difficulty: 'intermediate',
    instructions: [
      'Set pins at chosen height in rack',
      'Lie on bench under barbell',
      'Press bar from dead stop on pins',
      'Lock out arms at top',
      'Return bar to pins between reps'
    ],
    tips: [
      'Reset between each rep',
      'No momentum or bounce',
      'Keep shoulder blades retracted',
      'Full stop on pins'
    ],
    targetMuscles: ['pectoralis major', 'anterior deltoids'],
    secondaryMuscles: ['triceps'],
    videoUrl: 'https://www.youtube.com/watch?v=JEb-dwU3VF4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pin-press.gif'
  },
  {
    name: 'Snatch Grip Deadlift',
    description: 'A deadlift variation using a wide grip for increased range of motion.',
    muscleGroups: ['back', 'legs'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: [
      'Take very wide grip on barbell',
      'Setup similar to conventional deadlift',
      'Keep back flat and chest up',
      'Pull bar up keeping it close to body',
      'Return to floor with control'
    ],
    tips: [
      'Maintain flat back',
      'Keep arms straight',
      'Push through heels',
      'Engage lats throughout'
    ],
    targetMuscles: ['erector spinae', 'trapezius'],
    secondaryMuscles: ['hamstrings', 'gluteus maximus', 'forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=JEb-dwU3VF4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/snatch-grip-deadlift.gif'
  },
  {
    name: 'Reverse Nordic Curl',
    description: 'A bodyweight quad exercise performed on knees.',
    muscleGroups: ['legs'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    instructions: [
      'Kneel on pad with feet secured',
      'Keep hips extended and core tight',
      'Lean back maintaining straight line',
      'Lower until max tension in quads',
      'Return to upright position'
    ],
    tips: [
      'Control the descent',
      'Keep core engaged',
      'Don\'t arch lower back',
      'Build up gradually'
    ],
    targetMuscles: ['quadriceps'],
    secondaryMuscles: ['core', 'hip flexors'],
    videoUrl: 'https://www.youtube.com/watch?v=JEb-dwU3VF4',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-nordic-curl.gif'
  },
  {
    name: 'Deficit Deadlift',
    description: 'A deadlift performed while standing on an elevated platform.',
    muscleGroups: ['back', 'legs'],
    equipment: ['barbell', 'platform'],
    difficulty: 'advanced',
    instructions: [
      'Stand on platform 1-4 inches high',
      'Setup as normal deadlift but from deficit',
      'Keep back flat and core braced',
      'Pull bar up maintaining form',
      'Control descent to floor'
    ],
    tips: [
      'Start with small deficit',
      'Maintain proper positioning',
      'Keep bar close to body',
      'Extra focus on form'
    ],
    targetMuscles: ['erector spinae', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'quadriceps', 'forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=FWizDhYjGsc',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/deficit-deadlift.gif'
  },
  {
    name: 'Spider Curl',
    description: 'A bicep curl performed lying face down on an incline bench.',
    muscleGroups: ['arms'],
    equipment: ['dumbbell', 'incline bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie face down on incline bench',
      'Let arms hang straight down',
      'Curl weights up with strict form',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    tips: [
      'Keep upper arms still',
      'No swinging or momentum',
      'Full range of motion',
      'Focus on peak contraction'
    ],
    targetMuscles: ['biceps brachii'],
    secondaryMuscles: ['brachialis', 'forearms'],
    videoUrl: 'https://www.youtube.com/watch?v=nvufDW8ZkGE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/spider-curl.gif'
  },
  {
    name: 'Overhead Tricep Extension',
    description: 'An isolation exercise for triceps development.',
    muscleGroups: ['arms'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    instructions: [
      'Hold dumbbell overhead with both hands',
      'Lower weight behind head',
      'Keep upper arms stationary',
      'Extend arms to starting position',
      'Control the negative portion'
    ],
    tips: [
      'Keep elbows pointed forward',
      'Don\'t flare elbows out',
      'Full range of motion',
      'Squeeze triceps at top'
    ],
    targetMuscles: ['triceps brachii'],
    secondaryMuscles: [],
    videoUrl: 'https://www.youtube.com/watch?v=_gsUck-7M74',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/overhead-tricep-extension.gif'
  },
  {
    name: 'Guillotine Press',
    description: 'A bench press variation targeting upper chest with elbows flared.',
    muscleGroups: ['chest', 'shoulders'],
    equipment: ['barbell', 'bench'],
    difficulty: 'advanced',
    instructions: [
      'Lie on flat bench',
      'Grip bar wide with elbows flared',
      'Lower bar to upper chest/neck area',
      'Press bar up and slightly back',
      'Maintain flared elbow position'
    ],
    tips: [
      'Use lighter weight than regular bench',
      'Keep shoulder blades retracted',
      'Focus on upper chest',
      'Be cautious with form'
    ],
    targetMuscles: ['upper pectoralis', 'anterior deltoids'],
    secondaryMuscles: ['triceps'],
    videoUrl: 'https://www.youtube.com/watch?v=q4GP6wqjWvE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/guillotine-press.gif'
  },
  {
    name: 'Jefferson Deadlift',
    description: 'An unconventional deadlift with straddled stance.',
    muscleGroups: ['legs', 'back'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: [
      'Straddle barbell facing forward',
      'Grip bar with mixed grip',
      'Keep back straight and chest up',
      'Stand up with weight',
      'Lower bar with control'
    ],
    tips: [
      'Equal weight distribution',
      'Keep bar path straight',
      'Alternate sides',
      'Start light to learn form'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'core', 'trapezius'],
    videoUrl: 'https://www.youtube.com/watch?v=qY0pqlvjGFQ',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/jefferson-deadlift.gif'
  },
  {
    name: 'Renegade Row',
    description: 'A combination of plank and row for total body strength.',
    muscleGroups: ['back', 'core', 'arms'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: [
      'Start in plank with hands on dumbbells',
      'Maintain stable plank position',
      'Row one dumbbell to hip',
      'Lower and repeat other side',
      'Alternate sides each rep'
    ],
    tips: [
      'Keep hips stable',
      'Don\'t rotate torso',
      'Engage core throughout',
      'Control the movement'
    ],
    targetMuscles: ['latissimus dorsi', 'core'],
    secondaryMuscles: ['biceps', 'shoulders', 'triceps'],
    videoUrl: 'https://www.youtube.com/watch?v=F_xF7FwV0XE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/renegade-row.gif'
  },
  {
    name: 'Copenhagen Plank',
    description: 'An advanced side plank variation targeting hip adductors.',
    muscleGroups: ['core', 'legs'],
    equipment: ['bench'],
    difficulty: 'advanced',
    instructions: [
      'Place foot on bench',
      'Support upper body with forearm',
      'Lift other leg off ground',
      'Hold position with straight body',
      'Maintain for prescribed time'
    ],
    tips: [
      'Keep body straight',
      'Don\'t let hips sag',
      'Build up hold time',
      'Breathe steadily'
    ],
    targetMuscles: ['adductors', 'obliques'],
    secondaryMuscles: ['hip flexors', 'quadriceps'],
    videoUrl: 'https://www.youtube.com/watch?v=rO052gYNqpw',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/copenhagen-plank.gif'
  },
  {
    name: 'Z Press',
    description: 'A strict overhead press performed seated on floor.',
    muscleGroups: ['shoulders', 'core'],
    equipment: ['barbell', 'dumbbells'],
    difficulty: 'advanced',
    instructions: [
      'Sit on floor with legs extended',
      'Hold weight at shoulders',
      'Press weight overhead',
      'Keep torso upright',
      'Lower with control'
    ],
    tips: [
      'Maintain upright posture',
      'Keep core tight',
      'Don\'t lean back',
      'Start light to learn movement'
    ],
    targetMuscles: ['deltoids'],
    secondaryMuscles: ['triceps', 'core', 'upper back'],
    videoUrl: 'https://www.youtube.com/watch?v=iZTxa8NJH2g',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/z-press.gif'
  },
  {
    name: 'Meadows Split Squat',
    description: 'A split squat variation using landmine attachment.',
    muscleGroups: ['legs'],
    equipment: ['landmine attachment', 'weight plates'],
    difficulty: 'intermediate',
    instructions: [
      'Hold landmine end at shoulder',
      'Take split stance position',
      'Lower into split squat',
      'Drive through front foot',
      'Maintain upright posture'
    ],
    tips: [
      'Keep torso vertical',
      'Control the descent',
      'Front knee tracks toe',
      'Breathe consistently'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=iZTxa8NJH2g',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/meadows-split-squat.gif'
  },
  {
    name: 'Pallof Press',
    description: 'An anti-rotation core exercise using cable machine.',
    muscleGroups: ['core'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
    instructions: [
      'Stand sideways to cable machine',
      'Hold handle at chest height',
      'Press handle straight out',
      'Resist rotation',
      'Return to chest position'
    ],
    tips: [
      'Keep hips and shoulders square',
      'Maintain stable position',
      'Control the movement',
      'Breathe steadily'
    ],
    targetMuscles: ['obliques', 'rectus abdominis'],
    secondaryMuscles: ['shoulders', 'hip flexors'],
    videoUrl: 'https://www.youtube.com/watch?v=iZTxa8NJH2g',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pallof-press.gif'
  },
  {
    name: 'Safety Bar Squat',
    description: 'A squat variation using a specialized bar that reduces shoulder strain.',
    muscleGroups: ['legs', 'core'],
    equipment: ['safety squat bar'],
    difficulty: 'intermediate',
    instructions: [
      'Position safety bar on upper back',
      'Hold handles at sides',
      'Squat down with control',
      'Keep chest up throughout',
      'Drive through heels to stand'
    ],
    tips: [
      'Stay upright',
      'Control the descent',
      'Keep elbows down',
      'Brace core throughout'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'core', 'upper back'],
    videoUrl: 'https://www.youtube.com/watch?v=xCp-YynBEvE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/safety-bar-squat.gif'
  },
  {
    name: 'Meadows Deadlift',
    description: 'A unilateral deadlift variation using a landmine attachment.',
    muscleGroups: ['back', 'legs'],
    equipment: ['landmine attachment', 'weight plates'],
    difficulty: 'advanced',
    instructions: [
      'Stand perpendicular to landmine',
      'Hinge at hips with flat back',
      'Grasp end of barbell',
      'Drive hips forward to stand',
      'Control descent to floor'
    ],
    tips: [
      'Keep back straight',
      'Drive through heel',
      'Maintain neutral spine',
      'Alternate sides'
    ],
    targetMuscles: ['erector spinae', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'quadriceps', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=1FlG6_c0DRg',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/meadows-deadlift.gif'
  },
  {
    name: 'Reverse Hyper',
    description: 'A posterior chain exercise that decompresses the spine.',
    muscleGroups: ['back', 'legs'],
    equipment: ['reverse hyper machine'],
    difficulty: 'intermediate',
    instructions: [
      'Lie face down on machine',
      'Hook feet into pendulum',
      'Keep upper body still',
      'Raise legs until parallel to floor',
      'Lower with control'
    ],
    tips: [
      'Don\'t swing excessively',
      'Keep core engaged',
      'Control the movement',
      'Focus on glute contraction'
    ],
    targetMuscles: ['gluteus maximus', 'hamstrings'],
    secondaryMuscles: ['erector spinae', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=q0sCDN4_xvE',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-hyper.gif'
  },
  {
    name: 'Hatfield Squat',
    description: 'A squat variation performed while holding onto uprights for stability.',
    muscleGroups: ['legs'],
    equipment: ['power rack', 'barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Position bar on upper back',
      'Hold rack uprights for balance',
      'Take more upright stance',
      'Squat while maintaining position',
      'Drive through full foot to stand'
    ],
    tips: [
      'Use handles for balance only',
      'Stay upright',
      'Keep chest high',
      'Control the descent'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'adductors'],
    videoUrl: 'https://www.youtube.com/watch?v=H94QZT-5djQ',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hatfield-squat.gif'
  },
  {
    name: 'Trap Bar Deadlift',
    description: 'A deadlift variation using a hexagonal bar for better positioning.',
    muscleGroups: ['legs', 'back'],
    equipment: ['trap bar'],
    difficulty: 'beginner',
    instructions: [
      'Stand inside trap bar',
      'Hinge at hips to grasp handles',
      'Keep chest up, back flat',
      'Drive through legs to stand',
      'Control descent to floor'
    ],
    tips: [
      'Push through whole foot',
      'Keep arms straight',
      'Maintain neutral spine',
      'Drive hips forward at top'
    ],
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'trapezius', 'core'],
    videoUrl: 'https://www.youtube.com/watch?v=JFzDZeR8HwY',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/trap-bar-deadlift.gif'
  },
  {
    name: 'Chest Supported T-Bar Row',
    description: 'A supported row variation that isolates the back muscles.',
    muscleGroups: ['back', 'arms'],
    equipment: ['t-bar row machine', 'chest support'],
    difficulty: 'intermediate',
    instructions: [
      'Lie chest down on support pad',
      'Grasp handles with palms facing in',
      'Pull weight up towards chest',
      'Squeeze shoulder blades together',
      'Lower with control'
    ],
    tips: [
      'Keep chest pressed to pad',
      'Don\'t arch lower back',
      'Focus on back contraction',
      'Full range of motion'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=LZFmAohZQes',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/chest-supported-t-bar-row.gif'
  },
  {
    name: 'Decline Cable Fly',
    description: 'A cable fly variation targeting the lower chest.',
    muscleGroups: ['chest'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
    instructions: [
      'Set cables to high position',
      'Lie on decline bench',
      'Start with arms wide',
      'Bring cables together in arc motion',
      'Control return to start'
    ],
    tips: [
      'Keep slight elbow bend',
      'Focus on chest squeeze',
      'Control the negative',
      'Maintain stable position'
    ],
    targetMuscles: ['lower pectoralis major'],
    secondaryMuscles: ['anterior deltoids', 'serratus anterior'],
    videoUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/decline-cable-fly.gif'
  },
  {
    name: 'Hammer Strength Shoulder Press',
    description: 'A machine press that targets the shoulders with reduced stabilization requirements.',
    muscleGroups: ['shoulders', 'arms'],
    equipment: ['hammer strength machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit with back against pad',
      'Grasp handles at shoulder level',
      'Press handles up and slightly forward',
      'Lower with control',
      'Keep core engaged'
    ],
    tips: [
      'Don\'t arch lower back',
      'Keep head neutral',
      'Control the negative',
      'Full range of motion'
    ],
    targetMuscles: ['deltoids'],
    secondaryMuscles: ['triceps', 'upper pectoralis'],
    videoUrl: 'https://www.youtube.com/watch?v=Zj8JB1-1eAo',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hammer-strength-shoulder-press.gif'
  },
  {
    name: 'Nautilus Pullover',
    description: 'A machine-based pullover targeting the lats and serratus.',
    muscleGroups: ['back', 'chest'],
    equipment: ['nautilus pullover machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit facing machine pad',
      'Grasp handles overhead',
      'Pull handles down in arc motion',
      'Squeeze lats at bottom',
      'Control return to start'
    ],
    tips: [
      'Keep lower back pressed to pad',
      'Focus on lat contraction',
      'Don\'t use momentum',
      'Full range of motion'
    ],
    targetMuscles: ['latissimus dorsi', 'serratus anterior'],
    secondaryMuscles: ['triceps', 'pectoralis major'],
    videoUrl: 'https://www.youtube.com/watch?v=JY9gsFtRH7Q',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/nautilus-pullover.gif'
  },
  {
    name: 'Cybex Row',
    description: 'A machine row with independent arm movement.',
    muscleGroups: ['back', 'arms'],
    equipment: ['cybex row machine'],
    difficulty: 'beginner',
    instructions: [
      'Sit facing machine with chest against pad',
      'Grasp handles with arms extended',
      'Pull handles back towards hips',
      'Squeeze shoulder blades together',
      'Return to start position'
    ],
    tips: [
      'Keep chest pressed to pad',
      'Don\'t shrug shoulders',
      'Control the movement',
      'Focus on back contraction'
    ],
    targetMuscles: ['latissimus dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear deltoids'],
    videoUrl: 'https://www.youtube.com/watch?v=8MKGArS7w7c',
    imageUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cybex-row.gif'
  }
];

const allExercises = [...initialExercises, ...additionalExercises];
const EXERCISES_COLLECTION = 'exercises';

async function populateExercises(email, password) {
  console.log('Starting exercise population process...');
  console.log('Attempting to authenticate...');
  
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Successfully authenticated as:', userCredential.user.email);

    // Delete existing exercises
    console.log('\nClearing existing exercises...');
    const exercisesRef = collection(db, EXERCISES_COLLECTION);
    const existingExercises = await getDocs(exercisesRef);
    
    for (const doc of existingExercises.docs) {
      await deleteDoc(doc.ref);
      console.log(`Deleted exercise with ID: ${doc.id}`);
    }
    console.log('Existing exercises cleared.');

    // Add new exercises
    console.log('\nStarting population with complete exercise set...');
    for (const exercise of allExercises) {
      try {
        const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), {
          ...exercise,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✓ Added exercise: ${exercise.name} (${exercise.muscleGroups.join(', ')})`);
      } catch (error) {
        console.error(`✗ Error adding exercise ${exercise.name}:`, error.message);
        if (error.code) {
          console.error('Error code:', error.code);
        }
      }
    }

    console.log('\nExercise population completed!');
    console.log(`Successfully added ${allExercises.length} exercises to the database.`);
  } catch (error) {
    console.error('\nError occurred during process:');
    console.error('Error message:', error.message);
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
  console.error('Usage: npm run populate-exercises <email> <password>');
  console.error('Example: npm run populate-exercises user@example.com mypassword');
  process.exit(1);
}

const [email, password] = args;

// Execute the population script with provided credentials
populateExercises(email, password); 