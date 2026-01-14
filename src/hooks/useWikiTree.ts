import { useState, useCallback } from 'react';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  order: number;
  icon?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  children?: WikiPage[];
}

// Mock data for wiki pages with hierarchy
const mockWikiPages: WikiPage[] = [
  {
    id: '1',
    title: '会社情報',
    content: '# 会社概要\n\n株式会社サンプルの基本情報をまとめています。',
    parentId: null,
    order: 0,
    icon: '🏢',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-03-01T10:30:00Z',
    createdBy: 'admin@example.com',
    children: [
      {
        id: '1-1',
        title: '経営理念',
        content: '## 経営理念\n\n私たちは、テクノロジーで社会に貢献します。\n\n### ミッション\n- 革新的なソリューションの提供\n- 持続可能な成長\n- 顧客満足の追求',
        parentId: '1',
        order: 0,
        icon: '🎯',
        createdAt: '2024-01-15T09:10:00Z',
        updatedAt: '2024-02-15T14:00:00Z',
        createdBy: 'admin@example.com',
      },
      {
        id: '1-2',
        title: '組織構成',
        content: '## 組織図\n\n| 部門 | 責任者 | 人数 |\n|-----|-------|-----|\n| 開発部 | 山田太郎 | 15 |\n| 営業部 | 鈴木花子 | 10 |\n| 管理部 | 佐藤次郎 | 5 |',
        parentId: '1',
        order: 1,
        icon: '👥',
        createdAt: '2024-01-16T11:00:00Z',
        updatedAt: '2024-03-10T09:00:00Z',
        createdBy: 'admin@example.com',
      },
    ],
  },
  {
    id: '2',
    title: '業務マニュアル',
    content: '# 業務マニュアル\n\n各部門の業務手順をまとめています。',
    parentId: null,
    order: 1,
    icon: '📚',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-03-05T15:00:00Z',
    createdBy: 'admin@example.com',
    children: [
      {
        id: '2-1',
        title: '営業マニュアル',
        content: '## 営業活動の流れ\n\n1. リード獲得\n2. 初回商談\n3. 提案書作成\n4. クロージング\n5. 契約締結\n\n### ポイント\n- 顧客のニーズを深掘りする\n- 提案は3日以内に送付',
        parentId: '2',
        order: 0,
        icon: '💼',
        createdAt: '2024-01-21T09:00:00Z',
        updatedAt: '2024-02-28T11:00:00Z',
        createdBy: 'sales@example.com',
      },
      {
        id: '2-2',
        title: '経理マニュアル',
        content: '## 経理業務\n\n### 月次締め処理\n1. 請求書発行\n2. 入金確認\n3. 仕訳入力\n4. 月次レポート作成\n\n### 注意事項\n- 締め日は毎月25日\n- 承認は経理部長必須',
        parentId: '2',
        order: 1,
        icon: '📊',
        createdAt: '2024-01-22T10:00:00Z',
        updatedAt: '2024-03-01T16:00:00Z',
        createdBy: 'accounting@example.com',
        children: [
          {
            id: '2-2-1',
            title: '請求書発行手順',
            content: '## 請求書発行\n\n1. Totonosにログイン\n2. 請求書メニューを開く\n3. 新規作成ボタンをクリック\n4. 取引先を選択\n5. 明細を入力\n6. プレビューで確認\n7. 発行ボタンをクリック',
            parentId: '2-2',
            order: 0,
            icon: '📄',
            createdAt: '2024-02-01T09:00:00Z',
            updatedAt: '2024-03-05T10:00:00Z',
            createdBy: 'accounting@example.com',
          },
        ],
      },
      {
        id: '2-3',
        title: '人事マニュアル',
        content: '## 人事業務\n\n### 入社手続き\n- 雇用契約書の作成\n- 社会保険加入手続き\n- 備品の準備\n\n### 退社手続き\n- 退職届の受理\n- 社会保険喪失届\n- 備品の回収',
        parentId: '2',
        order: 2,
        icon: '👔',
        createdAt: '2024-01-23T11:00:00Z',
        updatedAt: '2024-02-20T14:00:00Z',
        createdBy: 'hr@example.com',
      },
    ],
  },
  {
    id: '3',
    title: '技術ドキュメント',
    content: '# 技術ドキュメント\n\n開発チーム向けの技術情報です。',
    parentId: null,
    order: 2,
    icon: '💻',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z',
    createdBy: 'dev@example.com',
    children: [
      {
        id: '3-1',
        title: 'API仕様書',
        content: '## REST API\n\n### エンドポイント\n\n```\nGET /api/v1/users\nPOST /api/v1/users\nPUT /api/v1/users/:id\nDELETE /api/v1/users/:id\n```\n\n### 認証\nBearer トークンを使用',
        parentId: '3',
        order: 0,
        icon: '🔌',
        createdAt: '2024-02-05T10:00:00Z',
        updatedAt: '2024-03-08T15:00:00Z',
        createdBy: 'dev@example.com',
      },
      {
        id: '3-2',
        title: 'コーディング規約',
        content: '## コーディング規約\n\n### TypeScript\n- 変数名はcamelCase\n- 型は明示的に定義\n- anyは使用禁止\n\n### React\n- 関数コンポーネントを使用\n- hooksでロジックを分離',
        parentId: '3',
        order: 1,
        icon: '📝',
        createdAt: '2024-02-10T09:00:00Z',
        updatedAt: '2024-03-01T10:00:00Z',
        createdBy: 'dev@example.com',
      },
    ],
  },
  {
    id: '4',
    title: '社内イベント',
    content: '# 社内イベント\n\n会社行事やイベント情報をお知らせします。',
    parentId: null,
    order: 3,
    icon: '🎉',
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z',
    createdBy: 'admin@example.com',
  },
];

