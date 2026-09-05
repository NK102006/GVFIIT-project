export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
};

export type ExercisePlan = {
  id: string; // Firestore doc id
  clientId: string; // profiles/{uid} of the client this plan is for
  clientName: string;
  title: string;
  coachName: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
};
