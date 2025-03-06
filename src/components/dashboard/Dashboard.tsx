import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Badge,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types/user';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load your profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Welcome back!</Heading>
            <Text color="gray.600">{userProfile?.email}</Text>
          </Box>
          <Button onClick={handleLogout}>Log Out</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">Experience Level</Heading>
            </CardHeader>
            <CardBody>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                {userProfile?.experienceLevel}
              </Badge>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Fitness Goals</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                  {userProfile?.goals.primaryGoal}
                </Badge>
                {userProfile?.goals.secondaryGoals?.map((goal) => (
                  <Badge key={goal} colorScheme="gray" fontSize="sm">
                    {goal}
                  </Badge>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Gym Setup</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                {userProfile?.gymPreferences.gymName && (
                  <Text fontWeight="bold">{userProfile.gymPreferences.gymName}</Text>
                )}
                <Text>
                  {userProfile?.gymPreferences.hasEquipment
                    ? 'Has access to equipment'
                    : 'No equipment access'}
                </Text>
                {userProfile?.gymPreferences.hasEquipment && (
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Available Equipment:</Text>
                    {userProfile.gymPreferences.equipmentList?.map((equipment) => (
                      <Badge key={equipment} colorScheme="purple">
                        {equipment}
                      </Badge>
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Placeholder for future workout plan section */}
        <Card>
          <CardHeader>
            <Heading size="md">Your Workout Plan</Heading>
          </CardHeader>
          <CardBody>
            <Text color="gray.600">
              Your personalized workout plan is being generated based on your preferences.
              Check back soon!
            </Text>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
} 