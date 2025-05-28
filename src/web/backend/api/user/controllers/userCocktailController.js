// src/api/user/controllers/userCocktailController.js
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const { logger } = require('../../../utils/logger'); // 로거 유틸리티
const path = require('path'); // 경로 관련 모듈
const { spawn } = require('child_process'); // Python 스크립트를 실행하기 위한 모듈
const { convertToMl, calculateAbv } = require('../../../utils/abvCalculator');
const { parseAmount } = require('../../../utils/flavorCalculator'); // ml 변환 유틸


const DEMO_MODE = process.env.DEMO_MODE === 'True';

// 1. 유저 시그니처 레시피 조회
// GET /api/user/cocktails/signature
// 나중에 AI로 예측한 맛, 향미 출력해야함.
const getUserCocktails = async (req, res, next) => {
    const user_id = DEMO_MODE ? 1 : req.user?.user_id; // JWT에서 userId 추출
    // const recipe_id = req.params; // URL 파라미터에서 recipeId 추출
  
    try {
      const [rows] = await db.query(`
        SELECT
          cr.recipe_id,
          cr.name,
  
          i1.name AS ingredient1,
          cr.ingredient1_amount,
          i2.name AS ingredient2,
          cr.ingredient2_amount,
          i3.name AS ingredient3,
          cr.ingredient3_amount,
          i4.name AS ingredient4,
          cr.ingredient4_amount,
          g.name AS garnish,
  
          cr.method,
          cr.glass_type,
          cr.abv,
          cr.summary,
          cr.comments,
          cr.creator_id,
          cr.created_at
        FROM cocktail_recipe cr
        LEFT JOIN ingredient i1 ON cr.ingredient1_id = i1.ingredient_id
        LEFT JOIN ingredient i2 ON cr.ingredient2_id = i2.ingredient_id
        LEFT JOIN ingredient i3 ON cr.ingredient3_id = i3.ingredient_id
        LEFT JOIN ingredient i4 ON cr.ingredient4_id = i4.ingredient_id
        LEFT JOIN garnish_type g ON cr.garnish_id = g.garnish_id
        WHERE cr.creator_id = ?
        ORDER BY cr.created_at DESC
      `, [user_id]);
  
      if (rows.length === 0) {
        return res.json([]); // 빈 배열 반환
      }
  
      res.json(rows);
    } catch (err) {
        logger.error('❌ 유저 시그니처 칵테일 조회 실패:', err);
        next(createError(500, '❌ 유저 시그니처 칵테일 조회 실패', 'GET_MY_COCKTAILS_FAILED'));
    }
  };

