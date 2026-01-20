import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ホームに戻る
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            最終更新日: 2026年1月20日
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第1条（適用）</h2>
            <p>
              本規約は、Totonos（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第2条（利用登録）</h2>
            <p>
              本サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を行うものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第3条（禁止事項）</h2>
            <p>ユーザーは、以下の行為を行ってはなりません。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>不正アクセスまたはこれを試みる行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第4条（サービスの変更・停止）</h2>
            <p>
              当社は、ユーザーへの事前通知なく、本サービスの内容を変更、
              または本サービスの提供を停止することができるものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第5条（免責事項）</h2>
            <p>
              当社は、本サービスに関してユーザーに生じた損害について、
              当社の故意または重過失による場合を除き、一切の責任を負わないものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第6条（準拠法・管轄）</h2>
            <p>
              本規約の解釈にあたっては日本法を準拠法とし、
              本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
