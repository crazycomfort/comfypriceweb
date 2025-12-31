// Form validation utilities - Usability improvement
import { EstimateInput } from "./estimate-engine";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateHomeownerInput(input: Partial<EstimateInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.zipCode || input.zipCode.trim().length === 0) {
    errors.push({ field: "zipCode", message: "ZIP code is required" });
  } else if (!/^\d{5}(-\d{4})?$/.test(input.zipCode.trim())) {
    errors.push({ field: "zipCode", message: "Please enter a valid ZIP code" });
  }

  if (!input.squareFootage || input.squareFootage <= 0) {
    errors.push({ field: "squareFootage", message: "Square footage must be greater than 0" });
  } else if (input.squareFootage > 50000) {
    errors.push({ field: "squareFootage", message: "Square footage seems too large. Please verify." });
  }

  if (!input.floors || input.floors < 1) {
    errors.push({ field: "floors", message: "Number of floors is required" });
  }

  if (!input.homeAge) {
    errors.push({ field: "homeAge", message: "Home age is required" });
  }

  if (!input.preferences) {
    errors.push({ field: "preferences", message: "Preferences are required" });
  } else {
    if (!input.preferences.efficiencyLevel || input.preferences.efficiencyLevel.trim() === "") {
      errors.push({ field: "efficiencyLevel", message: "Efficiency level is required" });
    }
    if (!input.preferences.systemType || input.preferences.systemType.trim() === "") {
      errors.push({ field: "systemType", message: "System type is required" });
    }
    // smartFeatures can be false (user said no), but not undefined (user didn't answer)
    if (input.preferences.smartFeatures === undefined) {
      errors.push({ field: "smartFeatures", message: "Please indicate interest in smart features" });
    }
  }

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0].message;
  return `Please fix the following: ${errors.map(e => e.message).join(", ")}`;
}


