// src/components/ai/TrainingForm.js - 수정된 버전
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { LoadingMessage, ErrorMessage } from '../common/StatusMessage';
import '../../styles/ai/TrainingForm.css';

function TrainingForm({ type, onSubmit, serverRunning }) {
  const [formData, setFormData] = useState(
    type === 'base' 
      ? {
          version: '',
          base_model: 'meta-llama/Llama-3.2-1B',
          source: 'beomi',
          train_path: '',
          val_path: '',
          epochs: 3,
          batch_size: 1,
          learning_rate: 0.00002,
          max_len: 1024,
          resume: false
        }
      : {
          version: '',
          npc: '',
          base_version: '',
          target: '',
          merge: false,
          resume: false,
          hyper: {
            epochs: 3,
            lr: 0.0002,
            bsz: 1,
            gradAcc: 8,
            maxLen: 1024
          }
        }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 폼 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (type === 'number' || name === 'learning_rate') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 폼 제출 핸들러 - 서버 실행 여부 체크 제거
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 타입에 따른 유효성 검사
    if (type === 'base') {
      if (!formData.version || !formData.base_model) {
        setError('버전과 베이스 모델은 필수 항목입니다.');
        return;
      }
      
      if (formData.source === 'custom' && (!formData.train_path || !formData.val_path)) {
        setError('커스텀 소스 사용 시 학습 및 검증 데이터 경로는 필수입니다.');
        return;
      }
    } else if (type === 'lora') {
      if (!formData.version || !formData.npc || !formData.base_version || !formData.target) {
        setError('버전, NPC ID, 베이스 모델 버전, 학습 대상 ID는 필수 항목입니다.');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await onSubmit(formData);
      if (result === null) {
        return;
      }
    } catch (err) {
      setError(`학습 시작 실패: ${err.message || '알 수 없는 오류'}`);
      console.error('학습 시작 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 서버 실행 중 경고 메시지 표시
  const renderServerRunningWarning = () => {
    if (!serverRunning) return null;
    
    return (
      <div className="server-running-warning">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>서버가 실행 중입니다. 학습을 시작하면 서버가 자동으로 종료됩니다.</span>
      </div>
    );
  };

  return (
    <form className="training-form" onSubmit={handleSubmit}>
      {loading && <LoadingMessage message="학습 시작 중..." />}
      {error && <ErrorMessage message={error} />}
      {renderServerRunningWarning()}
      
      {type === 'base' && (
        <>
          <div className="form-group">
            <label htmlFor={`${type}-version`}>
              버전 <span className="required">*</span>
            </label>
            <input
              type="text"
              id={`${type}-version`}
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="v1.5"
              required
            />
            <small className="form-hint">
              베이스 모델 버전 (예: v1.0, v1.5)
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor={`${type}-base-model`}>
              베이스 모델 <span className="required">*</span>
            </label>
            <input
              type="text"
              id={`${type}-base-model`}
              name="base_model"
              value={formData.base_model}
              onChange={handleChange}
              placeholder="TinyLlama/TinyLlama-1.1B-Chat-v1.0"
              required
            />
            <small className="form-hint">
              사용할 베이스 모델의 HuggingFace ID
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="source">데이터셋 소스</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="beomi">기본 데이터셋 (beomi/KoAlpaca-RealQA)</option>
              <option value="jojo">한국어 안전 대화 데이터셋 (jojo0217/korean_safe_conversation)</option>
              <option value="custom">커스텀 데이터셋</option>
            </select>
            <small className="form-hint">
              <FontAwesomeIcon icon={faInfoCircle} /> 
              beomi와 jojo는 자동으로 데이터셋이 설정됩니다.
            </small>
          </div>
          
          {formData.source === 'custom' && (
            <>
              <div className="form-group">
                <label htmlFor="train-path">
                  학습 데이터 경로 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="train-path"
                  name="train_path"
                  value={formData.train_path}
                  onChange={handleChange}
                  placeholder="./data/train.json"
                  required
                />
                <small className="form-hint">
                  서버 상의 학습 데이터 JSONL 파일 경로
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="val-path">
                  검증 데이터 경로 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="val-path"
                  name="val_path"
                  value={formData.val_path}
                  onChange={handleChange}
                  placeholder="./data/val.json"
                  required
                />
                <small className="form-hint">
                  서버 상의 검증 데이터 JSONL 파일 경로
                </small>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="resume" className="checkbox-label">
              <input
                type="checkbox"
                id="resume"
                name="resume"
                checked={formData.resume}
                onChange={handleChange}
              />
              <span>이전 체크포인트에서 학습 재개</span>
            </label>
            <small className="form-hint">
              <FontAwesomeIcon icon={faInfoCircle} /> 
              이전에 중단된 학습이 있는 경우 이어서 학습합니다.
            </small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="epochs">에폭 수</label>
              <input
                type="number"
                id="epochs"
                name="epochs"
                value={formData.epochs}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="batch-size">배치 사이즈</label>
              <input
                type="number"
                id="batch-size"
                name="batch_size"
                value={formData.batch_size}
                onChange={handleChange}
                min="1"
                max="8"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="learning-rate">학습률</label>
              <input
                type="number"
                id="learning-rate"
                name="learning_rate"
                value={formData.learning_rate}
                onChange={handleChange}
                step="0.000001"
                min="0.000001"
                max="0.001"
              />
              <small className="form-hint">
                2e-5는 0.00002로 입력
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="max-len">최대 길이</label>
              <input
                type="number"
                id="max-len"
                name="max_len"
                value={formData.max_len}
                onChange={handleChange}
                min="512"
                max="2048"
                step="128"
              />
            </div>
          </div>
        </>
      )}
      
      {type === 'lora' && (
        <>
          <div className="form-group">
            <label htmlFor="version">
              버전 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="1"
              required
            />
            <small className="form-hint">
              커스텀 버전 번호 (예: 1, 2, 3) - 최종 버전명은 "npc-base_version.version" 형식으로 생성됨
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="npc">
              NPC ID <span className="required">*</span>
            </label>
            <input
              type="text"
              id="npc"
              name="npc"
              value={formData.npc}
              onChange={handleChange}
              placeholder="silvia"
              required
            />
            <small className="form-hint">
              학습할 NPC의 ID (예: silvia, sol)
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="base_version">
              베이스 모델 버전 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="base_version"
              name="base_version"
              value={formData.base_version}
              onChange={handleChange}
              placeholder="v1.5"
              required
            />
            <small className="form-hint">
              사용할 베이스 모델의 버전 (예: v1.5)
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="target">
              학습 대상 ID <span className="required">*</span>
            </label>
            <input
              type="text"
              id="target"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="silvia_chat"
              required
            />
            <small className="form-hint">
              학습용 데이터셋 경로 추론에 사용되는 ID
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="resume" className="checkbox-label">
              <input
                type="checkbox"
                id="resume"
                name="resume"
                checked={formData.resume}
                onChange={handleChange}
              />
              <span>이전 체크포인트에서 학습 재개</span>
            </label>
            <small className="form-hint">
              <FontAwesomeIcon icon={faInfoCircle} /> 
              이전에 중단된 학습이 있는 경우 이어서 학습합니다.
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="merge" className="checkbox-label">
              <input
                type="checkbox"
                id="merge"
                name="merge"
                checked={formData.merge}
                onChange={handleChange}
                disabled={true}
              />
              <span>학습 후 베이스 모델에 병합 (현재 비활성화됨)</span>
            </label>
            <small className="form-hint">
              <FontAwesomeIcon icon={faInfoCircle} /> 
              현재 버전에서는 LoRA 병합 기능이 비활성화되었습니다.
            </small>
          </div>
          
          <div className="hyper-params">
            <h4>하이퍼파라미터 설정</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hyper-epochs">에폭 수</label>
                <input
                  type="number"
                  id="hyper-epochs"
                  name="hyper.epochs"
                  value={formData.hyper.epochs}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="hyper-lr">학습률</label>
                <input
                  type="number"
                  id="hyper-lr"
                  name="hyper.lr"
                  value={formData.hyper.lr}
                  onChange={handleChange}
                  step="0.0001"
                  min="0.0001"
                  max="0.001"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hyper-bsz">배치 사이즈</label>
                <input
                  type="number"
                  id="hyper-bsz"
                  name="hyper.bsz"
                  value={formData.hyper.bsz}
                  onChange={handleChange}
                  min="1"
                  max="8"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="hyper-gradAcc">Gradient Accumulation</label>
                <input
                  type="number"
                  id="hyper-gradAcc"
                  name="hyper.gradAcc"
                  value={formData.hyper.gradAcc}
                  onChange={handleChange}
                  min="1"
                  max="16"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="hyper-maxLen">최대 입력 길이</label>
              <input
                type="number"
                id="hyper-maxLen"
                name="hyper.maxLen"
                value={formData.hyper.maxLen}
                onChange={handleChange}
                min="512"
                max="2048"
                step="128"
              />
            </div>
          </div>
        </>
      )}
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlay} />
          {type === 'base' ? '베이스 모델 학습 시작' : 'LoRA 학습 시작'}
        </button>
      </div>
    </form>
  );
}

export default TrainingForm;