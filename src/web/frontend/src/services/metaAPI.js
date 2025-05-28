// src/services/metaAPI.js
import api from './api';

export const metaAPI = {
  // 1. 퍼블릭 메타데이터 API
  
  // 1-1. 전체 칵테일 레시피 조회 (기본 레시피만)
  getAllCocktails: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters // name, abv_min, abv_max, method 등 필터 지원
      }).toString();
      
      const response = await api.get(`/api/public/meta/cocktails?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('칵테일 목록 조회 실패', error);
      throw error;
    }
  },
  
  // 1-2. 특정 칵테일 레시피 조회
  getCocktailById: async (recipeId) => {
    try {
      const response = await api.get(`/api/public/meta/cocktails/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('특정 칵테일 조회 실패', error);
      throw error;
    }
  },
  
  // 1-2a. 시그니처 칵테일 레시피 조회 (추가된 API)
  getAllSignatureCocktails: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();
      
      const response = await api.get(`/api/public/meta/cocktails/signature?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('시그니처 칵테일 목록 조회 실패', error);
      throw error;
    }
  },
  
  // 1-3. 전체 재료 조회 API
  getAllIngredients: async (page = 1, limit = 100, searchName = '') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        name: searchName
      }).toString();
      
      const response = await api.get(`/api/public/meta/ingredients?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('재료 목록 조회 실패', error);
      throw error;
    }
  },
  
  // 1-4. 재료 상세 조회 API
  getIngredientById: async (ingredientId) => {
    try {
      const response = await api.get(`/api/public/meta/ingredients/${ingredientId}`);
      return response.data;
    } catch (error) {
      console.error('재료 상세 조회 실패', error);
      throw error;
    }
  },
  
  // 1-5. 가니시 목록 조회 API
  getAllGarnishes: async (page = 1, limit = 100, searchName = '') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        name: searchName
      }).toString();
      
      const response = await api.get(`/api/public/meta/garnishes?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('가니시 목록 조회 실패', error);
      throw error;
    }
  },
  
  // 1-6. 가니시 상세 조회 API
  getGarnishById: async (garnishId) => {
    try {
      const response = await api.get(`/api/public/meta/garnishes/${garnishId}`);
      return response.data;
    } catch (error) {
      console.error('가니시 상세 조회 실패', error);
      throw error;
    }
  },
  
  // 1-7. 향미 카테고리 조회 API
  getNoteCategories: async () => {
    try {
      const response = await api.get('/api/public/meta/note-categories');
      return response.data;
    } catch (error) {
      console.error('향미 카테고리 목록 조회 실패', error);
      throw error;
    }
  },
  
  // 2. 관리자 메타데이터 API
  
  // 2-1. 재료 추가 API
  addIngredient: async (ingredientData) => {
    try {
      // 재료명이 중복되는지 확인
      const validateNameIsUnique = async (name) => {
        try {
          const allIngredients = await metaAPI.getAllIngredients(1, 1000);
          return !allIngredients.some(ingredient => 
            ingredient.name.toLowerCase() === name.toLowerCase()
          );
        } catch (error) {
          return true; // 검증 실패 시 기본적으로 진행
        }
      };
      
      // 빈 문자열을 null로 변환
      const processedData = Object.entries(ingredientData).reduce((acc, [key, value]) => {
        // 배열인 경우(note_categories) 처리
        if (Array.isArray(value)) {
          acc[key] = value.length > 0 ? value : null;
        } else {
          acc[key] = value === '' ? null : value;
        }
        return acc;
      }, {});
      
      // 이름 중복 확인
      const isNameUnique = await validateNameIsUnique(processedData.name);
      if (!isNameUnique) {
        throw new Error('이미 존재하는 재료 이름입니다.');
      }
      
      const response = await api.post('/api/admin/meta/ingredients', processedData);
      return response.data;
    } catch (error) {
      console.error('재료 추가 실패', error);
      throw error;
    }
  },
  
  // 2-2. 재료 수정 API
  updateIngredient: async (ingredientId, ingredientData) => {
    try {
      // 빈 문자열을 null로 변환
      const processedData = Object.entries(ingredientData).reduce((acc, [key, value]) => {
        // 배열인 경우(note_categories) 처리
        if (Array.isArray(value)) {
          acc[key] = value.length > 0 ? value : null;
        } else {
          acc[key] = value === '' ? null : value;
        }
        return acc;
      }, {});
      
      const response = await api.patch(`/api/admin/meta/ingredients/${ingredientId}`, processedData);
      return response.data;
    } catch (error) {
      console.error('재료 수정 실패', error);
      throw error;
    }
  },
  
  // 2-3. 재료 삭제 API
  deleteIngredient: async (ingredientId) => {
    try {
      // 재료가 사용 중인지 확인
      const validateNotInUse = async (id) => {
        try {
          // 해당 재료를 사용하는 칵테일이 있는지 확인
          const allCocktails = await metaAPI.getAllCocktails(1, 1000);
          return !allCocktails.some(cocktail => 
            cocktail.ingredient1_id === id ||
            cocktail.ingredient2_id === id ||
            cocktail.ingredient3_id === id ||
            cocktail.ingredient4_id === id
          );
        } catch (error) {
          return true; // 검증 실패 시 기본적으로 진행
        }
      };
      
      // 사용 중인지 확인
      const isNotInUse = await validateNotInUse(ingredientId);
      if (!isNotInUse) {
        throw new Error('이 재료를 사용하는 칵테일이 존재합니다. 먼저 해당 칵테일을 수정하세요.');
      }
      
      const response = await api.delete(`/api/admin/meta/ingredients/${ingredientId}`);
      return response.data;
    } catch (error) {
      console.error('재료 삭제 실패', error);
      throw error;
    }
  },
  
  // 2-4. 가니시 추가 API
  addGarnish: async (garnishData) => {
    try {
      // 가니시명이 중복되는지 확인
      const validateNameIsUnique = async (name) => {
        try {
          const allGarnishes = await metaAPI.getAllGarnishes(1, 1000);
          return !allGarnishes.some(garnish => 
            garnish.garnish_name.toLowerCase() === name.toLowerCase()
          );
        } catch (error) {
          return true; // 검증 실패 시 기본적으로 진행
        }
      };
      
      // 필드명 통일 (name -> garnish_name)
      const processedData = {
        garnish_name: garnishData.name || garnishData.garnish_name,
        note_category: garnishData.note_category
      };
      
      // 이름 중복 확인
      const isNameUnique = await validateNameIsUnique(processedData.garnish_name);
      if (!isNameUnique) {
        throw new Error('이미 존재하는 가니시 이름입니다.');
      }
      
      const response = await api.post('/api/admin/meta/garnishes', processedData);
      return response.data;
    } catch (error) {
      console.error('가니시 추가 실패', error);
      throw error;
    }
  },
  
  // 2-5. 가니시 수정 API
  updateGarnish: async (garnishId, garnishData) => {
    try {
      // 필드명 통일 (name -> garnish_name)
      const processedData = {
        garnish_name: garnishData.name || garnishData.garnish_name,
        note_category: garnishData.note_category
      };
      
      const response = await api.patch(`/api/admin/meta/garnishes/${garnishId}`, processedData);
      return response.data;
    } catch (error) {
      console.error('가니시 수정 실패', error);
      throw error;
    }
  },
  
  // 2-6. 가니시 삭제 API
  deleteGarnish: async (garnishId) => {
    try {
      // 가니시가 사용 중인지 확인
      const validateNotInUse = async (id) => {
        try {
          // 해당 가니시를 사용하는 칵테일이 있는지 확인
          const allCocktails = await metaAPI.getAllCocktails(1, 1000);
          return !allCocktails.some(cocktail => 
            cocktail.garnish_id === id
          );
        } catch (error) {
          return true; // 검증 실패 시 기본적으로 진행
        }
      };
      
      // 사용 중인지 확인
      const isNotInUse = await validateNotInUse(garnishId);
      if (!isNotInUse) {
        throw new Error('이 가니시를 사용하는 칵테일이 존재합니다. 먼저 해당 칵테일을 수정하세요.');
      }
      
      const response = await api.delete(`/api/admin/meta/garnishes/${garnishId}`);
      return response.data;
    } catch (error) {
      console.error('가니시 삭제 실패', error);
      throw error;
    }
  }
};

export default metaAPI;