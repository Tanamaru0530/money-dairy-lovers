import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Legal.module.scss';

export const Privacy: React.FC = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <Link to="/auth/register" className={styles.backLink}>
          ← 登録画面に戻る
        </Link>
        
        <h1 className={styles.title}>プライバシーポリシー</h1>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <p>
              Money Dairy Lovers（以下「当サービス」）は、ユーザーの個人情報の取扱いについて、
              以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第1条（個人情報）</h2>
            <p>
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、
              生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、
              住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第2条（個人情報の収集方法）</h2>
            <p>
              当サービスは、ユーザーが利用登録をする際に氏名、メールアドレスなどの個人情報をお尋ねすることがあります。
              また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録に関する情報を、
              提携先から収集することがあります。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第3条（個人情報を収集・利用する目的）</h2>
            <p>当サービスが個人情報を収集・利用する目的は、以下のとおりです。</p>
            <ul>
              <li>当サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため</li>
              <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
              <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
              <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
              <li>上記の利用目的に付随する目的</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>第4条（利用目的の変更）</h2>
            <p>
              当サービスは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、
              個人情報の利用目的を変更するものとします。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第5条（個人情報の第三者提供）</h2>
            <p>
              当サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、
              第三者に個人情報を提供することはありません。
            </p>
            <ul>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>第6条（個人情報の開示）</h2>
            <p>
              当サービスは、本人から個人情報の開示を求められたときは、本人に対し、
              遅滞なくこれを開示します。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第7条（個人情報の訂正および削除）</h2>
            <p>
              ユーザーは、当サービスの保有する自己の個人情報が誤った情報である場合には、
              当サービスが定める手続きにより、当サービスに対して個人情報の訂正、追加または削除（以下「訂正等」）を請求することができます。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第8条（個人情報の利用停止等）</h2>
            <p>
              当サービスは、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由、
              または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」）を求められた場合には、
              遅滞なく必要な調査を行います。
            </p>
          </section>

          <section className={styles.section}>
            <h2>第9条（プライバシーポリシーの変更）</h2>
            <p>
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
              ユーザーに通知することなく、変更することができるものとします。
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