-- Add unique constraint on template_id for proper upsert behavior
ALTER TABLE template_menu_config ADD CONSTRAINT template_menu_config_template_id_unique UNIQUE (template_id);

-- 1. 自動車販売・整備
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id, 
  '[{"id": "crm", "priority": 1}, {"id": "inventory", "priority": 2}, {"id": "sales", "priority": 3}, {"id": "documents", "priority": 4}]'::jsonb,
  ARRAY['hr', 'projects', 'contracts'],
  ARRAY['crm', 'inventory']
FROM industry_templates WHERE template_key = 'car-dealer'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;

-- 2. フィットネス・ジム
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id,
  '[{"id": "members", "priority": 1}, {"id": "reservation", "priority": 2}, {"id": "accounting", "priority": 3}, {"id": "crm", "priority": 4}]'::jsonb,
  ARRAY['inventory', 'projects', 'contracts'],
  ARRAY['members', 'reservation']
FROM industry_templates WHERE template_key = 'fitness'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;

-- 3. ホテル・旅館
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id,
  '[{"id": "reservation", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "accounting", "priority": 3}, {"id": "inventory", "priority": 4}]'::jsonb,
  ARRAY['contracts', 'projects', 'hr'],
  ARRAY['reservation', 'crm']
FROM industry_templates WHERE template_key = 'hotel'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;

-- 4. 清掃サービス
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id,
  '[{"id": "crm", "priority": 1}, {"id": "calendar", "priority": 2}, {"id": "hr", "priority": 3}, {"id": "accounting", "priority": 4}]'::jsonb,
  ARRAY['inventory', 'contracts', 'projects'],
  ARRAY['crm', 'calendar']
FROM industry_templates WHERE template_key = 'cleaning'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;

-- 5. 特許事務所
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id,
  '[{"id": "contracts", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "documents", "priority": 3}, {"id": "accounting", "priority": 4}]'::jsonb,
  ARRAY['inventory', 'hr', 'projects'],
  ARRAY['contracts', 'documents']
FROM industry_templates WHERE template_key = 'patent'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;

-- 6. 保険代理店
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id,
  '[{"id": "crm", "priority": 1}, {"id": "contracts", "priority": 2}, {"id": "sales", "priority": 3}, {"id": "accounting", "priority": 4}]'::jsonb,
  ARRAY['inventory', 'hr', 'projects'],
  ARRAY['crm', 'contracts']
FROM industry_templates WHERE template_key = 'insurance'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;

-- 7. デザイン事務所
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id,
  '[{"id": "projects", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "documents", "priority": 3}, {"id": "expenses", "priority": 4}]'::jsonb,
  ARRAY['inventory', 'contracts', 'hr'],
  ARRAY['projects', 'crm']
FROM industry_templates WHERE template_key = 'design'
ON CONFLICT (template_id) DO UPDATE SET
  menu_groups = EXCLUDED.menu_groups,
  hidden_features = EXCLUDED.hidden_features,
  emphasized_features = EXCLUDED.emphasized_features;