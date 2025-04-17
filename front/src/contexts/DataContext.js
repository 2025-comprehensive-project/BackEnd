// src/contexts/DataContext.js
import React, { createContext, useState } from 'react';

// 사용자 데이터
const initialUsers = [
  { id: 1, name: "김철수", email: "chulsoo@example.com", status: "active", joined: "2023-01-15" },
  { id: 2, name: "이영희", email: "younghee@example.com", status: "inactive", joined: "2023-02-20" },
  { id: 3, name: "박민수", email: "minsu@example.com", status: "pending", joined: "2023-03-10" },
  { id: 4, name: "정다영", email: "dayoung@example.com", status: "active", joined: "2023-04-01" },
  { id: 5, name: "한지민", email: "jimin@example.com", status: "active", joined: "2023-01-25" },
  { id: 6, name: "최유리", email: "yuri@example.com", status: "inactive", joined: "2023-02-28" },
  { id: 7, name: "강현우", email: "hyunwoo@example.com", status: "pending", joined: "2023-03-15" },
  { id: 8, name: "송지아", email: "jia@example.com", status: "active", joined: "2023-04-05" },
  { id: 9, name: "안정훈", email: "jung@example.com", status: "active", joined: "2023-01-10" },
  { id: 10, name: "차수현", email: "soohyun@example.com", status: "inactive", joined: "2023-02-12" },
  { id: 11, name: "류시원", email: "siwon@example.com", status: "pending", joined: "2023-03-22" },
  { id: 12, name: "백현진", email: "hyun@example.com", status: "active", joined: "2023-04-10" },
];

// 칵테일 데이터
const initialCocktails = [
  { id: 1, name: "모히토", category: "럼", flavor: "상쾌한 민트와 라임의 조화", ingredients: "럼, 민트, 라임", glass: "콜린스 글라스", abv: "15%", method: "쉐이킹", oz: "럼 2oz, 설탕 1tsp, 라임주스 1oz" },
  { id: 2, name: "마가리타", category: "데킬라", flavor: "시트러스한 맛과 소금의 조화", ingredients: "데킬라, 라임, 소금", glass: "마가리타 글라스", abv: "25%", method: "쉐이킹", oz: "데킬라 2oz, 라임주스 1oz, 트리플섹 0.5oz" },
  { id: 3, name: "피나 콜라다", category: "럼", flavor: "달콤한 코코넛과 파인애플의 열대풍미", ingredients: "럼, 코코넛 크림, 파인애플 주스", glass: "허리케인 글라스", abv: "12%", method: "블렌딩", oz: "럼 2oz, 코코넛크림 2oz, 파인애플주스 2oz" },
  { id: 4, name: "올드 패션드", category: "위스키", flavor: "깊은 위스키향과 은은한 달콤함", ingredients: "위스키, 설탕, 비터즈", glass: "올드패션드 글라스", abv: "32%", method: "빌드", oz: "위스키 2oz, 각설탕 1개, 앙고스투라 비터 2dash" },
  { id: 5, name: "진토닉", category: "진", flavor: "쌉쌀한 진과 톡 쏘는 토닉의 상쾌함", ingredients: "진, 토닉 워터, 라임", glass: "하이볼 글라스", abv: "10%", method: "빌드", oz: "진 2oz, 토닉워터 4oz, 라임 웨지 1개" },
  { id: 6, name: "블랙 러시안", category: "보드카", flavor: "진한 커피향과 부드러운 보드카의 만남", ingredients: "보드카, 깔루아", glass: "올드패션드 글라스", abv: "22%", method: "빌드", oz: "보드카 1.5oz, 커피 리큐어 0.75oz" },
  { id: 7, name: "롱 아일랜드 아이스티", category: "혼합", flavor: "여러 술이 조화롭게 어우러진 달콤한 맛", ingredients: "럼, 진, 보드카, 데킬라, 오렌지 리큐르, 콜라", glass: "하이볼 글라스", abv: "28%", method: "빌드", oz: "보드카, 진, 럼, 데킬라 각 0.5oz, 트리플섹 0.5oz, 콜라 적당량" },
  { id: 8, name: "맨해튼", category: "위스키", flavor: "풍부한 위스키의 깊이가 느껴지는 고급스러운 맛", ingredients: "위스키, 스위트 버무스, 비터즈", glass: "칵테일 글라스", abv: "30%", method: "스터", oz: "라이 위스키 2oz, 스위트 베르무트 1oz, 앙고스투라 비터 2dash" },
  { id: 9, name: "데킬라 선라이즈", category: "데킬라", flavor: "오렌지의 산뜻함과 그레나딘의 달콤함", ingredients: "데킬라, 오렌지 주스, 그레나딘 시럽", glass: "하이볼 글라스", abv: "15%", method: "빌드", oz: "데킬라 1.5oz, 오렌지주스 4oz, 그레나딘 시럽 0.5oz" },
  { id: 10, name: "화이트 러시안", category: "보드카", flavor: "크림과 커피의 부드럽고 달콤한 조화", ingredients: "보드카, 커피 리큐르, 크림", glass: "올드패션드 글라스", abv: "20%", method: "빌드", oz: "보드카 1.5oz, 커피 리큐어 0.75oz, 크림 0.75oz" },
  { id: 11, name: "사이드카", category: "브랜디", flavor: "브랜디의 따뜻함과 시트러스의 신선한 대비", ingredients: "브랜디, 오렌지 리큐르, 레몬 주스", glass: "칵테일 글라스", abv: "26%", method: "쉐이킹", oz: "코냑 2oz, 코앵트로 1oz, 레몬주스 0.75oz" },
  { id: 12, name: "다이키리", category: "럼", flavor: "깨끗하고 상쾌한 라임과 럼의 완벽한 균형", ingredients: "럼, 라임 주스, 설탕", glass: "칵테일 글라스", abv: "20%", method: "쉐이킹", oz: "화이트 럼 2oz, 라임주스 1oz, 심플시럽 0.75oz" },
];

