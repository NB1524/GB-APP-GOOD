import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  SimpleGrid,
  Select,
  Button,
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Spinner,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Exercise, MuscleGroup, Equipment } from '../../types/exercise';
import { searchExercises } from '../../services/exerciseService';

export default function ExerciseBrowser() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | ''>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Exercise['difficulty'] | ''>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params: Parameters<typeof searchExercises>[0] = {};
      
      if (selectedMuscleGroup) params.muscleGroups = [selectedMuscleGroup];
      if (selectedEquipment) params.equipment = [selectedEquipment];
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (searchTerm) params.searchTerm = searchTerm;
      
      const results = await searchExercises(params);
      setExercises(results);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load exercises',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    onOpen();
  };

  const muscleGroups: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'full_body'
  ];

  const equipmentTypes: Equipment[] = [
    'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 
    'kettlebell', 'resistance_band', 'smith_machine'
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Exercise Library</Heading>

        <HStack spacing={4} wrap="wrap">
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Select
            placeholder="Muscle Group"
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value as MuscleGroup)}
            maxW="200px"
          >
            {muscleGroups.map(group => (
              <option key={group} value={group}>
                {group.replace('_', ' ').charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Equipment"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value as Equipment)}
            maxW="200px"
          >
            {equipmentTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Exercise['difficulty'])}
            maxW="200px"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
          <Button onClick={fetchExercises}>Search</Button>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                cursor="pointer"
                onClick={() => handleExerciseClick(exercise)}
                _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
              >
                <CardHeader>
                  <Heading size="md">{exercise.name}</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Text noOfLines={2}>{exercise.description}</Text>
                    <HStack wrap="wrap">
                      {exercise.muscleGroups.map((group) => (
                        <Badge key={group} colorScheme="blue">
                          {group}
                        </Badge>
                      ))}
                    </HStack>
                    <Badge colorScheme={
                      exercise.difficulty === 'beginner' ? 'green' :
                      exercise.difficulty === 'intermediate' ? 'yellow' : 'red'
                    }>
                      {exercise.difficulty}
                    </Badge>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedExercise?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedExercise && (
              <VStack align="start" spacing={4}>
                <Text>{selectedExercise.description}</Text>
                
                <Box>
                  <Heading size="sm" mb={2}>Instructions:</Heading>
                  <VStack align="start" spacing={2}>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <Text key={index}>{index + 1}. {instruction}</Text>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Tips:</Heading>
                  <VStack align="start" spacing={2}>
                    {selectedExercise.tips.map((tip, index) => (
                      <Text key={index}>• {tip}</Text>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Target Muscles:</Heading>
                  <HStack wrap="wrap">
                    {selectedExercise.targetMuscles.map((muscle) => (
                      <Badge key={muscle} colorScheme="green">{muscle}</Badge>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Secondary Muscles:</Heading>
                  <HStack wrap="wrap">
                    {selectedExercise.secondaryMuscles.map((muscle) => (
                      <Badge key={muscle} colorScheme="purple">{muscle}</Badge>
                    ))}
                  </HStack>
                </Box>

                {selectedExercise.videoUrl && (
                  <Button
                    as="a"
                    href={selectedExercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    colorScheme="blue"
                  >
                    Watch Video Demo
                  </Button>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
} 