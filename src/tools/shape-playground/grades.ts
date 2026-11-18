export const gradeIds = ['k', '1', '2', '3'] as const
export type Grade = typeof gradeIds[number]
export type GradeActivity = 'count' | 'patterns' | 'sort' | 'mystery-picture' | 'nametag'

export const gradeLabels: Record<Grade, string> = {
  k: 'Kindergarten',
  '1': 'Grade 1',
  '2': 'Grade 2',
  '3': 'Grade 3',
}

export const gradeActivities: Record<Grade, readonly GradeActivity[]> = {
  k: ['count', 'patterns', 'sort'],
  '1': ['count', 'patterns', 'sort', 'mystery-picture'],
  '2': ['count', 'patterns', 'sort', 'nametag'],
  '3': ['count', 'patterns', 'sort', 'nametag'],
}

export function isGrade(value: string | undefined): value is Grade {
  return value !== undefined && gradeIds.some((grade) => grade === value)
}

export function isGradeActivity(grade: Grade, activity: string | undefined): activity is GradeActivity {
  return activity !== undefined && gradeActivities[grade].some((item) => item === activity)
}
