// src/hooks/useForm.js
import { useState, useCallback } from 'react';

export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // 체크박스인 경우 checked 값 사용
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    // 입력 필드 변경 시 해당 필드 오류 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async (submitFunc) => {
    setIsSubmitting(true);
    
    // 유효성 검사 함수가 있으면 실행
    if (validate) {
      const validationErrors = validate(values);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await submitFunc(values);
      // 성공 시 폼 리셋은 선택적으로 수행
    } catch (error) {
      console.error('폼 제출 오류:', error);
      
      // API 오류 응답에서 필드별 오류 메시지 추출 (있는 경우)
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    resetForm,
    handleSubmit,
    setValues
  };
}