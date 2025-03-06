import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Textarea,
  HStack,
  IconButton,
  Tooltip,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { useAuth } from '../hooks/useAuth';
import { WorkoutLog, ExerciseLog, SetLog } from '../services/workoutTrackingService';
import { workoutTrackingService } from '../services/workoutTrackingService';

interface WorkoutLoggerProps {
  workoutDay?: string;
  exercises?: string[];
  onWorkoutLogged?: () => void;
}

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

interface RPERange {
  min: number;
  max: number;
}

const RPE_RANGES: Record<ExperienceLevel, RPERange> = {
  beginner: { min: 7, max: 8 },
  intermediate: { min: 7, max: 9 },
  advanced: { min: 8, max: 10 }
};

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  workoutDay = '',
  exercises = [],
  onWorkoutLogged
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');

  // Initialize with provided exercises
  useEffect(() => {
    if (exercises.length > 0) {
      setExerciseLogs(exercises.map(name => ({
        exerciseId: name.toLowerCase().replace(/\s+/g, '-'),
        exerciseName: name,
        sets: [],
        notes: ''
      })));
    }
  }, [exercises]);

  const handleAddExercise = () => {
    setExerciseLogs(prev => [
      ...prev,
      {
        exerciseId: `exercise-${prev.length + 1}`,
        exerciseName: '',
        sets: [],
        notes: ''
      }
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setExerciseLogs(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseNameChange = (index: number, name: string) => {
    setExerciseLogs(prev => prev.map((exercise, i) => 
      i === index ? { ...exercise, exerciseName: name } : exercise
    ));
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExerciseLogs(prev => prev.map((exercise, i) => {
      if (i === exerciseIndex) {
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            { weight: 0, reps: 0, rpe: 7 }
          ]
        };
      }
      return exercise;
    }));
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs(prev => prev.map((exercise, i) => {
      if (i === exerciseIndex) {
        return {
          ...exercise,
          sets: exercise.sets.filter((_, si) => si !== setIndex)
        };
      }
      return exercise;
    }));
  };

  const calculateWeightForRPE = (currentWeight: number, currentRPE: number, targetRPE: number): number => {
    const rpeDiff = targetRPE - currentRPE;
    const adjustmentFactor = 0.05; // 5% per RPE point
    const weightAdjustment = currentWeight * (adjustmentFactor * rpeDiff);
    return Math.round(currentWeight + weightAdjustment); // Round to nearest lb
  };

  const getTargetRPE = (setIndex: number, totalSets: number): number => {
    const range = RPE_RANGES[experienceLevel];
    const rpeSpread = range.max - range.min;
    const rpeIncrement = rpeSpread / (totalSets - 1);
    const targetRPE = range.min + (setIndex * rpeIncrement);
    return Math.min(range.max, Math.round(targetRPE * 2) / 2); // Round to nearest 0.5
  };

  const updateSubsequentSets = (
    exerciseIndex: number,
    setIndex: number,
    currentWeight: number,
    currentRPE: number
  ) => {
    setExerciseLogs(prev => prev.map((exercise, i) => {
      if (i === exerciseIndex) {
        const updatedSets = [...exercise.sets];
        for (let i = setIndex + 1; i < updatedSets.length; i++) {
          const targetRPE = getTargetRPE(i, updatedSets.length);
          const newWeight = calculateWeightForRPE(currentWeight, currentRPE, targetRPE);
          updatedSets[i] = {
            ...updatedSets[i],
            weight: newWeight,
            rpe: targetRPE
          };
        }
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetLog,
    value: number
  ) => {
    setExerciseLogs(prev => prev.map((exercise, i) => {
      if (i === exerciseIndex) {
        const updatedSets = exercise.sets.map((set, si) => {
          if (si === setIndex) {
            return { ...set, [field]: value };
          }
          return set;
        });
        
        // If weight or RPE changed, update subsequent sets
        if ((field === 'weight' || field === 'rpe') && setIndex < exercise.sets.length - 1) {
          const currentSet = updatedSets[setIndex];
          updateSubsequentSets(exerciseIndex, setIndex, currentSet.weight, currentSet.rpe);
        }
        
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  };

  const handleExerciseNotesChange = (index: number, notes: string) => {
    setExerciseLogs(prev => prev.map((exercise, i) => 
      i === index ? { ...exercise, notes } : exercise
    ));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Please log in first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate workout data
    if (exerciseLogs.length === 0) {
      toast({
        title: 'No exercises logged',
        description: 'Please add at least one exercise',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    for (const exercise of exerciseLogs) {
      if (!exercise.exerciseName) {
        toast({
          title: 'Missing exercise name',
          description: 'Please fill in all exercise names',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (exercise.sets.length === 0) {
        toast({
          title: 'Missing sets',
          description: `Please add sets for ${exercise.exerciseName}`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    try {
      setIsLoading(true);

      const workoutLog: Omit<WorkoutLog, 'id'> = {
        userId: user.uid,
        workoutDay,
        date: new Date(workoutDate),
        exercises: exerciseLogs,
        duration,
        mood,
        notes
      };

      await workoutTrackingService.logWorkout(workoutLog);

      toast({
        title: 'Workout logged successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onWorkoutLogged?.();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: 'Error logging workout',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWeightProgressionSuggestion = async (exerciseName: string) => {
    try {
      const history = await workoutTrackingService.getExerciseHistory(user!.uid, exerciseName);
      const progression = workoutTrackingService.calculateWeightProgression(history, 'intermediate'); // TODO: Get actual experience level
      
      if (progression.confidence > 0) {
        toast({
          title: 'Weight Progression Suggestion',
          description: progression.reason,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error getting weight progression:', error);
    }
  };

  return (
    <Box w="100%" maxW="800px" p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Log Workout</Heading>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Experience Level</FormLabel>
            <Select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Duration (minutes)</FormLabel>
            <NumberInput
              value={duration}
              onChange={(_, value) => setDuration(value)}
              min={0}
              max={300}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Mood/Energy (1-5)</FormLabel>
            <Select
              value={mood}
              onChange={(e) => setMood(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
            >
              <option value={1}>1 - Very Low</option>
              <option value={2}>2 - Low</option>
              <option value={3}>3 - Average</option>
              <option value={4}>4 - Good</option>
              <option value={5}>5 - Excellent</option>
            </Select>
          </FormControl>
        </HStack>

        {exerciseLogs.map((exercise, exerciseIndex) => (
          <Box key={exerciseIndex} p={4} borderWidth={1} borderRadius="md">
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <FormControl isRequired>
                  <FormLabel>Exercise Name</FormLabel>
                  <Input
                    value={exercise.exerciseName}
                    onChange={(e) => handleExerciseNameChange(exerciseIndex, e.target.value)}
                    placeholder="Enter exercise name"
                  />
                </FormControl>
                <IconButton
                  aria-label="Remove exercise"
                  icon={<DeleteIcon />}
                  onClick={() => handleRemoveExercise(exerciseIndex)}
                  colorScheme="red"
                  variant="ghost"
                />
              </HStack>

              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Set</Th>
                    <Th>Weight (lbs)</Th>
                    <Th>Reps</Th>
                    <Th>RPE</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exercise.sets.map((set, setIndex) => (
                    <Tr key={setIndex}>
                      <Td>{setIndex + 1}</Td>
                      <Td>
                        <NumberInput
                          value={set.weight}
                          onChange={(_, value) => handleSetChange(exerciseIndex, setIndex, 'weight', value)}
                          min={0}
                          max={1000}
                          step={5}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Td>
                      <Td>
                        <NumberInput
                          value={set.reps}
                          onChange={(_, value) => handleSetChange(exerciseIndex, setIndex, 'reps', value)}
                          min={0}
                          max={100}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Td>
                      <Td>
                        <NumberInput
                          value={set.rpe}
                          onChange={(_, value) => handleSetChange(exerciseIndex, setIndex, 'rpe', value)}
                          min={1}
                          max={10}
                          step={0.5}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Td>
                      <Td>
                        <IconButton
                          aria-label="Remove set"
                          icon={<DeleteIcon />}
                          onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <HStack spacing={4}>
                <Button
                  leftIcon={<AddIcon />}
                  onClick={() => handleAddSet(exerciseIndex)}
                  size="sm"
                >
                  Add Set
                </Button>
                {exercise.exerciseName && (
                  <Button
                    size="sm"
                    onClick={() => getWeightProgressionSuggestion(exercise.exerciseName)}
                  >
                    Get Weight Suggestion
                  </Button>
                )}
              </HStack>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={exercise.notes}
                  onChange={(e) => handleExerciseNotesChange(exerciseIndex, e.target.value)}
                  placeholder="Add notes about form, difficulty, etc."
                />
              </FormControl>
            </VStack>
          </Box>
        ))}

        <Button
          leftIcon={<AddIcon />}
          onClick={handleAddExercise}
          alignSelf="flex-start"
        >
          Add Exercise
        </Button>

        <FormControl>
          <FormLabel>Workout Notes</FormLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add general notes about the workout"
          />
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={isLoading}
          isDisabled={exerciseLogs.length === 0}
        >
          Log Workout
        </Button>
      </VStack>
    </Box>
  );
}; 