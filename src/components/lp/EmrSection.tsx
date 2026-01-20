import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  ClipboardCheck,
  Users,
  FileHeart,
  KeySquare,
  ArrowRight,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { HpkiBridgeDownload } from '@/components/emr/HpkiBridgeDownload';

export function EmrSection() {
  const emrFeatures = [
    {
      icon: Stethoscope,
      title: '電子カルテダッシュボード',
      description: '本日の診療状況を一目で確認。待機患者数、診察中、完了数をリアルタイム表示。',
    },
    {
      icon: ClipboardCheck,
      title: '受付管理',
      description: '来院受付から待ち順管理まで。予約時刻、主訴の記録も簡単に。',
    },
    {
      icon: Users,
      title: '患者管理',
      description: '基本情報、保険情報、アレルギー情報を一元管理。検索・フィルタも充実。',
    },
    {
      icon: FileHeart,
      title: 'SOAP形式カルテ',
      description: '標準のSOAP形式で診療記録を作成。ICD-10コード対応、病名登録も可能。',
    },
    {
      icon: KeySquare,
      title: 'HPKI電子署名',
      description: '厚生労働省認定のHPKI ICカードによる電子署名。カルテの真正性を担保。',
    },
    {
      icon: Shield,
      title: '監査ログ（準備中）',
      description: '三原則対応の操作履歴記録。いつ・誰が・何をしたかを完全追跡。',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
            NEW 電子カルテ機能
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            HPKI対応 電子カルテシステム
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            厚労省ガイドライン準拠。電子署名による真正性確保で安心の診療記録管理。
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {emrFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-background rounded-xl p-6 border border-green-200 hover:border-green-400 transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <IconComponent className="h-5 w-5 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* HPKI Download Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">HPKI署名に必要なアプリ</h3>
            <p className="text-sm text-muted-foreground">
              電子署名機能を使用するには、HPKIブリッジアプリのインストールが必要です。
            </p>
          </div>
          <HpkiBridgeDownload showTitle={false} />
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              '厚労省ガイドライン準拠',
              'HPKI電子署名対応',
              'SOAP形式カルテ',
              'ICD-10コード対応',
              '三原則（真正性・見読性・保存性）',
              '既存会計機能との連携',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/auth">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              電子カルテを無料で始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            クレジットカード不要・初期費用無料
          </p>
        </div>
      </div>
    </section>
  );
}
