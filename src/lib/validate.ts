export interface FormData {
  name: string;
  gender?: string;
  age: string;
  email: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateForm(data: Partial<FormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || !data.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  if (!data.age) {
    errors.push({ field: 'age', message: 'Age is required' });
  } else {
    const ageNum = parseInt(data.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 110) {
      errors.push({ field: 'age', message: 'Age must be between 18 and 110' });
    }
  }

  if (!data.email || !data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  return errors;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
