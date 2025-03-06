import React from 'react';
import { VStack, Button, Heading, Text, useRadioGroup, Box, Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { ExperienceLevel, UserProfile } from '../../../types/user';

interface ExperienceLevelStepProps {
  onNext: (data: Partial<UserProfile>) => void;
}

const experienceLevels: { value: ExperienceLevel; label: string; description: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to working out or returning after a long break',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Consistent gym experience with basic form knowledge',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced lifter with strong form and programming knowledge',
  },
];

export default function ExperienceLevelStep({ onNext }: ExperienceLevelStepProps) {
  const { setValue, watch } = useFormContext<UserProfile>();
  const selectedLevel = watch('experienceLevel');

  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: selectedLevel,
    onChange: (value: string) => setValue('experienceLevel', value as ExperienceLevel),
  });

  const handleNext = () => {
    if (selectedLevel) {
      onNext({ experienceLevel: selectedLevel });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" mb={2}>
        What's your experience level?
      </Heading>
      <Text mb={4}>
        This helps us customize your workout program to your needs.
      </Text>

      <Stack {...getRootProps()} spacing={4}>
        {experienceLevels.map(({ value, label, description }) => {
          const radio = getRadioProps({ value });
          return (
            <Box
              key={value}
              as="label"
              cursor="pointer"
              {...radio}
              p={4}
              borderWidth={1}
              borderRadius="md"
              _checked={{
                bg: 'blue.50',
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
          );
        })}
      </Stack>

      <Button
        mt={6}
        colorScheme="blue"
        size="lg"
        onClick={handleNext}
        isDisabled={!selectedLevel}
      >
        Continue
      </Button>
    </VStack>
  );
} 