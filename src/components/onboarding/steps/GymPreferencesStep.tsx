import React from 'react';
import {
  VStack,
  Button,
  Heading,
  Text,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { UserProfile } from '../../../types/user';

interface GymPreferencesStepProps {
  onNext: (data: Partial<UserProfile>) => void;
  onBack: () => void;
}

const commonEquipment = [
  'Dumbbells',
  'Barbells',
  'Power Rack',
  'Cable Machine',
  'Smith Machine',
  'Bench Press',
  'Leg Press',
];

export default function GymPreferencesStep({ onNext, onBack }: GymPreferencesStepProps) {
  const { register, setValue, watch } = useFormContext<UserProfile>();
  const hasEquipment = watch('gymPreferences.hasEquipment');
  const gymName = watch('gymPreferences.gymName');
  const equipmentList = watch('gymPreferences.equipmentList') || [];

  const handleEquipmentToggle = (equipment: string) => {
    const currentList = equipmentList || [];
    const newList = currentList.includes(equipment)
      ? currentList.filter((item) => item !== equipment)
      : [...currentList, equipment];
    setValue('gymPreferences.equipmentList', newList);
  };

  const handleNext = () => {
    const gymPreferences = {
      gymName,
      hasEquipment,
      equipmentList: hasEquipment ? equipmentList : [],
    };
    onNext({ gymPreferences });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" mb={2}>
        Tell us about your gym
      </Heading>
      <Text mb={4}>
        This helps us create workouts that match your available equipment.
      </Text>

      <FormControl>
        <FormLabel>Gym Name (Optional)</FormLabel>
        <Input
          placeholder="Enter your gym's name"
          {...register('gymPreferences.gymName')}
        />
      </FormControl>

      <FormControl>
        <Checkbox
          {...register('gymPreferences.hasEquipment')}
          size="lg"
          colorScheme="blue"
        >
          I have access to gym equipment
        </Checkbox>
      </FormControl>

      {hasEquipment && (
        <VStack align="start" spacing={3}>
          <Text fontWeight="bold">Select Available Equipment:</Text>
          <VStack align="start" spacing={2}>
            {commonEquipment.map((equipment) => (
              <Checkbox
                key={equipment}
                isChecked={equipmentList.includes(equipment)}
                onChange={() => handleEquipmentToggle(equipment)}
                colorScheme="blue"
              >
                {equipment}
              </Checkbox>
            ))}
          </VStack>
        </VStack>
      )}

      <HStack spacing={4} justify="space-between" mt={6}>
        <Button size="lg" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button colorScheme="blue" size="lg" onClick={handleNext}>
          Complete Setup
        </Button>
      </HStack>
    </VStack>
  );
} 