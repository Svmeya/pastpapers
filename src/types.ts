/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Subject = 
  | "Math" 
  | "English" 
  | "Chemistry" 
  | "Physics" 
  | "Biology" 
  | "Geography" 
  | "History" 
  | "Economics";

export type Stream = "Natural Science" | "Social Science";

export type Category = "Periodically" | "Topically";

export interface PastPaper {
  id: string;
  title: string;
  year?: number;
  topic?: string;
  description?: string;
  unitNumber?: string;
  url: string;
  content: string; // Mock content for the AI to "read"
}

export interface SubjectData {
  name: Subject;
  periodical: PastPaper[];
  topical: PastPaper[];
}

export interface StreamData {
  name: Stream;
  subjects: SubjectData[];
}

export interface GradeData {
  grade: number;
  subjects?: SubjectData[];
  streams?: StreamData[];
}

export interface School {
  id: string;
  name: string;
  location: string;
  image: string;
  grades: GradeData[];
}
