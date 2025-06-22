import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // エラー情報を保存
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
    
    // エラーレポート（本番環境では外部サービスに送信）
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
    
    // カスタムエラーハンドラーを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 本番環境でのエラーレポート実装
    // 例: Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error report:', errorReport);
    // TODO: 実際のエラーレポートサービスに送信
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>💔</div>
            <h1 className={styles.errorTitle}>申し訳ございません</h1>
            <p className={styles.errorMessage}>
              予期しないエラーが発生しました。
            </p>
            
            {this.state.errorCount > 2 && (
              <p className={styles.errorWarning}>
                エラーが繰り返し発生しています。ページを再読み込みすることをお勧めします。
              </p>
            )}
            
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>エラーの詳細（開発環境のみ）</summary>
                <div className={styles.errorDetailContent}>
                  <p><strong>エラーメッセージ:</strong></p>
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.error.stack && (
                    <>
                      <p><strong>スタックトレース:</strong></p>
                      <pre>{this.state.error.stack}</pre>
                    </>
                  )}
                  {this.state.errorInfo && (
                    <>
                      <p><strong>コンポーネントスタック:</strong></p>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className={styles.errorActions}>
              <Button
                variant="primary"
                onClick={this.handleReset}
                disabled={this.state.errorCount > 3}
              >
                もう一度試す
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/dashboard'}
              >
                ホームに戻る
              </Button>
              {this.state.errorCount > 2 && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  ページを再読み込み
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}