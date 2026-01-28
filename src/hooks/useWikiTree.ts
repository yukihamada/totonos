import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

// Build tree structure from flat data
function buildTree(pages: WikiPage[]): WikiPage[] {
  const map = new Map<string, WikiPage>();
  const roots: WikiPage[] = [];

  // First pass: create map
  pages.forEach(page => {
    map.set(page.id, { ...page, children: [] });
  });

  // Second pass: build tree
  pages.forEach(page => {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      const parent = map.get(page.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by order
  const sortChildren = (nodes: WikiPage[]): WikiPage[] => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children = sortChildren(node.children);
      }
    });
    return nodes;
  };

  return sortChildren(roots);
}

export function useWikiTree() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: flatPages = [], isLoading } = useQuery({
    queryKey: ['wiki-pages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map DB schema to WikiPage interface
      return (data || []).map((row, index) => ({
        id: row.id,
        title: row.title,
        content: row.content || '',
        parentId: row.parent_page_id || null,
        order: index,
        icon: '📄',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.user_id || '',
      }));
    },
  });

  const pages = buildTree(flatPages);

  // Auto-expand root level pages
  useEffect(() => {
    if (pages.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set(pages.map(p => p.id)));
    }
  }, [pages.length]);

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
  const createPageMutation = useMutation({
    mutationFn: async ({ parentId, title }: { parentId: string | null; title: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wiki_pages')
        .insert({
          user_id: user.id,
          parent_page_id: parentId,
          title,
          content: `# ${title}\n\n内容をここに記載してください。`,
          category: 'other' as const,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      if (variables.parentId) {
        setExpandedIds(prev => new Set([...prev, variables.parentId!]));
      }
    },
  });

  const createPage = useCallback((parentId: string | null, title: string) => {
    createPageMutation.mutate({ parentId, title });
    // Return a temporary page for immediate UI update
    return {
      id: `temp-${Date.now()}`,
      title,
      content: `# ${title}\n\n内容をここに記載してください。`,
      parentId,
      order: 0,
      icon: '📄',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '',
    };
  }, [createPageMutation]);

  // Update page content
  const updatePageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WikiPage> }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.parentId !== undefined) updateData.parent_page_id = updates.parentId;

      const { error } = await supabase
        .from('wiki_pages')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
    },
  });

  const updatePage = useCallback((id: string, updates: Partial<WikiPage>) => {
    updatePageMutation.mutate({ id, updates });
    if (selectedPage?.id === id) {
      setSelectedPage(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  }, [updatePageMutation, selectedPage]);

  // Delete page
  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      if (selectedPage?.id === id) {
        setSelectedPage(null);
      }
    },
  });

  const deletePage = useCallback((id: string) => {
    deletePageMutation.mutate(id);
  }, [deletePageMutation]);

  // Move page (drag and drop)
  const movePage = useCallback((pageId: string, newParentId: string | null, newOrder: number) => {
    updatePage(pageId, { parentId: newParentId, order: newOrder });
  }, [updatePage]);

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
