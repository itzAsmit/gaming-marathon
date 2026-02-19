// TypeScript type definitions for Supabase tables

// Example table definition for a Todo table
export type Todo = {
  id: number;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

// Example table definition for a Note table
export type Note = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

// Add additional table definitions as needed.