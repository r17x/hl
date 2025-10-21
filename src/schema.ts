export type Role = 'patient' | 'doctor' | 'system';

export type Message = {
  role: Role;
  content: string;
}

