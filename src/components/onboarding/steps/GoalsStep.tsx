import React from 'react';
import { VStack, Button, Heading, Text, SimpleGrid, Box, HStack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { UserProfile, UserGoals } from '../../../types/user';

interface GoalsStepProps {
  onNext: (data: Partial<UserProfile>) => void;
  onBack: () => void;
}

const primaryGoals = [
  {
    value: 'strength',
    label: 'Build Strength',
    description: 'Focus on increasing strength and power',
  },
  {
    value: 'muscle',
    label: 'Build Muscle',
    description: 'Focus on muscle growth and definition',
  },
  {
    value: 'weight-loss',
    label: 'Lose Weight',
    description: 'Focus on fat loss and conditioning',
  },
  {
    value: 'endurance',
    label: 'Build Endurance',
    description: 'Focus on stamina and cardiovascular fitness',
  },
];

export default function GoalsStep({ onNext, onBack }: GoalsStepProps) {
  const { setValue, watch } = useFormContext<UserProfile>();
  const selectedGoal = watch('goals.primaryGoal');

  const handleGoalSelect = (value: UserGoals['primaryGoal']) => {
    setValue('goals.primaryGoal', value);
  };

  const handleNext = () => {
    if (selectedGoal) {
      onNext({ goals: { primaryGoal: selectedGoal } });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" mb={2}>
        What's your primary fitness goal?
      </Heading>
      <Text mb={4}>
        This will help us focus your workouts on what matters most to you.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {primaryGoals.map(({ value, label, description }) => (
          <Box
            key={value}
            onClick={() => handleGoalSelect(value as UserGoals['primaryGoal'])}
            cursor="pointer"
            p={4}
            borderWidth={1}
            borderRadius="md"
            bg={selectedGoal === value ? 'blue.50' : 'white'}
            borderColor={selectedGoal === value ? 'blue.500' : 'gray.200'}
            _hover={{
              borderColor: 'blue.500',
            }}
          >
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{label}</Text>
              <Text fontSize="sm" color="gray.600">
                {description}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <HStack spacing={4} justify="space-between" mt={6}>
        <Button size="lg" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleNext}
          isDisabled={!selectedGoal}
        >
          Continue
        </Button>
      </HStack>
    </VStack>
  );
} 