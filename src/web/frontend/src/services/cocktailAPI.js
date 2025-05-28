// src/services/cocktailAPI.js
import api from './api';

export const cocktailAPI = {
  // 기본 칵테일 레시피 조회 (퍼블릭 API)
  getAllBasicCocktails: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters // name, method, abv_min, abv_max 등 필터 지원
      }).toString();
      
      const response = await api.get(`/api/public/meta/cocktails?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('기본 칵테일 조회 실패', error);
      throw error;
    }
  },

  // 시그니처 칵테일 레시피 조회 (퍼블릭 API)
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
      console.error('시그니처 칵테일 조회 실패', error);
      throw error;
    }
  },

  // 특정 칵테일 레시피 조회 (퍼블릭 API)
  getCocktailById: async (recipeId) => {
    try {
      const response = await api.get(`/api/public/meta/cocktails/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('특정 칵테일 조회 실패', error);
      throw error;
    }
  },

  // 유저 시그니처 칵테일 조회
  getUserSignatureCocktails: async (page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder
      }).toString();
      
      const response = await api.get(`/api/public/meta/cocktails/signature?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('유저 시그니처 칵테일 조회 실패', error);
      
      // 개발 중이거나 DEMO 모드일 경우 빈 배열 반환
      if (process.env.NODE_ENV === 'development') {
        return { data: [], total: 0, page: 1, limit: 10 };
      }
      
      throw error;
    }
  },

  // 특정 유저의 시그니처 칵테일 목록 조회 (관리자 API)
  getUserSignatureCocktailsByUserId: async (userId, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder
      }).toString();
      
      const response = await api.get(`/api/admin/cocktails/${userId}/signature?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`유저 ID ${userId}의 시그니처 칵테일 조회 실패`, error);
      throw error;
    }
  },

  // 유저 시그니처 칵테일 저장
  createUserSignatureCocktail: async (cocktailData) => {
    try {
      // NULL 값 처리 - 빈 문자열을 null로 변환
      const processedData = Object.entries(cocktailData).reduce((acc, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {});
      
      const response = await api.post('/api/user/cocktails', processedData);
      return response.data;
    } catch (error) {
      console.error('시그니처 칵테일 저장 실패', error);
      throw error;
    }
  },

  // 레시피 등록 (관리자 API)
  createCocktail: async (cocktailData) => {
    try {
      // NULL 값 처리 - 빈 문자열을 null로 변환
      const processedData = Object.entries(cocktailData).reduce((acc, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {});
      
      // abv가 제공되지 않은 경우 자동 계산
      if (!processedData.abv && processedData.abv !== 0) {
        processedData.abv = await calculateAbv(processedData);
      }
      
      const response = await api.post('/api/admin/cocktails', processedData);
      return response.data;
    } catch (error) {
      console.error('레시피 등록 실패', error);
      throw error;
    }
  },

  // 레시피 수정 (관리자 API)
  updateCocktail: async (recipeId, cocktailData) => {
    try {
      // NULL 값 처리 - 빈 문자열을 null로 변환
      const processedData = Object.entries(cocktailData).reduce((acc, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {});
      
      // abv가 제공되지 않은 경우 자동 계산
      if (!processedData.abv && processedData.abv !== 0) {
        processedData.abv = await calculateAbv(processedData);
      }
      
      const response = await api.put(`/api/admin/cocktails/${recipeId}`, processedData);
      return response.data;
    } catch (error) {
      console.error('레시피 수정 실패', error);
      throw error;
    }
  },

  // 레시피 삭제 (관리자 API)
  deleteCocktail: async (recipeId) => {
    try {
      const response = await api.delete(`/api/admin/cocktails/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('레시피 삭제 실패', error);
      throw error;
    }
  },

  // 재료 목록 조회 (메타데이터 API)
  getAllIngredients: async () => {
    try {
      const response = await api.get('/api/public/meta/ingredients');
      return response.data;
    } catch (error) {
      console.error('재료 목록 조회 실패', error);
      throw error;
    }
  },

  // 가니시 목록 조회 (메타데이터 API)
  getAllGarnishes: async () => {
    try {
      const response = await api.get('/api/public/meta/garnishes');
      return response.data;
    } catch (error) {
      console.error('가니시 목록 조회 실패', error);
      throw error;
    }
  },

  // 향미 카테고리 조회 (메타데이터 API)
  getNoteCategories: async () => {
    try {
      const response = await api.get('/api/public/meta/note-categories');
      return response.data;
    } catch (error) {
      console.error('향미 카테고리 조회 실패', error);
      throw error;
    }
  }
};

// 알코올 도수(ABV) 자동 계산 함수
const calculateAbv = async (cocktailData) => {
  try {
    // 모든 재료 정보 가져오기
    const ingredients = await cocktailAPI.getAllIngredients();
    
    // 각 재료 ID에 해당하는 재료 정보 찾기
    const findIngredient = (id) => {
      return ingredients.find(ingredient => ingredient.ingredient_id === id);
    };
    
    // 양(amount) 문자열에서 숫자 부분 추출 (예: "1.5oz" -> 1.5)
    const extractAmount = (amountStr) => {
      if (!amountStr) return 0;
      const match = amountStr.match(/(\d+(\.\d+)?)/);
      return match ? parseFloat(match[0]) : 0;
    };
    
    // 총 양과 알코올 함량 계산
    let totalVolume = 0;
    let totalAlcohol = 0;
    
    // 재료 1-4에 대해 반복
    for (let i = 1; i <= 4; i++) {
      const ingredientId = cocktailData[`ingredient${i}_id`];
      const amountStr = cocktailData[`ingredient${i}_amount`];
      
      if (ingredientId && amountStr) {
        const ingredient = findIngredient(ingredientId);
        if (ingredient) {
          const amount = extractAmount(amountStr);
          totalVolume += amount;
          totalAlcohol += (amount * ingredient.abv / 100);
        }
      }
    }
    
    // 총 알코올 도수 계산
    const abv = totalVolume > 0 ? Math.round((totalAlcohol / totalVolume) * 100) : 0;
    return abv;
  } catch (error) {
    console.error('ABV 자동 계산 오류', error);
    return 0; // 오류 발생 시 기본값 반환
  }
};

export default cocktailAPI;