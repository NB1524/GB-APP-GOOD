import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutProgramGenerator } from '../WorkoutProgramGenerator';
import { workoutProgramService } from '../../services/workoutProgramService';
import { useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock the workoutProgramService
jest.mock('../../services/workoutProgramService', () => ({
  workoutProgramService: {
    getTemplates: jest.fn(),
    createProgram: jest.fn()
  }
}));

describe('WorkoutProgramGenerator', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com'
  };

  const mockTemplate = {
    name: 'Test Template',
    description: 'A test program template',
    experienceLevel: 'beginner',
    split: 'fullBody',
    daysPerWeek: 3,
    workouts: [
      {
        name: 'Workout A',
        exercises: [
          {
            name: 'Squat',
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            restMin: 120,
            restMax: 180
          }
        ]
      }
    ],
    requiredEquipment: ['barbell', 'rack']
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock useAuth to return a test user
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    
    // Mock getTemplates to return test template
    (workoutProgramService.getTemplates as jest.Mock).mockReturnValue([mockTemplate]);
  });

  it('renders without crashing', () => {
    render(<WorkoutProgramGenerator />);
    expect(screen.getByText('Create Workout Program')).toBeInTheDocument();
  });

  it('updates available templates when criteria change', () => {
    render(<WorkoutProgramGenerator />);

    // Select experience level
    fireEvent.change(screen.getByLabelText(/Experience Level/), {
      target: { value: 'beginner' }
    });

    // Select training split
    fireEvent.change(screen.getByLabelText(/Training Split/), {
      target: { value: 'fullBody' }
    });

    // Select equipment
    fireEvent.click(screen.getByLabelText(/Barbell/));
    fireEvent.click(screen.getByLabelText(/Power Rack/));

    expect(workoutProgramService.getTemplates).toHaveBeenCalledWith(
      'beginner',
      'fullBody',
      ['barbell', 'rack']
    );
  });

  it('displays available templates', async () => {
    render(<WorkoutProgramGenerator />);

    // Select criteria to trigger template loading
    fireEvent.change(screen.getByLabelText(/Experience Level/), {
      target: { value: 'beginner' }
    });

    // Check if template is displayed
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('creates a program when form is submitted', async () => {
    const onProgramCreated = jest.fn();
    render(<WorkoutProgramGenerator onProgramCreated={onProgramCreated} />);

    // Select criteria and template
    fireEvent.change(screen.getByLabelText(/Experience Level/), {
      target: { value: 'beginner' }
    });
    fireEvent.change(screen.getByLabelText(/Training Split/), {
      target: { value: 'fullBody' }
    });
    fireEvent.click(screen.getByLabelText(/Barbell/));
    fireEvent.click(screen.getByLabelText(/Power Rack/));

    // Wait for templates to load and select one
    await waitFor(() => {
      fireEvent.click(screen.getByText('Select Template'));
    });

    // Fill in program details
    fireEvent.change(screen.getByLabelText(/Program Name/), {
      target: { value: 'My Test Program' }
    });

    // Mock successful program creation
    const mockProgramId = 'test-program-id';
    (workoutProgramService.createProgram as jest.Mock).mockResolvedValueOnce(mockProgramId);

    // Submit the form
    fireEvent.click(screen.getByText('Create Program'));

    await waitFor(() => {
      expect(workoutProgramService.createProgram).toHaveBeenCalled();
      expect(onProgramCreated).toHaveBeenCalledWith(mockProgramId);
    });
  });

  it('shows error when user is not logged in', async () => {
    // Mock useAuth to return no user
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(<WorkoutProgramGenerator />);

    // Try to submit form
    fireEvent.click(screen.getByText('Create Program'));

    expect(await screen.findByText('Please log in first')).toBeInTheDocument();
  });

  it('shows error when no template is selected', async () => {
    render(<WorkoutProgramGenerator />);

    // Try to submit form without selecting a template
    fireEvent.click(screen.getByText('Create Program'));

    expect(await screen.findByText('Please select a program template')).toBeInTheDocument();
  });

  it('handles program creation error', async () => {
    render(<WorkoutProgramGenerator />);

    // Select criteria and template
    fireEvent.change(screen.getByLabelText(/Experience Level/), {
      target: { value: 'beginner' }
    });
    fireEvent.change(screen.getByLabelText(/Training Split/), {
      target: { value: 'fullBody' }
    });

    // Wait for templates to load and select one
    await waitFor(() => {
      fireEvent.click(screen.getByText('Select Template'));
    });

    // Mock program creation error
    (workoutProgramService.createProgram as jest.Mock).mockRejectedValueOnce(
      new Error('Test error')
    );

    // Submit the form
    fireEvent.click(screen.getByText('Create Program'));

    expect(await screen.findByText('Error creating workout program')).toBeInTheDocument();
  });
}); 