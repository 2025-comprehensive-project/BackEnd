// src/pages/CocktailList.js
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faExclamationTriangle,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { cocktailAPI } from '../services/cocktailAPI';
import { DataContext } from '../contexts/DataContext';
import CocktailModal from '../components/modals/CocktailModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import Pagination from '../components/common/Pagination';
import { SuccessMessage, ErrorMessage } from '../components/common/StatusMessage'; // 메시지 컴포넌트 추가
import '../styles/pages/CocktailList.css';

function CocktailList() {
  // 상태 관리
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 필터링 상태
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 타입 필터 추가
  const [sortBy, setSortBy] = useState('name');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const COCKTAILS_PER_PAGE = 15;

  // 모달 상태
  const [showCocktailModal, setShowCocktailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  // 체크박스 상태
  const [selectedCocktails, setSelectedCocktails] = useState([]);

  // 메시지 상태 추가
  const [successMessage, setSuccessMessage] = useState(null);

  // DataContext 추가
  const { addCocktail: addContextCocktail, deleteCocktail: deleteContextCocktail } = useContext(DataContext);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1); // 검색, 카테고리, 타입 필터가 변경되면 페이지를 1로 리셋
  }, [search, categoryFilter, typeFilter]);

  // 메서드 및 글라스 한국어 변환 함수
  const translateMethod = (method) => {
    const methodMap = {
      'stir': '젓기',
      'shake': '흔들기'
    };
    return methodMap[method] || method;
  };

  const translateGlass = (glass) => {
    const glassMap = {
      'martini': '마티니',
      'sour': '사워',
      'coupe': '쿠페',
      'margarita': '마가리타',
      // 'shot': '샷',
      'long_drink': '롱 드링크',
      'on_the_rocks': '온 더 락'
    };
    return glassMap[glass] || glass;
  };

  // 공통 버튼 스타일
  const buttonStyle = {
    width: '60px',
    minWidth: '60px',
    height: '30px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // 성공 메시지 닫기 핸들러
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // 오류 메시지 닫기 핸들러
  const handleCloseErrorMessage = () => {
    setError(null);
  };

  // 칵테일 데이터 로드
  const loadCocktails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const basicCocktails = await cocktailAPI.getAllBasicCocktails();
      const userSignatureCocktails = await cocktailAPI.getUserSignatureCocktails();

      const allCocktails = [
        ...basicCocktails.map(cocktail => ({ ...cocktail, type: 'basic' })),
        ...userSignatureCocktails.map(cocktail => ({ ...cocktail, type: 'user' }))
      ];

      setCocktails(allCocktails);
      setSelectedCocktails([]); // 데이터 로드 시 선택 초기화
    } catch (err) {
      console.error('칵테일 로드 오류:', err);
      setError('칵테일 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCocktails();
  }, [loadCocktails]);

  // 필터링된 칵테일 목록
  const filteredCocktails = useMemo(() => {
    const searchLower = search.toLowerCase();
    const categoryFilterLower = categoryFilter.toLowerCase();
    return cocktails.filter(cocktail => {
      const ingredients = [
        cocktail.ingredient1,
        cocktail.ingredient2,
        cocktail.ingredient3,
        cocktail.ingredient4
      ].filter(Boolean); // null 또는 undefined 제거
      
      const matchesSearch = cocktail.name.toLowerCase().includes(searchLower);
      const matchesCategory = categoryFilter === '' || ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(categoryFilterLower)
      );
      const matchesType = typeFilter === '' || cocktail.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [cocktails, search, categoryFilter, typeFilter]);

  // 정렬된 칵테일 목록
  const sortedCocktails = useMemo(() => {
    return [...filteredCocktails].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  }, [filteredCocktails, sortBy]);

  // 페이지네이션된 칵테일 목록
  const paginatedCocktails = useMemo(() => {
    const startIndex = (currentPage - 1) * COCKTAILS_PER_PAGE;
    const endIndex = startIndex + COCKTAILS_PER_PAGE;
    return sortedCocktails.slice(startIndex, endIndex);
  }, [sortedCocktails, currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, newPage));
  };

  // 타입 필터 변경 핸들러
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  // 칵테일 추가 핸들러
  const handleAddCocktail = () => {
    setSelectedCocktail(null);
    setModalMode('add');
    setShowCocktailModal(true);
  };

  // 칵테일 수정 핸들러
  const handleEditCocktail = (cocktail) => {
    setSelectedCocktail(cocktail);
    setModalMode('edit');
    setShowCocktailModal(true);
  };

  // 선택된 칵테일 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedCocktails.length === 0) {
      setError('삭제할 칵테일을 선택해주세요.');
      return;
    }
    setShowDeleteModal(true);
  };

  // 칵테일 저장 핸들러 수정
  const handleSaveCocktail = async (cocktailData) => {
    try {
      if (modalMode === 'add') {
        // API로만 추가 (중복 추가 방지)
        await cocktailAPI.createCocktail(cocktailData);
        // 성공 메시지 설정
        setSuccessMessage('칵테일이 성공적으로 추가되었습니다.');
      } else if (modalMode === 'edit' && selectedCocktail) {
        await cocktailAPI.updateCocktail(selectedCocktail.recipe_id, cocktailData);
        // 성공 메시지 설정
        setSuccessMessage('칵테일이 성공적으로 수정되었습니다.');
      }
      
      // 모달 닫기
      onCloseModal();
      
      // 변경사항을 반영하기 위해 데이터 다시 로드
      loadCocktails();
    } catch (err) {
      console.error('칵테일 저장 오류:', err);
      setError(`칵테일 저장에 실패했습니다: ${err.message || '알 수 없는 오류'}`);
    }
  };

  // 칵테일 삭제 처리 수정
  const handleConfirmDelete = async () => {
    try {
      // 선택된 칵테일들을 순차적으로 삭제 (API만 호출)
      for (const cocktailId of selectedCocktails) {
        await cocktailAPI.deleteCocktail(cocktailId);
      }
      
      // 모달 닫기
      onCloseModal();
      
      // 성공 메시지 설정
      setSuccessMessage(`${selectedCocktails.length}개의 칵테일이 성공적으로 삭제되었습니다.`);
      
      // 변경사항을 반영하기 위해 데이터 다시 로드
      loadCocktails();
      setSelectedCocktails([]);
    } catch (err) {
      console.error('칵테일 삭제 오류:', err);
      setError(`칵테일 삭제에 실패했습니다: ${err.message || '알 수 없는 오류'}`);
    }
  };

  // 모달 닫기 핸들러
  const onCloseModal = () => {
    setShowCocktailModal(false);
    setShowDeleteModal(false);
    setSelectedCocktail(null);
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedCocktails.map(cocktail => cocktail.recipe_id);
      setSelectedCocktails(allIds);
    } else {
      setSelectedCocktails([]);
    }
  };

  // 개별 체크박스 선택 핸들러
  const handleSelectCocktail = (cocktailId) => {
    setSelectedCocktails(prev => {
      if (prev.includes(cocktailId)) {
        return prev.filter(id => id !== cocktailId);
      } else {
        return [...prev, cocktailId];
      }
    });
  };

  // 현재 페이지의 모든 칵테일이 선택되었는지 확인
  const isAllSelected = paginatedCocktails.length > 0 && 
    paginatedCocktails.every(cocktail => selectedCocktails.includes(cocktail.recipe_id));

  // 페이지 계산
  const totalPages = Math.ceil(filteredCocktails.length / COCKTAILS_PER_PAGE);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <header className="content-header">
        <h1>칵테일 목록</h1>
        <div className="header-actions">
          <button className="add-cocktail-btn" onClick={handleAddCocktail}>
            <FontAwesomeIcon icon={faPlus} /> 칵테일 추가
          </button>
          {selectedCocktails.length > 0 && (
            <button className="delete-selected-btn" onClick={handleDeleteSelected}>
              <FontAwesomeIcon icon={faTrashAlt} /> 선택 삭제 ({selectedCocktails.length})
            </button>
          )}
        </div>
      </header>

      {/* 성공 메시지 표시 */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={handleCloseSuccessMessage} 
        />
      )}

      {/* 에러 메시지 표시 */}
      {error && (
        <ErrorMessage 
          message={error} 
          onClose={handleCloseErrorMessage} 
        />
      )}

      <div className="filter-options">
        <div className="filter-group">
          <label htmlFor="search-input">검색:</label>
          <input
            type="text"
            id="search-input"
            placeholder="이름으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="category-filter">재료:</label>
          <input
            type="text"
            id="category-filter"
            placeholder="재료로 필터링"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="type-filter">타입:</label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="">전체</option>
            <option value="basic">기본</option>
            <option value="user">유저</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sort-by">정렬:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">이름</option>
            <option value="abv">도수</option>
            <option value="method">메서드</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={loadCocktails} disabled={loading}>
          <FontAwesomeIcon icon={faSync} spin={loading} /> 새로고침
        </button>
      </div>

      <div className="table-scroll-wrapper">
        <table className="cocktail-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>이름</th>
              <th>재료 1</th>
              <th>재료 2</th>
              <th>재료 3</th>
              <th>재료 4</th>
              <th>가니시</th>
              <th>메서드</th>
              <th>글라스</th>
              <th>도수(%)</th>
              <th>타입</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCocktails.length > 0 ? (
              paginatedCocktails.map(cocktail => (
                <tr key={cocktail.recipe_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCocktails.includes(cocktail.recipe_id)}
                      onChange={() => handleSelectCocktail(cocktail.recipe_id)}
                    />
                  </td>
                  <td>{cocktail.name}</td>
                  <td>{cocktail.ingredient1} {cocktail.ingredient1_amount}</td>
                  <td>{cocktail.ingredient2} {cocktail.ingredient2_amount}</td>
                  <td>{cocktail.ingredient3} {cocktail.ingredient3_amount}</td>
                  <td>{cocktail.ingredient4} {cocktail.ingredient4_amount}</td>
                  <td>{cocktail.garnish || '-'}</td>
                  <td>{translateMethod(cocktail.method)}</td>
                  <td>{translateGlass(cocktail.glass_type)}</td>
                  <td>{cocktail.abv}</td>
                  <td>{cocktail.type === 'basic' ? '기본' : '유저'}</td>
                  <td>
                    <div className="action-buttons-container">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditCocktail(cocktail)}
                        style={buttonStyle}
                      >
                        수정
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="no-data">표시할 칵테일 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지 네이션 */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* 칵테일 추가/수정 모달 */}
      {showCocktailModal && (
        <CocktailModal
          isOpen={showCocktailModal}
          onClose={onCloseModal}
          onSave={handleSaveCocktail}
          cocktail={selectedCocktail}
          mode={modalMode}
        />
      )}

      {/* 칵테일 삭제 확인 모달 */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={onCloseModal}
          onConfirm={handleConfirmDelete}
          title="선택한 칵테일 삭제 확인"
          message={`선택한 ${selectedCocktails.length}개의 칵테일을 삭제하시겠습니까?`}
        />
      )}
    </>
  );
}

export default CocktailList;