export function useWikiTree() {
  const [pages, setPages] = useState<WikiPage[]>(mockWikiPages);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '3']));
  const [isLoading, setIsLoading] = useState(false);

  // Flatten tree for search
  const flattenPages = useCallback((pageList: WikiPage[]): WikiPage[] => {
    let result: WikiPage[] = [];
    for (const page of pageList) {
      result.push(page);
      if (page.children) {
        result = result.concat(flattenPages(page.children));
      }
    }
    return result;
  }, []);

  const allPages = flattenPages(pages);

  // Find page by ID
  const findPageById = useCallback((id: string, pageList: WikiPage[] = pages): WikiPage | null => {
    for (const page of pageList) {
      if (page.id === id) return page;
      if (page.children) {
        const found = findPageById(id, page.children);
        if (found) return found;
      }
    }
    return null;
  }, [pages]);

  // Toggle expand/collapse
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Create new page
  const createPage = useCallback((parentId: string | null, title: string) => {
    const newPage: WikiPage = {
      id: `new-${Date.now()}`,
      title,
      content: `# ${title}\n\n内容をここに記載してください。`,
      parentId,
      order: 0,
      icon: '📄',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current@user.com',
    };

    if (parentId === null) {
      setPages(prev => [...prev, newPage]);
    } else {
      const updateChildren = (pageList: WikiPage[]): WikiPage[] => {
        return pageList.map(page => {
          if (page.id === parentId) {
            return {
              ...page,
              children: [...(page.children || []), newPage],
            };
          }
          if (page.children) {
            return {
              ...page,
              children: updateChildren(page.children),
            };
          }
          return page;
        });
      };
      setPages(prev => updateChildren(prev));
      setExpandedIds(prev => new Set([...prev, parentId]));
    }

    return newPage;
  }, []);

  // Update page content
  const updatePage = useCallback((id: string, updates: Partial<WikiPage>) => {
    const updateInTree = (pageList: WikiPage[]): WikiPage[] => {
      return pageList.map(page => {
        if (page.id === id) {
          const updated = { ...page, ...updates, updatedAt: new Date().toISOString() };
          if (selectedPage?.id === id) {
            setSelectedPage(updated);
          }
          return updated;
        }
        if (page.children) {
          return {
            ...page,
            children: updateInTree(page.children),
          };
        }
        return page;
      });
    };
    setPages(prev => updateInTree(prev));
  }, [selectedPage]);

  // Delete page
  const deletePage = useCallback((id: string) => {
    const deleteFromTree = (pageList: WikiPage[]): WikiPage[] => {
      return pageList
        .filter(page => page.id !== id)
        .map(page => {
          if (page.children) {
            return {
              ...page,
              children: deleteFromTree(page.children),
            };
          }
          return page;
        });
    };
    setPages(prev => deleteFromTree(prev));
    if (selectedPage?.id === id) {
      setSelectedPage(null);
    }
  }, [selectedPage]);

  // Move page (drag and drop)
  const movePage = useCallback((pageId: string, newParentId: string | null, newOrder: number) => {
    // Remove from current location
    let movedPage: WikiPage | null = null;
    const removeFromTree = (pageList: WikiPage[]): WikiPage[] => {
      return pageList
        .filter(page => {
          if (page.id === pageId) {
            movedPage = page;
            return false;
          }
          return true;
        })
        .map(page => {
          if (page.children) {
            return {
              ...page,
              children: removeFromTree(page.children),
            };
          }
          return page;
        });
    };

    let newPages = removeFromTree(pages);

    if (!movedPage) return;

    // Add to new location
    movedPage = { ...movedPage, parentId: newParentId, order: newOrder };

    if (newParentId === null) {
      newPages = [...newPages, movedPage];
    } else {
      const addToTree = (pageList: WikiPage[]): WikiPage[] => {
        return pageList.map(page => {
          if (page.id === newParentId) {
            return {
              ...page,
              children: [...(page.children || []), movedPage!],
            };
          }
          if (page.children) {
            return {
              ...page,
              children: addToTree(page.children),
            };
          }
          return page;
        });
      };
      newPages = addToTree(newPages);
    }

    setPages(newPages);
  }, [pages]);

  // Search pages
  const searchPages = useCallback((query: string): WikiPage[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allPages.filter(
      page =>
        page.title.toLowerCase().includes(lowerQuery) ||
        page.content.toLowerCase().includes(lowerQuery)
    );
  }, [allPages]);

  return {
    pages,
    selectedPage,
    setSelectedPage,
    expandedIds,
    toggleExpand,
    createPage,
    updatePage,
    deletePage,
    movePage,
    searchPages,
    findPageById,
    allPages,
    isLoading,
  };
}
