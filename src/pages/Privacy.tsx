import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ホームに戻る
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            最終更新日: 2026年1月20日
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. 収集する情報</h2>
            <p>当社は、本サービスの提供にあたり、以下の情報を収集することがあります。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>メールアドレス</li>
              <li>会社名・氏名</li>
              <li>取引情報（請求書、契約書等）</li>
              <li>サービス利用履歴</li>
              <li>端末情報、IPアドレス</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 情報の利用目的</h2>
            <p>収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>本サービスの提供・運営</li>
              <li>ユーザーサポート</li>
              <li>サービスの改善・新機能の開発</li>
              <li>重要なお知らせの送信</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 情報の第三者提供</h2>
            <p>
              当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
              ただし、以下の場合は例外とします。
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>法令に基づく開示請求があった場合</li>
              <li>人の生命・身体・財産の保護のために必要な場合</li>
              <li>サービス提供に必要な業務委託先への提供</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 情報の安全管理</h2>
            <p>
              当社は、個人情報の漏洩、滅失、毀損の防止のため、
              適切な安全管理措置を講じます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Cookieの使用</h2>
            <p>
              本サービスでは、ユーザー体験の向上のためにCookieを使用することがあります。
              ブラウザの設定によりCookieを無効にすることができますが、
              一部のサービスが利用できなくなる場合があります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. お問い合わせ</h2>
            <p>
              プライバシーポリシーに関するお問い合わせは、
              サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
