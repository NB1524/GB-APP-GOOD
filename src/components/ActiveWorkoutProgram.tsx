import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
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
  Button,
  useToast,
  Spinner,
  HStack
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { workoutProgramService, WorkoutProgram } from '../services/workoutProgramService';

interface ActiveWorkoutProgramProps {
  onDeactivate?: () => void;
}

export const ActiveWorkoutProgram: React.FC<ActiveWorkoutProgramProps> = ({
  onDeactivate
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    if (user) {
      loadActiveProgram();
    }
  }, [user]);

  const loadActiveProgram = async () => {
    try {
      setIsLoading(true);
      const activeProgram = await workoutProgramService.getUserActiveProgram(user!.uid);
      setProgram(activeProgram);
    } catch (error) {
      console.error('Error loading active program:', error);
      toast({
        title: 'Error loading program',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!program) return;

    try {
      await workoutProgramService.updateProgram(program.id, { isActive: false });
      toast({
        title: 'Program deactivated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeactivate?.();
    } catch (error) {
      console.error('Error deactivating program:', error);
      toast({
        title: 'Error deactivating program',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!program) {
    return (
      <Box textAlign="center" py={8}>
        <Text fontSize="lg">No active workout program</Text>
      </Box>
    );
  }

  return (
    <Box w="100%" maxW="800px" p={4}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">{program.name}</Heading>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleDeactivate}
          >
            Deactivate Program
          </Button>
        </HStack>

        {program.description && (
          <Text color="gray.600">{program.description}</Text>
        )}

        <HStack spacing={4}>
          <Badge colorScheme="blue">{program.experienceLevel}</Badge>
          <Badge colorScheme="green">{program.split}</Badge>
          <Badge colorScheme="purple">{program.daysPerWeek} days/week</Badge>
        </HStack>

        {program.startDate && (
          <Text>
            Start Date: {format(program.startDate, 'PP')}
          </Text>
        )}
        {program.endDate && (
          <Text>
            End Date: {format(program.endDate, 'PP')}
          </Text>
        )}

        <Box>
          <Heading size="md" mb={4}>Workouts</Heading>
          <Accordion allowMultiple>
            {program.workouts.map((workout, index) => (
              <AccordionItem key={index}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">{workout.name}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Exercise</Th>
                        <Th>Sets</Th>
                        <Th>Reps</Th>
                        <Th>Rest (sec)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {workout.exercises.map((exercise, exerciseIndex) => (
                        <Tr key={exerciseIndex}>
                          <Td>{exercise.name}</Td>
                          <Td>{exercise.sets}</Td>
                          <Td>{exercise.repsMin}-{exercise.repsMax}</Td>
                          <Td>{exercise.restMin}-{exercise.restMax}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {workout.notes && (
                    <Text mt={2} fontSize="sm" color="gray.600">
                      Notes: {workout.notes}
                    </Text>
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Available Equipment</Heading>
          <HStack wrap="wrap" spacing={2}>
            {program.equipmentAvailable.map(equipment => (
              <Badge key={equipment}>{equipment}</Badge>
            ))}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}; 