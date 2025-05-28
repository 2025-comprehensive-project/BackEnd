// src/components/ai/ModelEvaluator.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCircleNotch, faStar, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import { aiAPI } from '../../services/aiAPI';
import { ErrorMessage, LoadingMessage, SuccessMessage } from '../common/StatusMessage';
import '../../styles/ai/ModelEvaluator.css';

function ModelEvaluator({ serverStatus }) {
  const [formData, setFormData] = useState({
    model_type: 'base',
    dataset_path: '',
    npc_id: '',
    // user_id: '',  // rola용 - 주석 처리
    slot_id: 1
  });

  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ✅ 동적으로 불러올 NPC 목록
  const [npcList, setNpcList] = useState([]);

  useEffect(() => {
    const fetchNpcList = async () => {
      try {
        const versionData = await aiAPI.getModelVersions();
        const npcSet = new Set();

        (versionData.loraAdapterVersions || []).forEach(version => {
          const npc = version.split('-')[0];
          if (npc) npcSet.add(npc);
        });

        setNpcList(Array.from(npcSet));
      } catch (err) {
        console.error('❌ NPC 목록 불러오기 실패:', err);
      }
    };

    fetchNpcList();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === 'model_type') {
      if (value === 'base') {
        setFormData(prev => ({
          ...prev,
          model_type: value,
          dataset_path: '',
          npc_id: '',
          // user_id: '',  // rola 주석 처리
          slot_id: 1
        }));
      } else if (value === 'lora') {
        setFormData(prev => ({
          ...prev,
          model_type: value,
          // user_id: '', // rola 주석 처리
          slot_id: 1
        }));
      }
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();

    if (!formData.model_type) {
      setError('모델 타입은 필수입니다.');
      return;
    }

    if (formData.model_type !== 'base' && !formData.dataset_path) {
      setError('데이터셋 경로는 base 모델 외에는 필수입니다.');
      return;
    }

    if (formData.model_type === 'lora' && !formData.npc_id) {
      setError('LoRA 평가 시 NPC ID는 필수입니다.');
      return;
    }

    /*
    if (formData.model_type === 'rola') {
      if (!formData.npc_id) {
        setError('RoLA 평가 시 NPC ID는 필수입니다.');
        return;
      }
      if (!formData.user_id) {
        setError('RoLA 평가 시 User ID는 필수입니다.');
        return;
      }
    }
    */

    if (!serverStatus || serverStatus.status !== 'running') {
      setError('평가를 실행하려면 Flask 서버가 실행 중이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setEvaluationResult(null);

      const requestData = {
        model_type: formData.model_type
      };

      if (formData.model_type !== 'base' || formData.dataset_path) {
        requestData.dataset_path = formData.dataset_path;
      }

      if (formData.model_type === 'lora' /* || formData.model_type === 'rola' */) {
        requestData.npc_id = formData.npc_id;
      }

      /*
      if (formData.model_type === 'rola') {
        requestData.user_id = formData.user_id;
        requestData.slot_id = formData.slot_id;
      }
      */

      const result = await aiAPI.evaluateModel(requestData);

      setEvaluationResult(result);
      setSuccess('모델 평가가 성공적으로 완료되었습니다.');
    } catch (err) {
      console.error('모델 평가 실패:', err);
      setError(`평가 실패: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderEvaluationResult = () => {
    if (!evaluationResult) return null;

    const formatScore = (score) => {
      if (score === 0 || score === null || score === undefined) {
        return "0.0000%";
      }
      if (score > 0 && score < 0.0001) {
        return "< 0.0001%";
      }
      return (score * 100).toFixed(4) + '%';
    };

    return (
      <div className="evaluation-result">
        <h3>
          <FontAwesomeIcon icon={faStar} className="result-icon" />
          평가 결과
        </h3>

        <div className="score-cards">
          <div className="score-card">
            <div className="score-label">BERT Score</div>
            <div className="score-value">{formatScore(evaluationResult.bert_score)}</div>
            <div className="score-description">
              문맥적 유사도 (높을수록 응답이 정확함)
            </div>
          </div>

          <div className="score-card">
            <div className="score-label">BLEU Score</div>
            <div className="score-value">{formatScore(evaluationResult.bleu_score)}</div>
            <div className="score-description">
              어휘적 유사도 (높을수록 어휘 사용이 적절함)
            </div>
          </div>
        </div>

        <div className="evaluation-summary">
          <p>
            {evaluationResult.bert_score > 0.8
              ? '🟢 문맥 이해도가 매우 높습니다.'
              : evaluationResult.bert_score > 0.7
              ? '🟡 문맥 이해도가 적절합니다.'
              : '🔴 문맥 이해도가 개선될 여지가 있습니다.'}
          </p>
          <p>
            {evaluationResult.bleu_score > 0.5
              ? '🟢 응답 품질이 매우 높습니다.'
              : evaluationResult.bleu_score > 0.4
              ? '🟡 응답 품질이 적절합니다.'
              : '🔴 응답 품질이 개선될 여지가 있습니다.'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="model-evaluator">
      <div className="evaluator-header">
        <h3>
          <FontAwesomeIcon icon={faChartLine} className="header-icon" />
          모델 성능 평가
        </h3>
      </div>

      {loading && <LoadingMessage message="모델 평가 중..." />}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {!serverStatus || serverStatus.status !== 'running' ? (
        <div className="server-warning">
          <p>⚠️ 평가를 실행하려면 Flask 서버가 실행 중이어야 합니다.</p>
          <p>서버 컨트롤 섹션에서 서버를 시작해주세요.</p>
        </div>
      ) : (
        <>
          <form className="evaluation-form" onSubmit={handleEvaluate}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="model_type">평가 대상 모델 타입</label>
                <select
                  id="model_type"
                  name="model_type"
                  value={formData.model_type}
                  onChange={handleChange}
                  required
                >
                  <option value="base">베이스 모델</option>
                  <option value="lora">LoRA 어댑터 모델</option>
                  {/* <option value="rola">RoLA 모델 (사용자별 튜닝)</option> */}
                </select>
              </div>

              {(formData.model_type === 'lora') /* || formData.model_type === 'rola' */ ? (
                <div className="form-group">
                  <label htmlFor="npc_id">NPC ID</label>
                  <select
                    id="npc_id"
                    name="npc_id"
                    value={formData.npc_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- 선택하세요 --</option>
                    {npcList.map((npc) => (
                      <option key={npc} value={npc}>
                        {npc}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {formData.model_type !== 'base' && (
              <div className="form-group">
                <label htmlFor="dataset_path">
                  데이터셋 경로 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="dataset_path"
                  name="dataset_path"
                  value={formData.dataset_path}
                  onChange={handleChange}
                  placeholder="예: data/eval/lora/silvia_testset.jsonl"
                  required
                />
                <small className="form-hint">
                  베이스 모델은 내부 기본 경로가 사용됩니다.
                </small>
              </div>
            )}

            {/* 
            {formData.model_type === 'rola' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="user_id">
                    유저 ID <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="user_id"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    placeholder="예: 12"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slot_id">슬롯 ID</label>
                  <select
                    id="slot_id"
                    name="slot_id"
                    value={formData.slot_id}
                    onChange={handleChange}
                  >
                    <option value={1}>슬롯 1</option>
                    <option value={2}>슬롯 2</option>
                    <option value={3}>슬롯 3</option>
                  </select>
                </div>
              </div>
            )} */}

            <div className="form-actions">
              <button
                type="submit"
                className="evaluate-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                    평가 중...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faChartLine} />
                    모델 평가 실행
                  </>
                )}
              </button>
            </div>
          </form>

          {renderEvaluationResult()}
        </>
      )}
    </div>
  );
}

export default ModelEvaluator;