// 현재 날짜 구하기
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 이번 주의 시작일 구하기
const getStartOfWeek = () => {
  const today = new Date();
  const day = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일부터 시작하는 주의 시작일 계산
  const startOfWeek = new Date(today.setDate(diff));
  const year = startOfWeek.getFullYear();
  const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
  const date = String(startOfWeek.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [cocktails, setCocktails] = useState(initialCocktails);

  // 오늘 가입한 유저 수 계산
  const getTodayNewUsers = () => {
    const today = getCurrentDate();
    return users.filter(user => user.joined === today).length;
  };

  // 이번 주에 추가된 칵테일 수 계산 (간단한 시뮬레이션을 위해 임의로 2개로 설정)
  const getWeeklyNewCocktails = () => {
    // 실제로는 칵테일 데이터에 추가 날짜 필드가 있어야 정확히 계산할 수 있음
    // 현재는 하드코딩된 값 반환
    return 2;
  };

  // 유저 추가, 수정, 삭제 등의 함수
  const addUser = (user) => {
    setUsers([...users, { ...user, id: users.length + 1 }]);
  };

  const updateUser = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  // 칵테일 추가, 수정, 삭제 등의 함수
  const addCocktail = (cocktail) => {
    setCocktails([...cocktails, { ...cocktail, id: cocktails.length + 1 }]);
  };

  const updateCocktail = (updatedCocktail) => {
    setCocktails(cocktails.map(cocktail => cocktail.id === updatedCocktail.id ? updatedCocktail : cocktail));
  };

  const deleteCocktail = (cocktailId) => {
    setCocktails(cocktails.filter(cocktail => cocktail.id !== cocktailId));
  };

  return (
    <DataContext.Provider value={{
      users,
      cocktails,
      getTodayNewUsers,
      getWeeklyNewCocktails,
      addUser,
      updateUser,
      deleteUser,
      addCocktail,
      updateCocktail,
      deleteCocktail
    }}>
      {children}
    </DataContext.Provider>
  );
};