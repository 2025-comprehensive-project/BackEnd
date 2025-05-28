import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 필요한 파일 경로
MODEL_PATH = os.path.join(BASE_DIR, '../models/cocktail_quality_predictor.pkl')
FEATURE_PATH = os.path.join(BASE_DIR, '../datas/ingredient_features_eng.csv')

# 양 단위 변환 함수
def convert_to_ml(amount_str):
    if not amount_str:
        return 0

    if isinstance(amount_str, (int, float)):
        return float(amount_str)

    lower = amount_str.lower()
    if 'oz' in lower:
        return float(lower.replace('oz', '').strip()) * 30
    elif 'dash' in lower:
        return float(lower.replace('dash', '').strip()) * 5
    elif 'ml' in lower:
        return float(lower.replace('ml', '').strip())
    else:
        try:
            return float(lower) * 30
        except:
            return 0

# 벡터 생성 함수
def recipe_to_vector(recipe, ingredient_features_df):
    vector = np.zeros(len(ingredient_features_df.columns))
    total_ml = 0

    for name, amount_str in recipe.items():
        if name not in ingredient_features_df.index:
            continue
        ml = convert_to_ml(amount_str)
        total_ml += ml
        vector += ingredient_features_df.loc[name].values * ml

    if total_ml > 0:
        vector /= total_ml

    return vector

# 메인 실행 로직
if __name__ == '__main__':
    try:
        # 모델 및 feature 불러오기
        model = joblib.load(MODEL_PATH)
        df_features = pd.read_csv(FEATURE_PATH, index_col=0)

        # 입력 받기
        input_json = sys.stdin.read()
        recipe = json.loads(input_json)  # 예: {"진": "1oz", "비터스": "1dash"}

        # print("📦 입력된 레시피:", recipe, file=sys.stderr)

        ingredient_mapping = {
            '진': 'gin',
            '럼': 'rum',
            '보드카': 'vodka',
            '위스키': 'whiskey',
            '브랜디': 'brandy',
            '데킬라': 'tequila',
            '압생트': 'absinthe',
            '문샤인': 'moonshine',
            '오렌지 리큐르': 'orange_liqueur',
            '블루 큐라소': 'blue_curacao',
            '오렌지 주스': 'orange_juice',
            '라임 주스': 'lime_juice',
            '레몬 주스': 'lemon_juice',
            '체리 리큐르': 'cherry_liqueur',
            '크랜베리 주스': 'cranberry_juice',
            '파인애플 주스': 'pineapple_juice',
            '아몬드 리큐르': 'almond_liqueur',
            '심플 시럽': 'simple_syrup',
            '커피 리큐르': 'coffee_liqueur',
            '허브 리큐르': 'herbal_liqueur',
            '드라이 베르무트': 'dry_vermouth',
            '스위트 베르무트': 'sweet_vermouth',
            '비터스': 'bitters',
            '우유': 'milk',
            '탄산수': 'soda',
            '그레나딘 시럽': 'grenadine_syrup',

            # 🍋 Garnish 추가
            '레몬 필': 'lemon_peel',
            '레몬 웨지': 'lemon_wedge',
            '레몬 슬라이스': 'lemon_slice',
            '라임 필': 'lime_peel',
            '라임 웨지': 'lime_wedge',
            '라임 슬라이스': 'lime_slice',
            '오렌지 필': 'orange_peel',
            '오렌지 웨지': 'orange_wedge',
            '오렌지 슬라이스': 'orange_slice',
            '체리': 'cherry',
            '애플민트': 'apple_mint'
        }

        # 매핑 적용
        mapped_recipe = {}
        for kor_name, amount in recipe.items():
            eng_name = ingredient_mapping.get(kor_name)
            if eng_name:
                mapped_recipe[eng_name] = amount

        # 벡터 변환
        vector = recipe_to_vector(mapped_recipe, df_features)

        # 예측
        prediction = model.predict([vector])[0]

                # 결과 구성
        feature_names = [
            'abv', 'sweetness', 'sourness', 'bitterness', 'body',
            'herbal', 'coffee', 'fruity', 'citrus', 'creamy',
            'berry', 'tropical', 'sweet', 'smoky', 'spicy', 'nutty', 'plain'
        ]

        prediction = [min(max(val, 0), 10) for val in prediction]

        result_raw = {
            feature: round(prediction[i], 1)
            for i, feature in enumerate(feature_names)
        }

        # 맛 점수 변환 (0~5)
        taste_keys = ['sweetness', 'sourness', 'bitterness']
        flavor_keys = [
            'herbal', 'coffee', 'fruity', 'citrus', 'creamy',
            'berry', 'tropical', 'sweet', 'smoky', 'spicy', 'nutty', 'plain'
        ]

        taste_scores = {k: int(round(result_raw.get(k, 0) * 0.5)) for k in taste_keys}
        flavor_scores = {k: result_raw.get(k, 0) for k in flavor_keys}

        # 상위 2개 향미
        top_flavors = sorted(flavor_scores.items(), key=lambda x: x[1], reverse=True)[:2]
        flavor_notes = [f[0].title().replace('_', '') for f in top_flavors]

        # 최종 구조
        output = {
            "flavor_profile": {
                "sweetness": taste_scores["sweetness"],
                "sourness": taste_scores["sourness"],
                "bitterness": taste_scores["bitterness"],
                "flavorNotes": flavor_notes
            }
        }
        # print("📦 벡터 값:", vector.tolist(), file=sys.stderr)
        # print("🧠 예측 결과 원본:", prediction, file=sys.stderr)
        print(json.dumps(output))


    except Exception as e:
        print(f"예측 중 오류 발생: {str(e)}", file=sys.stderr)
        sys.exit(1)
