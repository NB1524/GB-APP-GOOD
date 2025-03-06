export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserGoals {
  primaryGoal: 'strength' | 'muscle' | 'weight-loss' | 'endurance';
  secondaryGoals?: string[];
}

export interface GymPreferences {
  gymName?: string;
  hasEquipment: boolean;
  equipmentList?: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  experienceLevel: ExperienceLevel;
  goals: UserGoals;
  gymPreferences: GymPreferences;
  createdAt: Date;
  updatedAt: Date;
} 