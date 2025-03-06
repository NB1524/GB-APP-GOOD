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
  Checkbox,
  Stack,
  Input,
  Textarea,
  HStack,
  Badge
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import {
  workoutProgramService,
  ExperienceLevel,
  TrainingSplit,
  WorkoutProgram,
  ProgramTemplate
} from '../services/workoutProgramService';

const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbells' },
  { id: 'cables', label: 'Cable Machine' },
  { id: 'machines', label: 'Weight Machines' },
  { id: 'bench', label: 'Bench' },
  { id: 'rack', label: 'Power Rack' },
  { id: 'pullupBar', label: 'Pull-up Bar' }
];

interface WorkoutProgramGeneratorProps {
  onProgramCreated?: (programId: string) => void;
}

export const WorkoutProgramGenerator: React.FC<WorkoutProgramGeneratorProps> = ({
  onProgramCreated
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<ProgramTemplate[]>([]);

  const [formData, setFormData] = useState({
    experienceLevel: '' as ExperienceLevel,
    split: '' as TrainingSplit,
    daysPerWeek: 3,
    equipment: [] as string[],
    programName: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleEquipmentChange = (equipmentId: string) => {
    setFormData(prev => {
      const equipment = prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(id => id !== equipmentId)
        : [...prev.equipment, equipmentId];

      // Update available templates based on new equipment selection
      const templates = workoutProgramService.getTemplates(
        prev.experienceLevel || undefined,
        prev.split || undefined,
        equipment
      );
      setAvailableTemplates(templates);
      setSelectedTemplate(null);

      return { ...prev, equipment };
    });
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | string[]
  ) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Update available templates based on new criteria
      const templates = workoutProgramService.getTemplates(
        newData.experienceLevel || undefined,
        newData.split || undefined,
        newData.equipment
      );
      setAvailableTemplates(templates);
      setSelectedTemplate(null);

      return newData;
    });
  };

  const handleTemplateSelect = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      programName: template.name,
      description: template.description,
      experienceLevel: template.experienceLevel,
      split: template.split,
      daysPerWeek: template.daysPerWeek
    }));
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

    if (!selectedTemplate) {
      toast({
        title: 'Please select a program template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      const programData: Omit<WorkoutProgram, 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        name: formData.programName,
        description: formData.description,
        experienceLevel: formData.experienceLevel,
        split: formData.split,
        daysPerWeek: formData.daysPerWeek,
        workouts: selectedTemplate.workouts,
        equipmentAvailable: formData.equipment,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        isActive: true
      };

      const programId = await workoutProgramService.createProgram(programData);
      
      toast({
        title: 'Workout program created!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onProgramCreated?.(programId);
    } catch (error) {
      console.error('Error creating workout program:', error);
      toast({
        title: 'Error creating workout program',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="100%" maxW="800px" p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Create Workout Program</Heading>

        <FormControl isRequired>
          <FormLabel>Experience Level</FormLabel>
          <Select
            value={formData.experienceLevel}
            onChange={(e) => handleInputChange('experienceLevel', e.target.value as ExperienceLevel)}
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
            onChange={(e) => handleInputChange('split', e.target.value as TrainingSplit)}
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
            onChange={(e) => handleInputChange('daysPerWeek', Number(e.target.value))}
          >
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days</option>
            <option value={6}>6 days</option>
          </Select>
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

        {availableTemplates.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Available Templates</Heading>
            <Accordion allowMultiple>
              {availableTemplates.map((template, index) => (
                <AccordionItem key={index}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">{template.name}</Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue">{template.experienceLevel}</Badge>
                          <Badge colorScheme="green">{template.daysPerWeek} days/week</Badge>
                          <AccordionIcon />
                        </HStack>
                      </HStack>
                    </Box>
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="stretch" spacing={4}>
                      <Text>{template.description}</Text>
                      
                      <Box>
                        <Text fontWeight="bold" mb={2}>Required Equipment:</Text>
                        <HStack wrap="wrap" spacing={2}>
                          {template.requiredEquipment.map(eq => (
                            <Badge key={eq}>{eq}</Badge>
                          ))}
                        </HStack>
                      </Box>

                      <Box>
                        <Text fontWeight="bold" mb={2}>Workouts:</Text>
                        {template.workouts.map((workout, workoutIndex) => (
                          <Box key={workoutIndex} mb={4}>
                            <Heading size="sm" mb={2}>{workout.name}</Heading>
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
                          </Box>
                        ))}
                      </Box>

                      <Button
                        colorScheme="blue"
                        onClick={() => handleTemplateSelect(template)}
                        isDisabled={selectedTemplate === template}
                      >
                        Select Template
                      </Button>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        )}

        {selectedTemplate && (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Program Name</FormLabel>
              <Input
                value={formData.programName}
                onChange={(e) => handleInputChange('programName', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Create Program
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}; 