// 2. 유저 시그니처 레시피 저장
// 유저가 만든 칵테일 레시피를 저장하는 API 
// POST /api/user/cocktails/signature
// 도수 계산을 위해 재료의 abv를 조회하고, 이를 기반으로 도수를 계산합니다.
const createUserCocktail = async (req, res, next) => {
  const user_id = DEMO_MODE ? 1 : req.user?.user_id;
  const {
    name,
    ingredient1_id, ingredient1_amount,
    ingredient2_id, ingredient2_amount,
    ingredient3_id, ingredient3_amount,
    ingredient4_id, ingredient4_amount,
    garnish_id,
    method,
    ice_in_shake,
    glass_type,
    summary,
    comment
  } = req.body;

  console.log("전달받은 정보: ", name, ingredient1_id, ingredient1_amount, ingredient2_id, ingredient2_amount, ingredient3_id, ingredient3_amount, ingredient4_id, ingredient4_amount, garnish_id, method, ice_in_shake, glass_type, summary, comment);

  // ✅ 필수값 검증
  if (!name || !ingredient1_id || !ingredient1_amount || !glass_type) {
    logger.error('❌ 필수 필드 누락:', req.body);
    return next(createError(400, '❌ 칵테일 이름, 첫 번째 재료(id, amount), 글라스타입(glass_type)은 필수입니다.', 'MISSING_REQUIRED_FIELDS'));
  }

  try {
    const ids = [ingredient1_id, ingredient2_id, ingredient3_id, ingredient4_id];
    const [rows] = await db.query(
      `SELECT ingredient_id, abv FROM ingredient WHERE ingredient_id IN (?, ?, ?, ?)`,
      ids
    );

    const abvMap = {};
    rows.forEach(row => {
      abvMap[row.ingredient_id] = { abv: row.abv };
    });

    const ingredients = [
      { id: ingredient1_id, amountStr: ingredient1_amount },
      { id: ingredient2_id, amountStr: ingredient2_amount },
      { id: ingredient3_id, amountStr: ingredient3_amount },
      { id: ingredient4_id, amountStr: ingredient4_amount },
    ];

    const abv = calculateAbv(ingredients, abvMap, glass_type);

    const [result] = await db.query(`
      INSERT INTO cocktail_recipe (
        name,
        ingredient1_id, ingredient1_amount,
        ingredient2_id, ingredient2_amount,
        ingredient3_id, ingredient3_amount,
        ingredient4_id, ingredient4_amount,
        garnish_id,
        method, ice_in_shake, glass_type,
        abv, summary, comments,
        creator_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        ingredient1_id, ingredient1_amount,
        ingredient2_id, ingredient2_amount,
        ingredient3_id, ingredient3_amount,
        ingredient4_id, ingredient4_amount,
        garnish_id,
        method, ice_in_shake, glass_type,
        abv, summary, comment,
        user_id
      ]
    );

    res.status(201).json({
      message: '✅ 유저 칵테일 레시피 저장 완료',
      recipe_id: result.insertId,
      abv
    });
  } catch (err) {
    logger.error('❌ 유저 칵테일 레시피 저장 실패:', err);
    next(createError(500, '❌ 유저 칵테일 저장 실패', 'CREATE_MY_COCKTAIL_FAILED'));
  }
};

// 3. 시그니처 칵테일 예측 (AI 모델 호출)
// POST /api/user/cocktails/predict
// src/api/user/controllers/userCocktailController.js
const predictUserCocktail = async (req, res, next) => {
  const {
    ingredient1_id, ingredient1_amount,
    ingredient2_id, ingredient2_amount,
    ingredient3_id, ingredient3_amount,
    ingredient4_id, ingredient4_amount,
    garnish_id,
    glass_type
  } = req.body;

  try {
    const ids = [ingredient1_id, ingredient2_id, ingredient3_id, ingredient4_id];
    const [rows] = await db.query(
      `SELECT ingredient_id, name, abv FROM ingredient WHERE ingredient_id IN (?, ?, ?, ?)`,
      ids
    );

    // ✅ 재료 ID → name + abv 매핑
    const abvMap = {};
    const ingredientMap = {};
    rows.forEach(row => {
      ingredientMap[row.ingredient_id] = row.name; 
    });

    const ingredients = [
      { id: ingredient1_id, amountStr: ingredient1_amount },
      { id: ingredient2_id, amountStr: ingredient2_amount },
      { id: ingredient3_id, amountStr: ingredient3_amount },
      { id: ingredient4_id, amountStr: ingredient4_amount },
    ];

    // ✅ 벡터 입력 및 도수 계산
    const vectorInput = {};
    for (const { id, amountStr } of ingredients) {
      const name = ingredientMap[id];
      if (name) vectorInput[name] = convertToMl(amountStr);
    }

    // abv 계산
    rows.forEach(row => {
      abvMap[row.ingredient_id] = { abv: row.abv };
    });  

    const abv = calculateAbv(ingredients, abvMap, glass_type);

    // 🔁 파이썬 예측
    const scriptPath = path.resolve(__dirname, '../../../../../ai/cocktail_predictor/scripts/predict_cocktail.py');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const py = spawn(pythonCmd, [scriptPath]);
    let result = '', error = '';

    py.stdin.write(JSON.stringify(vectorInput));
    py.stdin.end();

    py.stdout.on('data', (data) => { result += data.toString(); });
    py.stderr.on('data', (data) => { error += data.toString(); });

    py.on('close', (code) => {
      if (code !== 0 || error) {
        console.error('❌ Python 예측 오류:', error);
        return next(createError(500, '❌ 칵테일 예측 실패', 'COCKTAIL_PREDICTION_FAILED'));
      }

      try {
        const output = JSON.parse(result);

        const {
          sweetness,
          sourness,
          bitterness,
          flavorNotes
        } = output.flavor_profile;

        return res.json({
          abv,
          flavor_profile: {
              sweetness,
              sourness,
              bitterness,
              flavorNotes
          }
        });

      } catch (e) {
        console.error('❌ 예측 결과 파싱 실패:', e);
        return next(createError(500, '❌ 예측 결과 파싱 실패', 'PREDICTION_PARSE_FAILED'));
      }
    });
  } catch (err) {
    console.error('❌ 예측 요청 처리 중 오류:', err);
    next(createError(500, '❌ 예측 요청 처리 실패', 'PREDICT_USER_COCKTAIL_FAILED'));
  }
};

module.exports = { getUserCocktails, createUserCocktail, predictUserCocktail };