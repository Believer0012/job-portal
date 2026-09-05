export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function formatSalaryRange(salaryMin: number | null, salaryMax: number | null) {
  const format = (value: number) => value.toLocaleString('en-US')
  if (salaryMin != null && salaryMax != null) return `${format(salaryMin)} - ${format(salaryMax)}`
  if (salaryMin != null) return `From ${format(salaryMin)}`
  if (salaryMax != null) return `Up to ${format(salaryMax)}`
  return 'Not specified'
}
