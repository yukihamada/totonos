-- Enhance Wiki Pages for Organization-based RLS and Tree Structure
-- Migration: 20260114150000_enhance_wiki_pages

-- Add organization_id and icon/cover columns to wiki_pages
ALTER TABLE wiki_pages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE wiki_pages ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE wiki_pages ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE wiki_pages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for organization lookups
CREATE INDEX IF NOT EXISTS idx_wiki_pages_organization ON wiki_pages(organization_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_parent ON wiki_pages(parent_page_id);

-- Drop old user-based RLS policies
DROP POLICY IF EXISTS "Users can view their own wiki pages" ON wiki_pages;
DROP POLICY IF EXISTS "Users can insert their own wiki pages" ON wiki_pages;
DROP POLICY IF EXISTS "Users can update their own wiki pages" ON wiki_pages;
DROP POLICY IF EXISTS "Users can delete their own wiki pages" ON wiki_pages;

-- Create organization-based RLS policies
CREATE POLICY "Users can view wiki pages in their organization"
  ON wiki_pages FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage wiki pages in their organization"
  ON wiki_pages FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Function to get wiki tree (hierarchical structure)
CREATE OR REPLACE FUNCTION get_wiki_tree(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  parent_page_id UUID,
  sort_order INTEGER,
  icon TEXT,
  cover_image TEXT,
  is_published BOOLEAN,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by TEXT,
  depth INTEGER,
  path UUID[]
)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE wiki_tree AS (
    -- Base case: root pages
    SELECT
      w.id,
      w.title,
      w.content,
      w.parent_page_id,
      w.sort_order,
      w.icon,
      w.cover_image,
      w.is_published,
      w.view_count,
      w.created_at,
      w.updated_at,
      w.last_edited_by as created_by,
      0 as depth,
      ARRAY[w.id] as path
    FROM wiki_pages w
    WHERE w.organization_id = p_organization_id
      AND w.parent_page_id IS NULL

    UNION ALL

    -- Recursive case: child pages
    SELECT
      w.id,
      w.title,
      w.content,
      w.parent_page_id,
      w.sort_order,
      w.icon,
      w.cover_image,
      w.is_published,
      w.view_count,
      w.created_at,
      w.updated_at,
      w.last_edited_by as created_by,
      wt.depth + 1,
      wt.path || w.id
    FROM wiki_pages w
    INNER JOIN wiki_tree wt ON w.parent_page_id = wt.id
    WHERE w.organization_id = p_organization_id
  )
  SELECT * FROM wiki_tree
  ORDER BY depth, sort_order, title;
$$;

-- Function to search wiki pages
CREATE OR REPLACE FUNCTION search_wiki_pages(
  p_organization_id UUID,
  p_query TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  parent_page_id UUID,
  icon TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    w.id,
    w.title,
    w.content,
    w.parent_page_id,
    w.icon,
    w.created_at,
    w.updated_at,
    ts_rank(
      to_tsvector('japanese', coalesce(w.title, '') || ' ' || coalesce(w.content, '')),
      plainto_tsquery('japanese', p_query)
    ) as rank
  FROM wiki_pages w
  WHERE w.organization_id = p_organization_id
    AND (
      w.title ILIKE '%' || p_query || '%'
      OR w.content ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, updated_at DESC
  LIMIT 50;
$$;

-- Function to move wiki page
CREATE OR REPLACE FUNCTION move_wiki_page(
  p_page_id UUID,
  p_new_parent_id UUID,
  p_new_order INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE wiki_pages
  SET
    parent_page_id = p_new_parent_id,
    sort_order = p_new_order,
    updated_at = NOW()
  WHERE id = p_page_id;

  RETURN FOUND;
END;
$$;

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_wiki_pages_updated_at ON wiki_pages;
CREATE TRIGGER update_wiki_pages_updated_at
  BEFORE UPDATE ON wiki_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
