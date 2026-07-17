import { useState, useCallback } from "react";

export const useFormValidation = (initialValues = {}, validators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (validators[field]) {
      const error = validators[field](value, { ...values, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: error || "" }));
    }
  }, [validators, values]);

  const setMultiple = useCallback((updates) => {
    setValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    const currentValues = values;

    for (const [field, validator] of Object.entries(validators)) {
      const error = validator(currentValues[field], currentValues);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {})
    );

    return isValid;
  }, [validators, values]);

  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid =
    Object.keys(errors).filter((k) => errors[k]).length === 0 &&
    Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setMultiple,
    setValues,
    validate,
    reset,
    isValid,
  };
};

export const required = (message = "This field is required") => (value) => {
  if (!value || (typeof value === "string" && !value.trim())) return message;
  return "";
};

export const minLength = (min, message) => (value) => {
  if (!value || value.length < min) return message || `Must be at least ${min} characters`;
  return "";
};

export const maxLength = (max, message) => (value) => {
  if (value && value.length > max) return message || `Must not exceed ${max} characters`;
  return "";
};

export const isEmail = (message = "Invalid email address") => (value) => {
  if (!value) return "";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return message;
  return "";
};

export const composeValidators = (...validators) => (value, allValues) => {
  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) return error;
  }
  return "";
};
