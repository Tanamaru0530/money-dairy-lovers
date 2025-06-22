import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Legal.module.scss';

export const Terms: React.FC = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <Link to="/auth/register" className={styles.backLink}>
          ← 登録画面に戻る
        </Link>
        
        <h1 className={styles.title}>利用規約</h1>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>第1条（適用）</h2>
            <p>
              本規約は、Money Dairy Lovers（以下「当サービス」）の利用条件を定めるものです。
              登録ユーザーの皆さま（以下「ユーザー」）には、本規約に従って当サービスをご利用いただきます。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第2条（利用登録）</h2>
            <p>
              登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、
              利用登録が完了するものとします。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第3条（ユーザーIDおよびパスワードの管理）</h2>
            <p>
              ユーザーは、自己の責任において、当サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第4条（利用料金）</h2>
            <p>
              当サービスの基本機能は無料でご利用いただけます。
              今後、有料プランを提供する場合は、事前にお知らせいたします。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第5条（禁止事項）</h2>
            <p>ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>第6条（免責事項）</h2>
            <p>
              当社は、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、
              特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）
              がないことを明示的にも黙示的にも保証しておりません。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第7条（サービス内容の変更等）</h2>
            <p>
              当社は、ユーザーに通知することなく、当サービスの内容を変更し、
              または当サービスの提供を中止することができるものとします。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第8条（利用規約の変更）</h2>
            <p>
              当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <p className={styles.date}>制定日：2025年1月1日</p>
          <p className={styles.company}>Money Dairy Lovers 運営チーム</p>
        </div>
      </div>
    </div>
  );
};