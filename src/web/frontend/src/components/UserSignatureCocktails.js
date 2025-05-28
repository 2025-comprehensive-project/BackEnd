// src/components/UserSignatureCocktails.js
// 이 파일은 userAPI를 사용하지 않으므로 변경할 필요가 없습니다.
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSync, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cocktailAPI } from '../services/cocktailAPI';
import '../styles/pages/UserSignatureCocktails.css';

function UserSignatureCocktails({ userId }) {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCocktails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await cocktailAPI.getUserSignatureCocktailsByUserId(userId);
      setCocktails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('시그니처 칵테일 로드 실패:', error);
      setError('시그니처 칵테일을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadCocktails();
    }
  }, [userId]);

  return (
    <div className="user-signature-cocktails">
      <div className="signature-header">
        <h3>시그니처 칵테일</h3>
        <button 
          className="refresh-btn"
          onClick={loadCocktails}
          disabled={loading}
        >
          <FontAwesomeIcon icon={loading ? faSpinner : faSync} spin={loading} /> 
          새로고침
        </button>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      {/* 로딩 메시지 */}
      {loading && (
        <div className="loading-message">
          <FontAwesomeIcon icon={faSpinner} spin /> 데이터를 불러오는 중...
        </div>
      )}

      {/* 칵테일 목록 */}
      {!loading && !error && cocktails.length === 0 && (
        <p className="no-cocktails">등록된 시그니처 칵테일이 없습니다.</p>
      )}

      {!loading && !error && cocktails.length > 0 && (
        <div className="table-responsive">
          <table className="signature-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>주요 재료</th>
                <th>메서드</th>
                <th>도수(%)</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {cocktails.map((cocktail, index) => (
                <tr key={cocktail.recipe_id || cocktail.id || index}>
                  <td>{cocktail.name}</td>
                  <td>
                    {cocktail.ingredient1} {cocktail.ingredient1_amount}
                    {cocktail.ingredient2 && `, ${cocktail.ingredient2} ${cocktail.ingredient2_amount}`}
                  </td>
                  <td>{cocktail.method}</td>
                  <td>{cocktail.abv}</td>
                  <td>{new Date(cocktail.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserSignatureCocktails;