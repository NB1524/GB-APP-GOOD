import React, { useState } from 'react';
import { Box, Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber, StepTitle, StepDescription, StepSeparator, useToast } from '@chakra-ui/react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types/user';
import ExperienceLevelStep from './steps/ExperienceLevelStep';
import GoalsStep from './steps/GoalsStep';
import GymPreferencesStep from './steps/GymPreferencesStep';

const steps = [
  { title: 'Experience', description: 'Your fitness level' },
  { title: 'Goals', description: 'What you want to achieve' },
  { title: 'Gym Setup', description: 'Your gym preferences' },
];

export default function OnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const toast = useToast();
  const methods = useForm<UserProfile>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleNext = async (data: Partial<UserProfile>) => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      try {
        if (!currentUser) {
          throw new Error('No user logged in');
        }

        const userProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || undefined,
          experienceLevel: methods.getValues('experienceLevel'),
          goals: {
            primaryGoal: methods.getValues('goals.primaryGoal'),
            secondaryGoals: methods.getValues('goals.secondaryGoals'),
          },
          gymPreferences: {
            gymName: methods.getValues('gymPreferences.gymName'),
            hasEquipment: methods.getValues('gymPreferences.hasEquipment'),
            equipmentList: methods.getValues('gymPreferences.equipmentList'),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', currentUser.uid), userProfile);

        toast({
          title: 'Profile created!',
          description: 'Your workout plan is being generated...',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        navigate('/dashboard');
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save your profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <FormProvider {...methods}>
      <Box maxW="600px" mx="auto" py={8}>
        <Stepper index={activeStep} mb={8}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              <Box flexShrink={0}>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        <Box p={6} borderRadius="lg" boxShadow="md">
          {activeStep === 0 && (
            <ExperienceLevelStep onNext={handleNext} />
          )}
          {activeStep === 1 && (
            <GoalsStep onNext={handleNext} onBack={handleBack} />
          )}
          {activeStep === 2 && (
            <GymPreferencesStep onNext={handleNext} onBack={handleBack} />
          )}
        </Box>
      </Box>
    </FormProvider>
  );
} 