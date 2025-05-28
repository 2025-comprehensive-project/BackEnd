// src/pages/MetadataManager.js
import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,  // 추가: faPlus 아이콘 import
  faSave, 
  faTimes,
  faExclamationTriangle,
  faSync,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { metaAPI } from '../services/metaAPI';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import Pagination from '../components/common/Pagination';
import { SuccessMessage, ErrorMessage } from '../components/common/StatusMessage';
import '../styles/pages/MetadataManager.css';

function MetadataManager() {
  // 상태 관리
  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' or 'garnishes'
  const [ingredients, setIngredients] = useState([]);
  const [garnishes, setGarnishes] = useState([]);
  const [noteCategories, setNoteCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 편집 상태 관리
  const [editing, setEditing] = useState(null); // null or id
  const [adding, setAdding] = useState(false);
  
  // 선택 상태 관리
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedGarnishes, setSelectedGarnishes] = useState([]);
  
  // 삭제 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'ingredients' or 'garnishes'
  
  const [search, setSearch] = useState('');

  // 추가: 성공 메시지 상태
  const [successMessage, setSuccessMessage] = useState(null);

  // 페이지네이션 상태
  const [currentIngredientPage, setCurrentIngredientPage] = useState(1);
  const [currentGarnishPage, setCurrentGarnishPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // 폼 데이터
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    sweetness: 0,
    sourness: 0,
    bitterness: 0,
    abv: 0,
    description: '',
    note_categories: []
  });
  
  const [garnishForm, setGarnishForm] = useState({
    name: '',
    note_category: ''
  });
  
  // 공통 버튼 스타일
  const buttonStyle = {
    width: '60px',
    minWidth: '60px',
    height: '30px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  // 추가: 메시지 닫기 핸들러
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  const handleCloseErrorMessage = () => {
    setError(null);
  };
  
  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 모든 데이터를 병렬로 로드
      const [ingredientsData, garnishesData, noteCategoriesData] = await Promise.all([
        metaAPI.getAllIngredients(),
        metaAPI.getAllGarnishes(),
        metaAPI.getNoteCategories()
      ]);
      
      // 데이터 정렬: ingredient_id 또는 garnish_id를 기준으로 내림차순 정렬 (최신 항목이 맨 위로)
      const sortedIngredients = [...ingredientsData].sort((a, b) => 
        b.ingredient_id - a.ingredient_id
      );
      
      const sortedGarnishes = [...garnishesData].sort((a, b) => 
        b.garnish_id - a.garnish_id
      );
      
      setIngredients(sortedIngredients);
      setGarnishes(sortedGarnishes);
      setNoteCategories(noteCategoriesData);
      setSelectedIngredients([]);
      setSelectedGarnishes([]);
    } catch (error) {
      console.error('메타데이터 로드 실패:', error);
      setError('메타데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  // 검색 필터링
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, search]);

  const filteredGarnishes = useMemo(() => {
    return garnishes.filter(item =>
      item.garnish_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [garnishes, search]);

  // 페이지네이션된 재료 목록
  const paginatedIngredients = useMemo(() => {
    const startIndex = (currentIngredientPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredIngredients.slice(startIndex, endIndex);
  }, [filteredIngredients, currentIngredientPage]);

  const paginatedGarnishes = useMemo(() => {
    const startIndex = (currentGarnishPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredGarnishes.slice(startIndex, endIndex);
  }, [filteredGarnishes, currentGarnishPage]);
  
  // 재료 페이지 변경 핸들러
  const handleIngredientPageChange = (newPage) => {
    setCurrentIngredientPage(Math.max(1, newPage));
  };
  
  // 가니시 페이지 변경 핸들러
  const handleGarnishPageChange = (newPage) => {
    setCurrentGarnishPage(Math.max(1, newPage));
  };
  
  // 재료 추가 폼 토글
  const toggleAddIngredient = () => {
    setAdding(!adding);
    setEditing(null);
    
    // 폼 초기화
    setIngredientForm({
      name: '',
      sweetness: 0,
      sourness: 0,
      bitterness: 0,
      abv: 0,
      description: '',
      note_categories: []
    });
  };
  
  // 재료 편집 시작
  const handleEditIngredient = (ingredient) => {
    setEditing(ingredient.ingredient_id);
    setAdding(false);
    
    // 현재 note_categories 문자열을 배열로 변환
    const noteCategories = ingredient.note_categories ? 
      ingredient.note_categories.split(',').map(cat => cat.trim()) : [];
    
    setIngredientForm({
      name: ingredient.name,
      sweetness: ingredient.sweetness,
      sourness: ingredient.sourness,
      bitterness: ingredient.bitterness,
      abv: ingredient.abv,
      description: ingredient.description,
      note_categories: noteCategories
    });
  };
  
  // 재료 폼 제출 처리
  const handleIngredientSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing) {
        // 재료 수정
        await metaAPI.updateIngredient(editing, {
          ...ingredientForm,
          // API 요구 형식에 맞게 변환
          note_categories: ingredientForm.note_categories
        });
        
        // 변경: alert 대신 상태 변수 사용
        setSuccessMessage('재료가 성공적으로 수정되었습니다.');
      } else {
        // 재료 추가
        await metaAPI.addIngredient({
          ...ingredientForm,
          // API 요구 형식에 맞게 변환
          note_categories: ingredientForm.note_categories
        });
        
        // 변경: alert 대신 상태 변수 사용
        setSuccessMessage('재료가 성공적으로 추가되었습니다.');
        
        // 추가된 부분: 첫 번째 페이지로 리셋
        setCurrentIngredientPage(1);
      }
      
      // 데이터 새로고침
      await loadData();
      
      // 폼 초기화
      setEditing(null);
      setAdding(false);
    } catch (error) {
      console.error('재료 저장 오류:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(`오류: ${error.response.data.message}`);
      } else {
        setError('재료 저장 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 재료 선택 삭제
  const handleDeleteSelectedIngredients = () => {
    if (selectedIngredients.length === 0) {
      setError('삭제할 재료를 선택해주세요.');
      return;
    }
    setDeleteType('ingredients');
    setShowDeleteModal(true);
  };
  
  // 가니시 추가 폼 토글
  const toggleAddGarnish = () => {
    setAdding(!adding);
    setEditing(null);
    
    // 폼 초기화
    setGarnishForm({
      name: '',
      note_category: ''
    });
  };
  
  // 가니시 편집 시작
  const handleEditGarnish = (garnish) => {
    setEditing(garnish.garnish_id);
    setAdding(false);
    
    setGarnishForm({
      name: garnish.garnish_name,
      note_category: garnish.note_category
    });
  };
  
  // 가니시 폼 제출 처리
  const handleGarnishSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing) {
        // 가니시 수정
        await metaAPI.updateGarnish(editing, garnishForm);
        
        // 변경: alert 대신 상태 변수 사용
        setSuccessMessage('가니시가 성공적으로 수정되었습니다.');
      } else {
        // 가니시 추가
        await metaAPI.addGarnish(garnishForm);
        
        // 변경: alert 대신 상태 변수 사용
        setSuccessMessage('가니시가 성공적으로 추가되었습니다.');
        
        // 추가된 부분: 첫 번째 페이지로 리셋
        setCurrentGarnishPage(1);
      }
      
      // 데이터 새로고침
      await loadData();
      
      // 폼 초기화
      setEditing(null);
      setAdding(false);
    } catch (error) {
      console.error('가니시 저장 오류:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(`오류: ${error.response.data.message}`);
      } else {
        setError('가니시 저장 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 가니시 선택 삭제
  const handleDeleteSelectedGarnishes = () => {
    if (selectedGarnishes.length === 0) {
      setError('삭제할 가니시를 선택해주세요.');
      return;
    }
    setDeleteType('garnishes');
    setShowDeleteModal(true);
  };
  
  // 삭제 확인 처리
  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'ingredients') {
        for (const id of selectedIngredients) {
          await metaAPI.deleteIngredient(id);
        }
        // 변경: alert 대신 상태 변수 사용
        setSuccessMessage(`선택한 ${selectedIngredients.length}개의 재료가 성공적으로 삭제되었습니다.`);
        
        // 첫 번째 페이지로 이동
        setCurrentIngredientPage(1);
      } else if (deleteType === 'garnishes') {
        for (const id of selectedGarnishes) {
          await metaAPI.deleteGarnish(id);
        }
        // 변경: alert 대신 상태 변수 사용
        setSuccessMessage(`선택한 ${selectedGarnishes.length}개의 가니시가 성공적으로 삭제되었습니다.`);
        
        // 첫 번째 페이지로 이동
        setCurrentGarnishPage(1);
      }
      
      await loadData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('삭제 오류:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(`오류: ${error.response.data.message}`);
      } else {
        setError('삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 폼 필드 변경 처리 (재료)
  const handleIngredientChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setIngredientForm({
        ...ingredientForm,
        [name]: parseFloat(value)
      });
    } else if (name === 'note_categories') {
      // 다중 선택 처리
      const selected = Array.from(e.target.selectedOptions).map(option => option.value);
      setIngredientForm({
        ...ingredientForm,
        note_categories: selected
      });
    } else {
      setIngredientForm({
        ...ingredientForm,
        [name]: value
      });
    }
  };
  
  // 폼 필드 변경 처리 (가니시)
  const handleGarnishChange = (e) => {
    const { name, value } = e.target;
    setGarnishForm({
      ...garnishForm,
      [name]: value
    });
  };
  
  // 탭 변경 처리
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAdding(false);
    setEditing(null);
  };
  
  // 전체 선택/해제 (재료)
  const handleSelectAllIngredients = (e) => {
    if (e.target.checked) {
      const allIds = paginatedIngredients.map(item => item.ingredient_id);
      setSelectedIngredients(allIds);
    } else {
      setSelectedIngredients([]);
    }
  };
  
  // 전체 선택/해제 (가니시)
  const handleSelectAllGarnishes = (e) => {
    if (e.target.checked) {
      const allIds = paginatedGarnishes.map(item => item.garnish_id);
      setSelectedGarnishes(allIds);
    } else {
      setSelectedGarnishes([]);
    }
  };
  
  // 개별 선택 (재료)
  const handleSelectIngredient = (id) => {
    setSelectedIngredients(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // 개별 선택 (가니시)
  const handleSelectGarnish = (id) => {
    setSelectedGarnishes(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isAllIngredientsSelected = paginatedIngredients.length > 0 && 
    paginatedIngredients.every(item => selectedIngredients.includes(item.ingredient_id));
  
  const isAllGarnishesSelected = paginatedGarnishes.length > 0 && 
    paginatedGarnishes.every(item => selectedGarnishes.includes(item.garnish_id));
  
  return (
    <div className="metadata-manager">
      <header className="content-header">
        <h1>메타데이터 관리</h1>
        <div className="header-actions">
          {activeTab === 'ingredients' && (
            <>
              <button 
                className="add-btn" 
                onClick={toggleAddIngredient}
                disabled={editing !== null}
              >
                <FontAwesomeIcon icon={faPlus} /> 재료 추가
              </button>
              {selectedIngredients.length > 0 && (
                <button 
                  className="delete-selected-btn" 
                  onClick={handleDeleteSelectedIngredients}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> 선택 삭제 ({selectedIngredients.length})
                </button>
              )}
            </>
          )}
          {activeTab === 'garnishes' && (
            <>
              <button 
                className="add-btn" 
                onClick={toggleAddGarnish}
                disabled={editing !== null}
              >
                <FontAwesomeIcon icon={faPlus} /> 가니시 추가
              </button>
              {selectedGarnishes.length > 0 && (
                <button 
                  className="delete-selected-btn" 
                  onClick={handleDeleteSelectedGarnishes}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> 선택 삭제 ({selectedGarnishes.length})
                </button>
              )}
            </>
          )}
        </div>
      </header>
      
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
          onClick={() => handleTabChange('ingredients')}
        >
          재료 관리
        </button>
        <button 
          className={`tab-btn ${activeTab === 'garnishes' ? 'active' : ''}`}
          onClick={() => handleTabChange('garnishes')}
        >
          가니시 관리
        </button>
      </div>
      
      {/* 추가: 성공 및 에러 메시지 표시 */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={handleCloseSuccessMessage} 
        />
      )}
      
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
        <button className="refresh-btn" onClick={loadData} disabled={loading}>
          <FontAwesomeIcon icon={faSync} spin={loading} /> 새로고침
        </button>
      </div>
      
      {loading ? (
        <div className="loading-message">데이터를 불러오는 중...</div>
      ) : (
        <div className="metadata-content">
          {/* 재료 관리 */}
          {activeTab === 'ingredients' && (
            <div className="ingredients-manager">
              {/* 재료 추가/편집 폼 */}
              {(adding || editing !== null) && (
                <div className="form-container">
                  <h3>{editing !== null ? '재료 편집' : '새 재료 추가'}</h3>
                  <form onSubmit={handleIngredientSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">이름</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={ingredientForm.name}
                        onChange={handleIngredientChange}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sweetness">단맛</label>
                        <input
                          type="number"
                          id="sweetness"
                          name="sweetness"
                          min="0"
                          max="5"
                          value={ingredientForm.sweetness}
                          onChange={handleIngredientChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="sourness">신맛</label>
                        <input
                          type="number"
                          id="sourness"
                          name="sourness"
                          min="0"
                          max="5"
                          value={ingredientForm.sourness}
                          onChange={handleIngredientChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="bitterness">쓴맛</label>
                        <input
                          type="number"
                          id="bitterness"
                          name="bitterness"
                          min="0"
                          max="5"
                          value={ingredientForm.bitterness}
                          onChange={handleIngredientChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="abv">알코올 도수 (%)</label>
                        <input
                          type="number"
                          id="abv"
                          name="abv"
                          min="0"
                          max="100"
                          value={ingredientForm.abv}
                          onChange={handleIngredientChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description">설명</label>
                      <textarea
                        id="description"
                        name="description"
                        value={ingredientForm.description}
                        onChange={handleIngredientChange}
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="note_categories">향미 카테고리</label>
                      <select
                        id="note_categories"
                        name="note_categories"
                        multiple
                        value={ingredientForm.note_categories}
                        onChange={handleIngredientChange}
                      >
                        {noteCategories.map(category => (
                          <option 
                            key={category.note_category_id} 
                            value={category.name}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <small className="help-text">Ctrl 키를 누른 채로 여러 항목 선택 가능</small>
                    </div>
                    
                    {/* 수정: 버튼 텍스트와 아이콘 변경 */}
                    <div className="form-buttons">
                      <button type="submit" className="save-btn">
                        <FontAwesomeIcon icon={editing !== null ? faSave : faPlus} /> 
                        {editing !== null ? '저장' : '추가'}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => {
                          setAdding(false);
                          setEditing(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} /> 취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* 재료 목록 테이블 */}
              <div className="table-scroll-wrapper">
                <table className="meta-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={isAllIngredientsSelected}
                          onChange={handleSelectAllIngredients}
                        />
                      </th>
                      <th>이름</th>
                      <th>단맛</th>
                      <th>신맛</th>
                      <th>쓴맛</th>
                      <th>도수(%)</th>
                      <th>향미 카테고리</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedIngredients.length > 0 ? (
                      paginatedIngredients.map(ingredient => (
                        <tr key={ingredient.ingredient_id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIngredients.includes(ingredient.ingredient_id)}
                              onChange={() => handleSelectIngredient(ingredient.ingredient_id)}
                            />
                          </td>
                          <td>{ingredient.name}</td>
                          <td>{ingredient.sweetness}</td>
                          <td>{ingredient.sourness}</td>
                          <td>{ingredient.bitterness}</td>
                          <td>{ingredient.abv}</td>
                          <td>{ingredient.note_categories}</td>
                          <td>
                            <div className="action-buttons-container">
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => handleEditIngredient(ingredient)}
                                disabled={adding || (editing !== null && editing !== ingredient.ingredient_id)}
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
                        <td colSpan="8" className="no-data">등록된 재료가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* 재료 페이지네이션 - Pagination으로 변경 */}
              <Pagination
                currentPage={currentIngredientPage}
                totalPages={Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE)}
                onPageChange={handleIngredientPageChange}
              />
            </div>
          )}
          
          {/* 가니시 관리 */}
          {activeTab === 'garnishes' && (
            <div className="garnishes-manager">
              {/* 가니시 추가/편집 폼 */}
              {(adding || editing !== null) && (
                <div className="form-container">
                  <h3>{editing !== null ? '가니시 편집' : '새 가니시 추가'}</h3>
                  <form onSubmit={handleGarnishSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">이름</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={garnishForm.name}
                        onChange={handleGarnishChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="note_category">향미 카테고리</label>
                      <select
                        id="note_category"
                        name="note_category"
                        value={garnishForm.note_category}
                        onChange={handleGarnishChange}
                        required
                      >
                        <option value="">-- 선택하세요 --</option>
                        {noteCategories.map(category => (
                          <option 
                            key={category.note_category_id} 
                            value={category.name}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 수정: 버튼 텍스트와 아이콘 변경 */}
                    <div className="form-buttons">
                      <button type="submit" className="save-btn">
                        <FontAwesomeIcon icon={editing !== null ? faSave : faPlus} /> 
                        {editing !== null ? '저장' : '추가'}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => {
                          setAdding(false);
                          setEditing(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} /> 취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* 가니시 목록 테이블 */}
              <div className="table-scroll-wrapper">
                <table className="meta-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={isAllGarnishesSelected}
                          onChange={handleSelectAllGarnishes}
                        />
                      </th>
                      <th>이름</th>
                      <th>향미 카테고리</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGarnishes.length > 0 ? (
                      paginatedGarnishes.map(garnish => (
                        <tr key={garnish.garnish_id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedGarnishes.includes(garnish.garnish_id)}
                              onChange={() => handleSelectGarnish(garnish.garnish_id)}
                            />
                          </td>
                          <td>{garnish.garnish_name}</td>
                          <td>{garnish.note_category}</td>
                          <td>
                            <div className="action-buttons-container">
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => handleEditGarnish(garnish)}
                                disabled={adding || (editing !== null && editing !== garnish.garnish_id)}
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
                        <td colSpan="4" className="no-data">등록된 가니시가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* 가니시 페이지네이션 - Pagination으로 변경 */}
              <Pagination
                currentPage={currentGarnishPage}
                totalPages={Math.ceil(filteredGarnishes.length / ITEMS_PER_PAGE)}
                onPageChange={handleGarnishPageChange}
              />
            </div>
          )}
        </div>
      )}
      
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title={deleteType === 'ingredients' ? '선택한 재료 삭제 확인' : '선택한 가니시 삭제 확인'}
          message={deleteType === 'ingredients' 
            ? `선택한 ${selectedIngredients.length}개의 재료를 삭제하시겠습니까?`
            : `선택한 ${selectedGarnishes.length}개의 가니시를 삭제하시겠습니까?`}
        />
      )}
    </div>
  );
}

export default MetadataManager;