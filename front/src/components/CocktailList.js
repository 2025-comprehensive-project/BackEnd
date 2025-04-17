// src/components/CocktailList.js
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../contexts/DataContext'; // DataContext 임포트

function CocktailList() {
  const { cocktails, addCocktail, updateCocktail, deleteCocktail } = useContext(DataContext); // DataContext 사용
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const COCKTAILS_PER_PAGE = 5;

  const filteredCocktails = cocktails.filter(cocktail =>
    cocktail.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === '' || cocktail.category === categoryFilter)
  );

  const sortedCocktails = [...filteredCocktails].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  const paginatedCocktails = sortedCocktails.slice(
    (currentPage - 1) * COCKTAILS_PER_PAGE,
    currentPage * COCKTAILS_PER_PAGE
  );

  const totalPages = Math.ceil(sortedCocktails.length / COCKTAILS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDelete = (cocktailId) => {
    if (window.confirm('이 칵테일을 삭제하시겠습니까?')) {
      deleteCocktail(cocktailId);
    }
  };

  return (
    <>
      <header className="content-header">
        <h1>칵테일 목록</h1>
        <button className="add-cocktail-btn">
          <FontAwesomeIcon icon={faPlus} /> 칵테일 추가
        </button>
      </header>

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
          <label htmlFor="category-filter">카테고리:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="럼">럼</option>
            <option value="진">진</option>
            <option value="위스키">위스키</option>
            <option value="보드카">보드카</option>
            <option value="데킬라">데킬라</option>
            <option value="브랜디">브랜디</option>
            <option value="혼합">혼합</option>
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
            <option value="category">카테고리</option>
            <option value="flavor">맛 설명</option>
            <option value="abv">알코올 도수</option>
            <option value="method">메서드</option>
          </select>
        </div>
      </div>

      <div className="table-scroll-wrapper">
      <table className="cocktail-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>카테고리</th>
            <th>맛 설명</th>
            <th>재료</th>
            <th>잔 종류</th>
            <th>알코올 도수</th>
            <th>메서드</th>
            <th>양(oz)</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCocktails.map(cocktail => (
            <tr key={cocktail.id}>
              <td>{cocktail.name}</td>
              <td>{cocktail.category}</td>
              <td>{cocktail.flavor}</td>
              <td>{cocktail.ingredients}</td>
              <td>{cocktail.glass}</td>
              <td>{cocktail.abv}</td>
              <td>{cocktail.method}</td>
              <td>{cocktail.oz}</td>
              <td>
                <button className="action-btn edit-btn" data-id={cocktail.id}>수정</button>
                <button 
                  className="action-btn delete-btn" 
                  data-id={cocktail.id}
                  onClick={() => handleDelete(cocktail.id)}
                >삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="pagination">
        <button
          id="prev-page"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} /> 이전
        </button>
        <span id="page-info">{currentPage} / {totalPages}</span>
        <button
          id="next-page"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          다음 <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </>
  );
}

export default CocktailList;