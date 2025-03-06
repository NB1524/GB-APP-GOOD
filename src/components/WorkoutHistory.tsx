import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { workoutTrackingService, WorkoutLog, PersonalRecord } from '../services/workoutTrackingService';
import { useAuth } from '../hooks/useAuth';

interface WorkoutHistoryProps {
  startDate?: Date;
  endDate?: Date;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ startDate, endDate }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadWorkoutData();
    }
  }, [user, startDate, endDate]);

  const loadWorkoutData = async () => {
    try {
      setIsLoading(true);
      
      // Load workout history
      const workoutLogs = await workoutTrackingService.getUserWorkoutLogs(
        user!.uid,
        startDate,
        endDate
      );
      setWorkouts(workoutLogs);

      // Load personal records
      const prs = await workoutTrackingService.getUserPRs(user!.uid);
      setPersonalRecords(prs);
    } catch (error) {
      console.error('Error loading workout data:', error);
      toast({
        title: 'Error loading workout data',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUniqueExercises = () => {
    const exercises = new Set<string>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercises.add(exercise.exerciseName);
      });
    });
    return Array.from(exercises).sort();
  };

  const getMoodBadge = (mood: number) => {
    const colorScheme = {
      1: 'red',
      2: 'orange',
      3: 'yellow',
      4: 'green',
      5: 'blue'
    }[mood] || 'gray';

    return (
      <Badge colorScheme={colorScheme}>
        Mood: {mood}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box w="100%" maxW="1000px" p={4}>
      <Tabs>
        <TabList>
          <Tab>Workout History</Tab>
          <Tab>Personal Records</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="lg">Workout History</Heading>
              
              <Accordion allowMultiple>
                {workouts.map((workout, index) => (
                  <AccordionItem key={index}>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">
                            {format(workout.date, 'PPP')}
                          </Text>
                          <HStack spacing={2}>
                            {getMoodBadge(workout.mood || 3)}
                            <Badge colorScheme="purple">
                              {workout.duration} min
                            </Badge>
                            <AccordionIcon />
                          </HStack>
                        </HStack>
                      </Box>
                    </AccordionButton>
                    <AccordionPanel>
                      <VStack align="stretch" spacing={4}>
                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <Box key={exerciseIndex}>
                            <Heading size="sm" mb={2}>
                              {exercise.exerciseName}
                            </Heading>
                            <Table size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Set</Th>
                                  <Th>Weight (kg)</Th>
                                  <Th>Reps</Th>
                                  <Th>RPE</Th>
                                  <Th>Type</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {exercise.sets.map((set, setIndex) => (
                                  <Tr key={setIndex}>
                                    <Td>{setIndex + 1}</Td>
                                    <Td>{set.weight}</Td>
                                    <Td>{set.reps}</Td>
                                    <Td>{set.rpe || '-'}</Td>
                                    <Td>
                                      <Badge colorScheme={set.isWarmup ? 'orange' : 'green'}>
                                        {set.isWarmup ? 'Warmup' : 'Working'}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                            {exercise.notes && (
                              <Text mt={2} fontSize="sm" color="gray.600">
                                Notes: {exercise.notes}
                              </Text>
                            )}
                          </Box>
                        ))}
                        {workout.notes && (
                          <Box>
                            <Text fontWeight="bold">Workout Notes:</Text>
                            <Text>{workout.notes}</Text>
                          </Box>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="lg">Personal Records</Heading>

              <Select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                <option value="all">All Exercises</option>
                {getUniqueExercises().map(exercise => (
                  <option key={exercise} value={exercise}>
                    {exercise}
                  </option>
                ))}
              </Select>

              <Table>
                <Thead>
                  <Tr>
                    <Th>Exercise</Th>
                    <Th>Weight (kg)</Th>
                    <Th>Reps</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {personalRecords
                    .filter(pr => selectedExercise === 'all' || pr.exerciseName === selectedExercise)
                    .map((pr, index) => (
                      <Tr key={index}>
                        <Td>{pr.exerciseName}</Td>
                        <Td>{pr.weight}</Td>
                        <Td>{pr.reps}</Td>
                        <Td>{format(pr.date, 'PP')}</Td>
                      </Tr>
                    ))
                  }
                </Tbody>
              </Table>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}; 