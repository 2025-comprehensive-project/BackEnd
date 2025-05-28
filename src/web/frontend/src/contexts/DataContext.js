// src/contexts/DataContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { adminUserAPI } from '../services/adminUserAPI';
import { cocktailAPI } from '../services/cocktailAPI';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // 상태 관리
  const [users, setUsers] = useState([]);
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 병렬로 데이터 로드
      const [usersData, basicCocktails, signatureCocktails] = await Promise.all([
        adminUserAPI.getAllUsers(),
        cocktailAPI.getAllBasicCocktails(),
        cocktailAPI.getUserSignatureCocktails()
      ]);
      
      // 유저 데이터 설정
      setUsers(usersData || []);
      
      // 칵테일 데이터 합치기
      const allCocktails = [
        ...(basicCocktails || []).map(cocktail => ({ ...cocktail, type: 'basic' })),
        ...(signatureCocktails || []).map(cocktail => ({ ...cocktail, type: 'user' }))
      ];
      
      setCocktails(allCocktails);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 이번 주 시작일 구하기
  const getStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일부터 시작하는 주의 시작일 계산
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    return startOfWeek;
  };

  // 오늘 시작 시간 구하기
  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 00:00:00으로 설정
    return today;
  };

  // 오늘 가입한 유저 수 계산 (실제 데이터 기반)
  const getTodayNewUsers = useCallback(() => {
    const todayStart = getStartOfToday();
    return users.filter(user => {
      const registeredDate = new Date(user.registered_at);
      return registeredDate >= todayStart;
    }).length;
  }, [users]);

  // 이번 주 가입한 유저 수 계산 (새로 추가)
  const getWeeklyNewUsers = useCallback(() => {
    const weekStart = getStartOfWeek();
    
    // 디버깅용 로그
    console.log('=== 이번 주 신규 유저 계산 ===');
    console.log('이번 주 시작일:', weekStart);
    console.log('현재 시간:', new Date());
    
    const weeklyUsers = users.filter(user => {
      const registeredDate = new Date(user.registered_at);
      const isThisWeek = registeredDate >= weekStart;
      
      // 각 유저별 디버깅
      if (isThisWeek) {
        console.log(`${user.name} - 가입일: ${registeredDate} (이번 주 가입)`);
      }
      
      return isThisWeek;
    });
    
    console.log('이번 주 가입 유저 수:', weeklyUsers.length);
    console.log('======================');
    
    return weeklyUsers.length;
  }, [users]);

  // 이번 주에 추가된 칵테일 수 계산 (실제 데이터 기반)
  const getWeeklyNewCocktails = useCallback(() => {
    const weekStart = getStartOfWeek();
    return cocktails.filter(cocktail => {
      const createdDate = new Date(cocktail.created_at);
      return createdDate >= weekStart;
    }).length;
  }, [cocktails]);

  // 유저 추가 함수 - API 호출 후 상태 업데이트
  const addUser = async (userData) => {
    try {
      // 실제로는 여기서 API 호출하여 유저 추가
      // const newUser = await userAPI.createUser(userData);
      
      // 예시: 실제 API 호출 없이 테스트
      const newUser = {
        ...userData,
        user_id: Date.now(), // 임시 ID
        registered_at: new Date().toISOString()
      };
      
      // 상태 업데이트
      setUsers(prevUsers => [...prevUsers, newUser]);
      return newUser;
    } catch (error) {
      console.error('유저 추가 실패:', error);
      throw error;
    }
  };

  // 유저 삭제 함수 - API 호출 후 상태 업데이트
  const deleteUser = async (userId) => {
    try {
      // 실제로는 여기서 API 호출하여 유저 삭제
      // await userAPI.deleteUser(userId);
      
      // 상태 업데이트
      setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
      return true;
    } catch (error) {
      console.error('유저 삭제 실패:', error);
      throw error;
    }
  };

  // 칵테일 추가 함수 - API 호출 후 상태 업데이트
  const addCocktail = async (cocktailData) => {
    try {
      // 실제 API 호출
      const result = await cocktailAPI.createCocktail(cocktailData);
      
      // 새 칵테일 객체 생성
      const newCocktail = {
        ...result,
        created_at: new Date().toISOString(),
        type: 'basic'
      };
      
      // 상태 업데이트
      setCocktails(prevCocktails => [...prevCocktails, newCocktail]);
      return newCocktail;
    } catch (error) {
      console.error('칵테일 추가 실패:', error);
      throw error;
    }
  };

  // 칵테일 삭제 함수 - API 호출 후 상태 업데이트
  const deleteCocktail = async (cocktailId) => {
    try {
      // 실제 API 호출
      await cocktailAPI.deleteCocktail(cocktailId);
      
      // 상태 업데이트
      setCocktails(prevCocktails => prevCocktails.filter(cocktail => cocktail.recipe_id !== cocktailId));
      return true;
    } catch (error) {
      console.error('칵테일 삭제 실패:', error);
      throw error;
    }
  };

  // 데이터 새로고침 함수
  const refreshData = () => {
    loadData();
  };

  return (
    <DataContext.Provider value={{
      users,
      cocktails,
      loading,
      error,
      getTodayNewUsers,
      getWeeklyNewUsers,  // 새로 추가
      getWeeklyNewCocktails,
      addUser,
      deleteUser,
      addCocktail,
      deleteCocktail,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};