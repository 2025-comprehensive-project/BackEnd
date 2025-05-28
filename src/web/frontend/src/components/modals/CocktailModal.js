// src/components/modals/CocktailModal.js
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlassMartini, faListUl } from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../hooks/useApi';
import { useForm } from '../../hooks/useForm';
import { cocktailAPI } from '../../services/cocktailAPI';
import Modal from '../common/Modal';
import { LoadingMessage, ErrorMessage } from '../common/StatusMessage';
import '../../styles/pages/CocktailModal.css';

function CocktailModal({ isOpen, onClose, onSave, cocktail, mode }) {
  // API 호출 훅 사용
  const { 
    data: ingredients, 
    loading: loadingIngredients, 
    error: ingredientsError, 
    execute: fetchIngredients 
  } = useApi(cocktailAPI.getAllIngredients);
  
  const { 
    data: garnishes, 
    loading: loadingGarnishes, 
    error: garnishesError, 
    execute: fetchGarnishes 
  } = useApi(cocktailAPI.getAllGarnishes);
  
  // 초기 로드
  useEffect(() => {
    if (isOpen) {
      fetchIngredients();
      fetchGarnishes();
    }
  }, [isOpen, fetchIngredients, fetchGarnishes]);
  
  // 칵테일 폼 유효성 검사
  const validateCocktail = (data) => {
    const errors = {};
    
    if (!data.name.trim()) {
      errors.name = '칵테일 이름은 필수입니다.';
    }
    
    if (!data.ingredient1_id) {
      errors.ingredient1_id = '최소 하나의 재료는 필수입니다.';
    }
    
    if (!data.ingredient1_amount && data.ingredient1_id) {
      errors.ingredient1_amount = '재료 양은 필수입니다.';
    }
    
    if (!data.method) {
      errors.method = '메서드는 필수입니다.';
    }
    
    if (!data.glass_type) {
      errors.glass_type = '글라스 타입은 필수입니다.';
    }
    
    if (data.abv < 0 || data.abv > 100) {
      errors.abv = '알코올 도수는 0-100 사이여야 합니다.';
    }
    
    return errors;
  };
  
  // 폼 상태 관리
  const initialFormState = {
    name: '',
    ingredient1_id: '',
    ingredient1_amount: '',
    ingredient2_id: '',
    ingredient2_amount: '',
    ingredient3_id: '',
    ingredient3_amount: '',
    ingredient4_id: '',
    ingredient4_amount: '',
    garnish_id: '',
    method: 'stir',
    glass_type: 'on_the_rocks',
    abv: 0,
    summary: '',
    comments: '',
    is_signature: false
  };
  
  const {
    values: formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues
  } = useForm(initialFormState, validateCocktail);
  
  // 편집 모드일 경우 기존 데이터 로드
  useEffect(() => {
    if (mode === 'edit' && cocktail && ingredients && garnishes) {
      // 재료 이름으로 ID 찾기
      const getIngredientIdByName = (name) => {
        if (!name) return '';
        const ingredient = ingredients.find(item => item.name === name);
        return ingredient ? ingredient.ingredient_id : '';
      };
      
      // 가니시 이름으로 ID 찾기
      const getGarnishIdByName = (name) => {
        if (!name) return '';
        const garnish = garnishes.find(item => item.garnish_name === name);
        return garnish ? garnish.garnish_id : '';
      };
      
      setValues({
        name: cocktail.name || '',
        ingredient1_id: getIngredientIdByName(cocktail.ingredient1) || '',
        ingredient1_amount: cocktail.ingredient1_amount || '',
        ingredient2_id: getIngredientIdByName(cocktail.ingredient2) || '',
        ingredient2_amount: cocktail.ingredient2_amount || '',
        ingredient3_id: getIngredientIdByName(cocktail.ingredient3) || '',
        ingredient3_amount: cocktail.ingredient3_amount || '',
        ingredient4_id: getIngredientIdByName(cocktail.ingredient4) || '',
        ingredient4_amount: cocktail.ingredient4_amount || '',
        garnish_id: getGarnishIdByName(cocktail.garnish) || '',
        method: cocktail.method || 'stir',
        glass_type: cocktail.glass_type || 'on_the_rocks',
        abv: cocktail.abv || 0,
        summary: cocktail.summary || '',
        comments: cocktail.comments || '',
        is_signature: cocktail.type === 'user'
      });
    }
  }, [cocktail, mode, ingredients, garnishes, setValues]);
  
  // 폼 제출 처리
  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(onSave);
  };
  
  // 모달 푸터 버튼
  const footer = (
    <>
      <button type="button" className="cancel-btn" onClick={onClose}>취소</button>
      <button 
        type="submit" 
        className="save-btn"
        disabled={isSubmitting}
        onClick={submitForm}
      >
        {isSubmitting ? '저장 중...' : (mode === 'add' ? '추가' : '수정')}
      </button>
    </>
  );
  
  // 로딩 중이거나 오류 발생 시 처리
  const isLoading = loadingIngredients || loadingGarnishes;
  const error = ingredientsError || garnishesError;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? '칵테일 추가' : '칵테일 수정'}
      footer={footer}
      className="cocktail-modal"
    >
      {isLoading ? (
        <LoadingMessage message="데이터를 불러오는 중..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <form onSubmit={submitForm}>
          <div className="form-grid">
            {/* 기본 정보 섹션 */}
            <div className="form-section">
              <h3><FontAwesomeIcon icon={faGlassMartini} /> 기본 정보</h3>
              
              <div className="form-group">
                <label htmlFor="name">칵테일 이름 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="method">메서드 *</label>
                  <select
                    id="method"
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    className={errors.method ? 'input-error' : ''}
                  >
                    <option value="stir">젓기</option>
                    <option value="shake">흔들기</option>
                  </select>
                  {errors.method && <div className="error-text">{errors.method}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="glass_type">글라스 *</label>
                  <select
                    id="glass_type"
                    name="glass_type"
                    value={formData.glass_type}
                    onChange={handleChange}
                    className={errors.glass_type ? 'input-error' : ''}
                  >
                    <option value="on_the_rocks">온더락</option>
                    <option value="martini">마티니</option>
                    <option value="long_drink">롱드링크</option>
                    <option value="sour">사워</option>
                    <option value="coupe">쿠페</option>
                    <option value="margarita">마가리타</option>
                    {/* <option value="shot">샷</option> */}
                  </select>
                  {errors.glass_type && <div className="error-text">{errors.glass_type}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="abv">알코올 도수 (%)</label>
                <input
                  type="number"
                  id="abv"
                  name="abv"
                  value={formData.abv}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={errors.abv ? 'input-error' : ''}
                />
                {errors.abv && <div className="error-text">{errors.abv}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="garnish_id">가니시</label>
                <select
                  id="garnish_id"
                  name="garnish_id"
                  value={formData.garnish_id}
                  onChange={handleChange}
                >
                  <option value="">선택 안함</option>
                  {garnishes && garnishes.map(garnish => (
                    <option 
                      key={garnish.garnish_id} 
                      value={garnish.garnish_id}
                    >
                      {garnish.garnish_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 시그니처 칵테일 체크박스 */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_signature"
                    checked={formData.is_signature}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">시그니처 칵테일로 저장</span>
                </label>
              </div>
            </div>
            
            {/* 재료 섹션 */}
            <div className="form-section">
              <h3><FontAwesomeIcon icon={faListUl} /> 재료</h3>
              
              {/* 재료 1 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ingredient1_id">재료 1 *</label>
                  <select
                    id="ingredient1_id"
                    name="ingredient1_id"
                    value={formData.ingredient1_id}
                    onChange={handleChange}
                    className={errors.ingredient1_id ? 'input-error' : ''}
                  >
                    <option value="">선택하세요</option>
                    {ingredients && ingredients.map(ingredient => (
                      <option 
                        key={ingredient.ingredient_id} 
                        value={ingredient.ingredient_id}
                      >
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                  {errors.ingredient1_id && <div className="error-text">{errors.ingredient1_id}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="ingredient1_amount">양 *</label>
                  <input
                    type="text"
                    id="ingredient1_amount"
                    name="ingredient1_amount"
                    value={formData.ingredient1_amount}
                    onChange={handleChange}
                    placeholder="예: 1.5oz, 30ml"
                    className={errors.ingredient1_amount ? 'input-error' : ''}
                  />
                  {errors.ingredient1_amount && <div className="error-text">{errors.ingredient1_amount}</div>}
                </div>
              </div>
              
              {/* 재료 2 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ingredient2_id">재료 2</label>
                  <select
                    id="ingredient2_id"
                    name="ingredient2_id"
                    value={formData.ingredient2_id}
                    onChange={handleChange}
                  >
                    <option value="">선택 안함</option>
                    {ingredients && ingredients.map(ingredient => (
                      <option 
                        key={ingredient.ingredient_id} 
                        value={ingredient.ingredient_id}
                      >
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ingredient2_amount">양</label>
                  <input
                    type="text"
                    id="ingredient2_amount"
                    name="ingredient2_amount"
                    value={formData.ingredient2_amount}
                    onChange={handleChange}
                    placeholder="예: 1.5oz, 30ml"
                    disabled={!formData.ingredient2_id}
                  />
                </div>
              </div>
              
              {/* 재료 3 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ingredient3_id">재료 3</label>
                  <select
                    id="ingredient3_id"
                    name="ingredient3_id"
                    value={formData.ingredient3_id}
                    onChange={handleChange}
                  >
                    <option value="">선택 안함</option>
                    {ingredients && ingredients.map(ingredient => (
                      <option 
                        key={ingredient.ingredient_id} 
                        value={ingredient.ingredient_id}
                      >
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ingredient3_amount">양</label>
                  <input
                    type="text"
                    id="ingredient3_amount"
                    name="ingredient3_amount"
                    value={formData.ingredient3_amount}
                    onChange={handleChange}
                    placeholder="예: 1.5oz, 30ml"
                    disabled={!formData.ingredient3_id}
                  />
                </div>
              </div>
              
              {/* 재료 4 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ingredient4_id">재료 4</label>
                  <select
                    id="ingredient4_id"
                    name="ingredient4_id"
                    value={formData.ingredient4_id}
                    onChange={handleChange}
                  >
                    <option value="">선택 안함</option>
                    {ingredients && ingredients.map(ingredient => (
                      <option 
                        key={ingredient.ingredient_id} 
                        value={ingredient.ingredient_id}
                      >
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ingredient4_amount">양</label>
                  <input
                    type="text"
                    id="ingredient4_amount"
                    name="ingredient4_amount"
                    value={formData.ingredient4_amount}
                    onChange={handleChange}
                    placeholder="예: 1.5oz, 30ml"
                    disabled={!formData.ingredient4_id}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 설명 섹션 */}
          <div className="form-section full-width">
            <div className="form-group">
              <label htmlFor="summary">맛 설명</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="2"
                placeholder="칵테일의 맛에 대한 간략한 설명"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="comments">코멘트</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="3"
                placeholder="추가 코멘트나 제조 팁"
              />
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default CocktailModal;