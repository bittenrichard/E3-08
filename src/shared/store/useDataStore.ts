// Local: src/shared/store/useDataStore.ts

import { create } from 'zustand';
import { JobPosting } from '../../features/screening/types';
import { Candidate } from '../../shared/types';
import { UserProfile } from '../../features/auth/types';

// INSTRUÇÃO: Esta linha lê a variável de ambiente que configuramos no Docker.
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface DataState {
  jobs: JobPosting[];
  candidates: Candidate[];
  isDataLoading: boolean;
  error: string | null;
  fetchAllData: (profile: UserProfile) => Promise<void>;
  addJob: (job: JobPosting) => void;
  updateJobInStore: (updatedJob: JobPosting) => void;
  deleteJobById: (jobId: number) => Promise<void>;
  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => void;
}

export const useDataStore = create<DataState>((set) => ({
  jobs: [],
  candidates: [],
  isDataLoading: false,
  error: null,

  fetchAllData: async (profile: UserProfile) => {
    set({ isDataLoading: true, error: null });
    try {
      // INSTRUÇÃO: A URL foi corrigida para usar a variável API_URL.
      const response = await fetch(`${API_URL}/api/data/all/${profile.id}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do servidor.');
      }
      const { jobs, candidates } = await response.json();
      
      set({ jobs: jobs, candidates: candidates });
    } catch (err: any) {
      console.error("Erro ao buscar dados (useDataStore):", err);
      set({ error: 'Falha ao carregar dados.', jobs: [], candidates: [] });
    } finally {
      set({ isDataLoading: false });
    }
  },

  addJob: (job: JobPosting) => {
    set((state) => ({ jobs: [job, ...state.jobs] }));
  },

  updateJobInStore: (updatedJob: JobPosting) => {
    set((state) => ({
      jobs: state.jobs.map(job => job.id === updatedJob.id ? updatedJob : job)
    }));
  },

  deleteJobById: async (jobId: number) => {
    try {
      // INSTRUÇÃO: A URL foi corrigida para usar a variável API_URL.
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Não foi possível excluir a vaga.");
      }
      set((state) => ({
        jobs: state.jobs.filter(job => job.id !== jobId)
      }));
    } catch (error) {
      console.error("Erro ao deletar vaga (useDataStore):", error);
      throw error;
    }
  },

  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => {
    set((state) => ({
      candidates: state.candidates.map(c => 
        c.id === candidateId ? { ...c, status: { id: 0, value: newStatus } } : c
      )
    }));
  },
}));