import OpenAI from 'openai';
import { WorkoutDay, ExperienceLevel, TrainingSplit } from './workoutProgramService';

interface AIWorkoutGeneratorParams {
  experienceLevel: ExperienceLevel;
  split: TrainingSplit;
  daysPerWeek: number;
  equipment: string[];
  goals?: string[];
  injuries?: string[];
  timePerWorkout?: number;
  focusAreas?: string[];
}

interface RateLimitInfo {
  timestamp: number;
  count: number;
}

class AIWorkoutService {
  private openai: OpenAI;
  private rateLimitWindow: number = 60 * 1000; // 1 minute
  private maxRequestsPerWindow: number = 10;
  private requestHistory: RateLimitInfo[] = [];
  private retryAttempts: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  private cleanOldRateLimitEntries() {
    const now = Date.now();
    this.requestHistory = this.requestHistory.filter(
      entry => now - entry.timestamp < this.rateLimitWindow
    );
  }

  private checkRateLimit(): boolean {
    this.cleanOldRateLimitEntries();
    return this.requestHistory.length < this.maxRequestsPerWindow;
  }

  private addRateLimitEntry() {
    this.requestHistory.push({
      timestamp: Date.now(),
      count: 1
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (
        attempt < this.retryAttempts &&
        (error.status === 429 || error.status === 500 || error.status === 503)
      ) {
        const delayTime = this.retryDelay * Math.pow(2, attempt - 1);
        await this.delay(delayTime);
        return this.retryWithBackoff(operation, attempt + 1);
      }
      throw error;
    }
  }

  async generateWorkoutProgram(params: AIWorkoutGeneratorParams): Promise<WorkoutDay[]> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    try {
      const prompt = this.buildPrompt(params);
      const workoutProgram = await this.retryWithBackoff(async () => {
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an expert personal trainer and exercise scientist. Your task is to create detailed, 
              scientifically-based workout programs tailored to individual needs. Respond only with valid JSON 
              that matches the WorkoutDay[] type, which includes exercises with specific sets, reps, and rest periods.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        if (!response.choices[0].message?.content) {
          throw new Error('No response content from OpenAI');
        }

        try {
          return JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
          throw new Error('Failed to parse OpenAI response as JSON');
        }
      });

      this.addRateLimitEntry();
      return this.validateAndCleanWorkoutProgram(workoutProgram);
    } catch (error: any) {
      console.error('Error generating workout program:', error);
      
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      } else if (error.message.includes('parse')) {
        throw new Error('Failed to generate a valid workout program. Please try again.');
      } else {
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    }
  }

  private buildPrompt(params: AIWorkoutGeneratorParams): string {
    return `Create a ${params.daysPerWeek}-day ${params.split} workout program for a ${
      params.experienceLevel
    } lifter with the following parameters:

    Available Equipment: ${params.equipment.join(', ')}
    ${params.goals ? `Goals: ${params.goals.join(', ')}` : ''}
    ${params.injuries ? `Injuries/Limitations: ${params.injuries.join(', ')}` : ''}
    ${params.timePerWorkout ? `Time per workout: ${params.timePerWorkout} minutes` : ''}
    ${params.focusAreas ? `Focus Areas: ${params.focusAreas.join(', ')}` : ''}

    Create a program that:
    1. Follows proper exercise sequencing (compounds before isolations)
    2. Includes appropriate rest periods based on exercise type and intensity
    3. Provides progressive overload through rep ranges
    4. Balances volume and intensity appropriately for the experience level
    5. Only includes exercises possible with the available equipment
    6. Includes detailed notes for form cues and common mistakes to avoid

    Respond with a JSON array of WorkoutDay objects that includes:
    - Workout name
    - List of exercises with sets, rep ranges, and rest periods
    - Notes for each workout and exercise where relevant`;
  }

  private validateAndCleanWorkoutProgram(program: any[]): WorkoutDay[] {
    if (!Array.isArray(program)) {
      throw new Error('Invalid program format: expected an array');
    }

    return program.map((day, index) => {
      if (!day.name || !Array.isArray(day.exercises)) {
        throw new Error(`Invalid workout day format at index ${index}`);
      }

      return {
        name: String(day.name),
        exercises: day.exercises.map((exercise: any, exerciseIndex: number) => {
          if (!exercise.name || typeof exercise.sets !== 'number') {
            throw new Error(`Invalid exercise format at day ${index}, exercise ${exerciseIndex}`);
          }

          return {
            name: String(exercise.name),
            sets: Number(exercise.sets),
            repsMin: Number(exercise.repsMin) || 8,
            repsMax: Number(exercise.repsMax) || 12,
            restMin: Number(exercise.restMin) || 60,
            restMax: Number(exercise.restMax) || 90,
            notes: exercise.notes ? String(exercise.notes) : undefined
          };
        }),
        notes: day.notes ? String(day.notes) : undefined
      };
    });
  }

  // Method to check if the service is ready to use
  isReady(): boolean {
    return Boolean(this.openai.apiKey);
  }

  // Method to update the API key
  updateApiKey(newKey: string): void {
    this.openai = new OpenAI({
      apiKey: newKey
    });
  }
}

// Initialize with environment variable
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('OPENAI_API_KEY');
if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. AI workout generation will not be available.');
}

export const aiWorkoutService = new AIWorkoutService(OPENAI_API_KEY || '');

// Method to set API key and store it in localStorage
export const setOpenAIApiKey = (apiKey: string): void => {
  localStorage.setItem('OPENAI_API_KEY', apiKey);
  aiWorkoutService.updateApiKey(apiKey);
}; 