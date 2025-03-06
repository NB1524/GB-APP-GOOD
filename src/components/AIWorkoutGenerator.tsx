import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Button,
  Text,
  useToast,
  Checkbox,
  Stack,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import {
  workoutProgramService,
  ExperienceLevel,
  TrainingSplit,
  WorkoutProgram,
  WorkoutDay
} from '../services/workoutProgramService';
import { aiWorkoutService, setOpenAIApiKey } from '../services/aiWorkoutService';
import { EditIcon, RepeatIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';

const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbells' },
  { id: 'cables', label: 'Cable Machine' },
  { id: 'machines', label: 'Weight Machines' },
  { id: 'bench', label: 'Bench' },
  { id: 'rack', label: 'Power Rack' },
  { id: 'pullupBar', label: 'Pull-up Bar' }
];

const COMMON_GOALS = [
  'Build Muscle',
  'Lose Fat',
  'Increase Strength',
  'Improve Endurance',
  'General Fitness'
];

const FOCUS_AREAS = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Back',
  'Arms',
  'Shoulders',
  'Chest',
  'Legs'
];

interface AIWorkoutGeneratorProps {
  onProgramCreated?: (programId: string) => void;
}

export const AIWorkoutGenerator: React.FC<AIWorkoutGeneratorProps> = ({
  onProgramCreated
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<WorkoutDay[] | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!aiWorkoutService.isReady());
  const [editingWorkout, setEditingWorkout] = useState<{
    dayIndex: number;
    exerciseIndex?: number;
  } | null>(null);
  const [editingExercise, setEditingExercise] = useState<{
    name: string;
    sets: number;
    repsMin: number;
    repsMax: number;
    restMin: number;
    restMax: number;
    notes?: string;
  } | null>(null);
  const [replacementSuggestions, setReplacementSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    experienceLevel: '' as ExperienceLevel,
    split: '' as TrainingSplit,
    daysPerWeek: 3,
    equipment: [] as string[],
    goals: [] as string[],
    injuries: [] as string[],
    timePerWorkout: 60,
    focusAreas: [] as string[],
    programName: '',
    description: '',
    startDate: '',
    endDate: '',
    customGoal: '',
    customInjury: ''
  });

  const handleEquipmentChange = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(id => id !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  const handleArrayItemToggle = (
    field: 'goals' | 'focusAreas',
    item: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleAddCustomItem = (field: 'goals' | 'injuries') => {
    const customField = `custom${field.charAt(0).toUpperCase() + field.slice(1)}` as 'customGoal' | 'customInjury';
    const value = formData[customField].trim();
    
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value],
        [customField]: ''
      }));
    }
  };

  const handleRemoveItem = (field: 'goals' | 'injuries', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const handleApiKeySubmit = (apiKey: string) => {
    try {
      setOpenAIApiKey(apiKey);
      setShowApiKeyInput(false);
      toast({
        title: 'API Key Saved',
        description: 'Your API key has been saved securely.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Saving API Key',
        description: 'Please check your API key and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerateProgram = async () => {
    if (!user) {
      toast({
        title: 'Please log in first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!aiWorkoutService.isReady()) {
      setShowApiKeyInput(true);
      return;
    }

    try {
      setIsLoading(true);
      const program = await aiWorkoutService.generateWorkoutProgram({
        experienceLevel: formData.experienceLevel,
        split: formData.split,
        daysPerWeek: formData.daysPerWeek,
        equipment: formData.equipment,
        goals: formData.goals,
        injuries: formData.injuries,
        timePerWorkout: formData.timePerWorkout,
        focusAreas: formData.focusAreas
      });

      setGeneratedProgram(program);
      toast({
        title: 'Workout Program Generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error generating program:', error);
      toast({
        title: 'Error Generating Program',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!generatedProgram) return;

    try {
      setIsLoading(true);

      const programData: Omit<WorkoutProgram, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user!.uid,
        name: formData.programName || 'AI Generated Program',
        description: formData.description || 'Custom program generated by AI',
        experienceLevel: formData.experienceLevel,
        split: formData.split,
        daysPerWeek: formData.daysPerWeek,
        workouts: generatedProgram,
        equipmentAvailable: formData.equipment,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        isActive: true
      };

      const programId = await workoutProgramService.createProgram(programData);
      
      toast({
        title: 'Workout program saved!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onProgramCreated?.(programId);
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: 'Error saving program',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExercise = (dayIndex: number, exerciseIndex: number) => {
    setEditingWorkout({ dayIndex, exerciseIndex });
    setEditingExercise({
      ...generatedProgram![dayIndex].exercises[exerciseIndex]
    });
  };

  const handleUpdateExercise = async () => {
    if (!editingWorkout || !editingExercise || !generatedProgram) return;

    const { dayIndex, exerciseIndex } = editingWorkout;
    if (exerciseIndex === undefined) return;

    const updatedProgram = [...generatedProgram];
    updatedProgram[dayIndex] = {
      ...updatedProgram[dayIndex],
      exercises: [
        ...updatedProgram[dayIndex].exercises.slice(0, exerciseIndex),
        editingExercise,
        ...updatedProgram[dayIndex].exercises.slice(exerciseIndex + 1)
      ]
    };

    setGeneratedProgram(updatedProgram);
    setEditingWorkout(null);
    setEditingExercise(null);
  };

  const handleRequestReplacement = async (dayIndex: number, exerciseIndex: number) => {
    if (!generatedProgram) return;

    try {
      setIsLoading(true);
      const exercise = generatedProgram[dayIndex].exercises[exerciseIndex];
      const prompt = `Suggest 3 alternative exercises to replace ${exercise.name} that:
      1. Target similar muscle groups
      2. Use available equipment: ${formData.equipment.join(', ')}
      3. Match the experience level: ${formData.experienceLevel}
      4. Maintain similar intensity and purpose in the workout
      
      Return only a JSON array of exercise names.`;

      const response = await aiWorkoutService.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a knowledgeable fitness expert." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      const suggestions = JSON.parse(response.choices[0].message?.content || '[]');
      setReplacementSuggestions(suggestions);
      setEditingWorkout({ dayIndex, exerciseIndex });
    } catch (error) {
      console.error('Error getting replacement suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get replacement suggestions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceExercise = (newExerciseName: string) => {
    if (!editingWorkout || !generatedProgram) return;

    const { dayIndex, exerciseIndex } = editingWorkout;
    if (exerciseIndex === undefined) return;

    const updatedProgram = [...generatedProgram];
    const oldExercise = updatedProgram[dayIndex].exercises[exerciseIndex];
    
    updatedProgram[dayIndex] = {
      ...updatedProgram[dayIndex],
      exercises: [
        ...updatedProgram[dayIndex].exercises.slice(0, exerciseIndex),
        {
          ...oldExercise,
          name: newExerciseName,
          notes: `Replaced ${oldExercise.name} with ${newExerciseName}. Maintain similar form and intensity.`
        },
        ...updatedProgram[dayIndex].exercises.slice(exerciseIndex + 1)
      ]
    };

    setGeneratedProgram(updatedProgram);
    setEditingWorkout(null);
    setReplacementSuggestions([]);
  };

  if (showApiKeyInput) {
    return (
      <Box w="100%" maxW="800px" p={4}>
        <VStack spacing={4}>
          <Heading size="md">OpenAI API Key Required</Heading>
          <Text>Please enter your OpenAI API key to use the AI workout generator.</Text>
          <FormControl>
            <FormLabel>API Key</FormLabel>
            <Input
              type="password"
              placeholder="sk-..."
              onChange={(e) => handleApiKeySubmit(e.target.value)}
            />
          </FormControl>
          <Text fontSize="sm" color="gray.600">
            Your API key will be stored securely in your browser.
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    return (
      <Alert
        status="warning"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          AI Program Generation Unavailable
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          OpenAI API key is not configured. Please contact the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box w="100%" maxW="800px" p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">AI Workout Program Generator</Heading>

        <FormControl isRequired>
          <FormLabel>Experience Level</FormLabel>
          <Select
            value={formData.experienceLevel}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              experienceLevel: e.target.value as ExperienceLevel
            }))}
          >
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Training Split</FormLabel>
          <Select
            value={formData.split}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              split: e.target.value as TrainingSplit
            }))}
          >
            <option value="">Select Split</option>
            <option value="fullBody">Full Body</option>
            <option value="upperLower">Upper/Lower</option>
            <option value="pushPullLegs">Push/Pull/Legs</option>
            <option value="bodyPart">Body Part Split</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Days per Week</FormLabel>
          <Select
            value={formData.daysPerWeek}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              daysPerWeek: Number(e.target.value)
            }))}
          >
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days</option>
            <option value={6}>6 days</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Time per Workout (minutes)</FormLabel>
          <NumberInput
            value={formData.timePerWorkout}
            onChange={(_, value) => setFormData(prev => ({
              ...prev,
              timePerWorkout: value
            }))}
            min={30}
            max={180}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Available Equipment</FormLabel>
          <Stack spacing={2}>
            {EQUIPMENT_OPTIONS.map(equipment => (
              <Checkbox
                key={equipment.id}
                isChecked={formData.equipment.includes(equipment.id)}
                onChange={() => handleEquipmentChange(equipment.id)}
              >
                {equipment.label}
              </Checkbox>
            ))}
          </Stack>
        </FormControl>

        <FormControl>
          <FormLabel>Goals</FormLabel>
          <Stack spacing={2}>
            {COMMON_GOALS.map(goal => (
              <Checkbox
                key={goal}
                isChecked={formData.goals.includes(goal)}
                onChange={() => handleArrayItemToggle('goals', goal)}
              >
                {goal}
              </Checkbox>
            ))}
          </Stack>
          <HStack mt={2}>
            <Input
              placeholder="Add custom goal"
              value={formData.customGoal}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                customGoal: e.target.value
              }))}
            />
            <Button onClick={() => handleAddCustomItem('goals')}>Add</Button>
          </HStack>
          <HStack mt={2} wrap="wrap">
            {formData.goals.filter(goal => !COMMON_GOALS.includes(goal)).map(goal => (
              <Tag key={goal} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                <TagLabel>{goal}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveItem('goals', goal)} />
              </Tag>
            ))}
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel>Injuries/Limitations</FormLabel>
          <HStack>
            <Input
              placeholder="Add injury or limitation"
              value={formData.customInjury}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                customInjury: e.target.value
              }))}
            />
            <Button onClick={() => handleAddCustomItem('injuries')}>Add</Button>
          </HStack>
          <HStack mt={2} wrap="wrap">
            {formData.injuries.map(injury => (
              <Tag key={injury} size="md" borderRadius="full" variant="solid" colorScheme="red">
                <TagLabel>{injury}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveItem('injuries', injury)} />
              </Tag>
            ))}
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel>Focus Areas</FormLabel>
          <Stack spacing={2}>
            {FOCUS_AREAS.map(area => (
              <Checkbox
                key={area}
                isChecked={formData.focusAreas.includes(area)}
                onChange={() => handleArrayItemToggle('focusAreas', area)}
              >
                {area}
              </Checkbox>
            ))}
          </Stack>
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleGenerateProgram}
          isLoading={isLoading}
          isDisabled={!formData.experienceLevel || !formData.split || formData.equipment.length === 0}
        >
          Generate Program
        </Button>

        {generatedProgram && (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Generated Program</Heading>

            <FormControl isRequired>
              <FormLabel>Program Name</FormLabel>
              <Input
                value={formData.programName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  programName: e.target.value
                }))}
                placeholder="AI Generated Program"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Custom program generated by AI"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endDate: e.target.value
                }))}
              />
            </FormControl>

            <Accordion allowMultiple>
              {generatedProgram.map((workout, dayIndex) => (
                <AccordionItem key={dayIndex}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm">{workout.name}</Heading>
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
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <Tr key={exerciseIndex}>
                            <Td>{exercise.name}</Td>
                            <Td>{exercise.sets}</Td>
                            <Td>{exercise.repsMin}-{exercise.repsMax}</Td>
                            <Td>{exercise.restMin}-{exercise.restMax}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Edit Exercise">
                                  <IconButton
                                    aria-label="Edit exercise"
                                    icon={<EditIcon />}
                                    size="sm"
                                    onClick={() => handleEditExercise(dayIndex, exerciseIndex)}
                                  />
                                </Tooltip>
                                <Tooltip label="Replace Exercise">
                                  <IconButton
                                    aria-label="Replace exercise"
                                    icon={<RepeatIcon />}
                                    size="sm"
                                    onClick={() => handleRequestReplacement(dayIndex, exerciseIndex)}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
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

            {/* Exercise Edit Modal */}
            <Modal isOpen={Boolean(editingExercise)} onClose={() => {
              setEditingWorkout(null);
              setEditingExercise(null);
              setReplacementSuggestions([]);
            }}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  {replacementSuggestions.length > 0 ? 'Replace Exercise' : 'Edit Exercise'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {replacementSuggestions.length > 0 ? (
                    <VStack align="stretch" spacing={4}>
                      <Text>Select a replacement exercise:</Text>
                      {replacementSuggestions.map((exercise, index) => (
                        <Button
                          key={index}
                          onClick={() => handleReplaceExercise(exercise)}
                          variant="outline"
                        >
                          {exercise}
                        </Button>
                      ))}
                    </VStack>
                  ) : (
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Exercise Name</FormLabel>
                        <Input
                          value={editingExercise?.name || ''}
                          onChange={(e) => setEditingExercise(prev => prev ? {
                            ...prev,
                            name: e.target.value
                          } : null)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Sets</FormLabel>
                        <NumberInput
                          value={editingExercise?.sets || 0}
                          onChange={(_, value) => setEditingExercise(prev => prev ? {
                            ...prev,
                            sets: value
                          } : null)}
                          min={1}
                          max={10}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <HStack spacing={4}>
                        <FormControl>
                          <FormLabel>Min Reps</FormLabel>
                          <NumberInput
                            value={editingExercise?.repsMin || 0}
                            onChange={(_, value) => setEditingExercise(prev => prev ? {
                              ...prev,
                              repsMin: value
                            } : null)}
                            min={1}
                            max={100}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Max Reps</FormLabel>
                          <NumberInput
                            value={editingExercise?.repsMax || 0}
                            onChange={(_, value) => setEditingExercise(prev => prev ? {
                              ...prev,
                              repsMax: value
                            } : null)}
                            min={1}
                            max={100}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </HStack>
                      <HStack spacing={4}>
                        <FormControl>
                          <FormLabel>Min Rest (sec)</FormLabel>
                          <NumberInput
                            value={editingExercise?.restMin || 0}
                            onChange={(_, value) => setEditingExercise(prev => prev ? {
                              ...prev,
                              restMin: value
                            } : null)}
                            min={0}
                            max={300}
                            step={15}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Max Rest (sec)</FormLabel>
                          <NumberInput
                            value={editingExercise?.restMax || 0}
                            onChange={(_, value) => setEditingExercise(prev => prev ? {
                              ...prev,
                              restMax: value
                            } : null)}
                            min={0}
                            max={300}
                            step={15}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </HStack>
                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          value={editingExercise?.notes || ''}
                          onChange={(e) => setEditingExercise(prev => prev ? {
                            ...prev,
                            notes: e.target.value
                          } : null)}
                        />
                      </FormControl>
                    </VStack>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={() => {
                    setEditingWorkout(null);
                    setEditingExercise(null);
                    setReplacementSuggestions([]);
                  }}>
                    Cancel
                  </Button>
                  {!replacementSuggestions.length && (
                    <Button colorScheme="blue" onClick={handleUpdateExercise}>
                      Save Changes
                    </Button>
                  )}
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Button
              colorScheme="green"
              onClick={handleSaveProgram}
              isLoading={isLoading}
            >
              Save Program
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}; 