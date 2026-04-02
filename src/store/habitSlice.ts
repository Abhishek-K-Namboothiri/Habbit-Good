import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Habit frequency is stored as a descriptive string:
 *  - 'daily'         → every day
 *  - 'weekly:0,2,4'  → Mon, Wed, Fri (0=Mon … 6=Sun)
 *  - 'custom:3'      → every 3 days
 */
export interface Habit {
  id: string;
  title: string;
  type: 'checkbox' | 'timer' | 'count';
  frequency: string; // freeform string to support weekly:… and custom:… patterns
  target: number;
  reminderTime?: string | null;
  color: string;
  icon: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  habitId: string;
  date: string;   // YYYY-MM-DD
  completed: boolean;
  value: number;
}

interface HabitState {
  habits: Habit[];
  history: HistoryEntry[];   // today's history (loaded on startup)
}

const initialState: HabitState = {
  habits: [],
  history: [],
};

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setHabits: (state, action: PayloadAction<Habit[]>) => {
      state.habits = action.payload;
    },
    setHistory: (state, action: PayloadAction<HistoryEntry[]>) => {
      state.history = action.payload;
    },
    addHabit: (state, action: PayloadAction<Habit>) => {
      state.habits.unshift(action.payload);
    },
    updateHabit: (state, action: PayloadAction<Habit>) => {
      const index = state.habits.findIndex((h) => h.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = action.payload;
      }
    },
    deleteHabit: (state, action: PayloadAction<string>) => {
      state.habits = state.habits.filter((h) => h.id !== action.payload);
    },
    updateHistory: (state, action: PayloadAction<HistoryEntry>) => {
      const index = state.history.findIndex(
        (e) => e.habitId === action.payload.habitId && e.date === action.payload.date,
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      } else {
        state.history.push(action.payload);
      }
    },
  },
});

export const {
  setHabits,
  setHistory,
  addHabit,
  updateHabit,
  deleteHabit,
  updateHistory,
} = habitSlice.actions;

export const store = configureStore({
  reducer: {
    habits: habitSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
