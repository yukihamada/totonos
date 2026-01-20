import { Link } from "react-router-dom";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ServiceAgreement() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8 print-hidden">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            印刷
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-4">利用契約書・SLA</h1>
        <p className="text-muted-foreground mb-8">
          最終更新日: 2026年1月20日
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* 第1条 サービス内容 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第1条（サービス内容）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. 提供機能</h3>
            <p>
              当社が提供するTotonos（以下「本サービス」）は、以下の機能を含むクラウド型ビジネスプラットフォームです。
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>CRM・営業管理（リード管理、商談管理、顧客管理）</li>
              <li>請求・見積管理（請求書、見積書、発注書、納品書の作成・管理）</li>
              <li>契約管理（契約書作成、電子署名、契約アラート）</li>
              <li>会計・経理（仕訳、財務諸表、固定資産管理）</li>
              <li>HR・人事（従業員管理、勤怠、給与計算、採用管理）</li>
              <li>経費精算（経費申請、領収書OCR、承認ワークフロー）</li>
              <li>プロジェクト管理（タスク管理、カンバン、ガントチャート）</li>
              <li>AI・自動化（AIチャット、OCR、メールAI、ワークフロー自動化）</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2. サービスの範囲</h3>
            <p>
              本サービスは、インターネット経由で提供されるSaaS（Software as a Service）形式のサービスです。
              お客様は、Webブラウザを通じて本サービスにアクセスし、ご契約のプランに応じた機能をご利用いただけます。
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">3. 対象外のサービス</h3>
            <p>以下は本サービスの対象外となります。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>お客様個別のカスタマイズ開発（Enterpriseプランを除く）</li>
              <li>オンプレミス環境への導入（Enterpriseプランを除く）</li>
              <li>データ移行作業の代行（別途有償にて承ります）</li>
              <li>税務・法務に関する専門的なアドバイス</li>
              <li>ハードウェア・ネットワーク環境の提供</li>
            </ul>
          </section>

          {/* 第2条 SLA */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第2条（サービスレベル保証・SLA）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. 稼働率保証</h3>
            <p>
              当社は、以下のとおり月間稼働率を保証いたします。稼働率は、月間の総時間から計画停止時間を除いた時間に対する、サービス利用可能時間の割合として算出されます。
            </p>

            <Table className="my-4">
              <TableHeader>
                <TableRow>
                  <TableHead>プラン</TableHead>
                  <TableHead className="text-right">月間稼働率保証</TableHead>
                  <TableHead>補償</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Free / Starter</TableCell>
                  <TableCell className="text-right">保証なし</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Standard</TableCell>
                  <TableCell className="text-right font-mono">99.5%</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pro</TableCell>
                  <TableCell className="text-right font-mono">99.9%</TableCell>
                  <TableCell>クレジット返還</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enterprise</TableCell>
                  <TableCell className="text-right font-mono">99.9%</TableCell>
                  <TableCell>クレジット返還</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <h3 className="text-lg font-medium mt-4 mb-2">2. 計画停止</h3>
            <p>
              システムメンテナンスによる計画停止については、原則として7日前までにメールおよびアプリ内通知にてお知らせいたします。
              緊急のセキュリティ対応等、やむを得ない場合は、この限りではありません。
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">3. 補償規定</h3>
            <p>
              Pro/Enterpriseプランにおいて、月間稼働率が保証値を下回った場合、以下の補償を行います。
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>稼働率99.0%〜99.9%未満：月間クレジットの10%を返還</li>
              <li>稼働率95.0%〜99.0%未満：月間クレジットの25%を返還</li>
              <li>稼働率95.0%未満：月間クレジットの50%を返還</li>
            </ul>
            <p className="mt-2">
              補償を受けるには、障害発生月の翌月末日までに、サポート窓口へご連絡ください。
            </p>
          </section>

          {/* 第3条 データの取扱い */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第3条（データの取扱い）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. データの所有権</h3>
            <p>
              お客様が本サービスに登録・保存したデータ（以下「お客様データ」）の所有権は、すべてお客様に帰属します。
              当社は、お客様データを本サービスの提供目的以外に利用することはありません。
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">2. バックアップポリシー</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>全プランで日次自動バックアップを実施</li>
              <li>バックアップデータは7日間保持</li>
              <li>バックアップは地理的に分散したデータセンターに保存</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3. データ保持期間</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>契約期間中：無期限で保持</li>
              <li>解約後：30日間保持（この間にエクスポートをお願いします）</li>
              <li>30日経過後：完全に削除</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4. データエクスポート</h3>
            <p>
              お客様は、いつでもご自身のデータをJSON形式またはCSV形式でエクスポートできます。
              エクスポートにはクレジットを消費しますが、解約前の最終エクスポートは無料です。
            </p>
          </section>

          {/* 第4条 セキュリティ */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第4条（セキュリティ）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. データの暗号化</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>通信中のデータ：TLS 1.3による暗号化</li>
              <li>保存中のデータ：AES-256による暗号化</li>
              <li>特に機密性の高いデータ（マイナンバー等）：追加の暗号化層を適用</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2. アクセス制御</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>行レベルセキュリティ（RLS）による厳密なアクセス制御</li>
              <li>組織・チーム単位でのデータ分離</li>
              <li>ロールベースのアクセス権限管理</li>
              <li>多要素認証（MFA）対応（Standardプラン以上）</li>
              <li>シングルサインオン（SSO）対応（Proプラン以上）</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3. 監査ログ</h3>
            <p>
              Pro/Enterpriseプランでは、以下の操作について監査ログを記録・保持します。
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>ログイン・ログアウト</li>
              <li>データの作成・更新・削除</li>
              <li>設定変更</li>
              <li>エクスポート操作</li>
            </ul>
            <p className="mt-2">監査ログは90日間保持されます。</p>

            <h3 className="text-lg font-medium mt-4 mb-2">4. 脆弱性対応</h3>
            <p>
              当社は、セキュリティ脆弱性の発見時に迅速に対応いたします。
              重大な脆弱性については、発見後24時間以内に緊急パッチを適用することを目標とします。
            </p>
          </section>

          {/* 第5条 責任範囲 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第5条（責任範囲）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. 当社の責任</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>本サービスの安定的な提供</li>
              <li>お客様データの適切な保護</li>
              <li>SLAに基づくサービス品質の維持</li>
              <li>セキュリティインシデント発生時の適切な対応と報告</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2. お客様の責任</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>アカウント情報（ID・パスワード）の適切な管理</li>
              <li>利用規約および本契約の遵守</li>
              <li>正確なデータの入力・管理</li>
              <li>適切な権限設定の実施</li>
              <li>不正アクセスの疑いがある場合の速やかな報告</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3. 免責事項</h3>
            <p>当社は、以下の事由により生じた損害については責任を負いません。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>お客様の責に帰すべき事由（パスワード漏洩、設定ミス等）</li>
              <li>天災、戦争、テロ、その他不可抗力</li>
              <li>第三者による不正アクセス（当社が適切なセキュリティ対策を講じていた場合）</li>
              <li>本サービス以外のソフトウェア・サービスとの連携における不具合</li>
              <li>お客様が入力したデータの内容に起因する損害</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4. 損害賠償の上限</h3>
            <p>
              当社の損害賠償責任は、当社の故意または重過失による場合を除き、
              お客様が過去12ヶ月間に支払った利用料金の総額を上限とします。
              なお、当社は、間接損害、特別損害、逸失利益については責任を負わないものとします。
            </p>
          </section>

          {/* 第6条 契約条件 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第6条（契約条件）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. 契約期間</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>月額プラン：1ヶ月単位の自動更新</li>
              <li>年額プラン：1年単位の自動更新（20%割引適用）</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2. 解約条件</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>月額プラン：いつでも解約可能。次回更新日から解約が適用されます。</li>
              <li>年額プラン：いつでも解約可能。契約期間終了日まではサービスをご利用いただけます。</li>
              <li>日割り返金は行っておりません。</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3. プラン変更</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>アップグレード：即時反映。差額は日割りで請求されます。</li>
              <li>ダウングレード：次回更新日から適用されます。</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4. 返金ポリシー</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>初回契約から14日以内：理由を問わず全額返金</li>
              <li>14日経過後：原則として返金不可</li>
              <li>当社の責に帰すべき事由による場合：個別に対応</li>
            </ul>
          </section>

          {/* 第7条 変更・通知 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第7条（変更・通知）</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">1. 契約変更の通知方法</h3>
            <p>
              本契約の変更については、以下の方法でお知らせいたします。
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>登録されたメールアドレスへの電子メール</li>
              <li>本サービス内の通知機能</li>
              <li>本サービスのウェブサイト上での掲載</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2. 変更の効力発生</h3>
            <p>
              本契約の変更は、通知日から30日後に効力を生じます。
              ただし、お客様に不利益を及ぼさない変更、または法令の改正に基づく変更については、
              即時に効力を生じる場合があります。
            </p>
            <p className="mt-2">
              変更後も本サービスを継続してご利用された場合、変更に同意したものとみなします。
              変更に同意されない場合は、効力発生日までに解約手続きをお願いいたします。
            </p>
          </section>

          {/* 第8条 準拠法・管轄 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">第8条（準拠法・管轄）</h2>
            <p>
              本契約の解釈にあたっては日本法を準拠法とし、
              本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>
        </div>

        {/* フッター */}
        <footer className="border-t pt-8">
          <h3 className="font-semibold mb-4">関連リンク</h3>
          <ul className="space-y-2 text-sm print-hidden">
            <li>
              <Link to="/service-guide" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                サービスガイド
              </Link>
            </li>
            <li>
              <Link to="/terms" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                利用規約
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                料金プラン
              </Link>
            </li>
          </ul>
          <div className="hidden print:block">
            <p className="text-sm text-muted-foreground">
              サービスガイド: /service-guide | 利用規約: /terms | プライバシーポリシー: /privacy
            </p>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            ご不明な点がございましたら、サービス内のお問い合わせフォームよりご連絡ください。
          </p>
        </footer>
      </div>
    </div>
  );
}
