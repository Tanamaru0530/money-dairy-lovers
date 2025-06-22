import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import styles from './WelcomeModal.module.scss';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  const navigate = useNavigate();

  const handleStartSetup = () => {
    onClose();
    navigate('/love/goals');
  };

  const handleExploreDashboard = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeIcon}>💕</div>
        <h1 className={styles.welcomeTitle}>
          ようこそ、{userName}さん！
        </h1>
        <p className={styles.welcomeMessage}>
          Money Dairy Loversへようこそ！<br />
          愛のある家計管理を一緒に始めましょう。
        </p>
        
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>🎯</span>
            <span className={styles.featureText}>Love Goalsを設定して、二人の夢を実現</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>💰</span>
            <span className={styles.featureText}>支出を記録して、お金の流れを見える化</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>👫</span>
            <span className={styles.featureText}>パートナーと共有して、透明性のある家計管理</span>
          </div>
        </div>

        <div className={styles.welcomeActions}>
          <Button 
            variant="primary" 
            onClick={handleStartSetup}
            className={styles.primaryAction}
          >
            Love Goalsを設定する 🎯
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExploreDashboard}
          >
            ダッシュボードを見る
          </Button>
        </div>

        <p className={styles.welcomeTip}>
          💡 ヒント: サンプルのLove Goalsを用意しました。<br />
          まずはダッシュボードで確認してみてください！
        </p>
      </div>
    </Modal>
  );
};