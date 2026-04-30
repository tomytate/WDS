content = open('w:\Documents\WDS\supabase\\reset.sql', 'r', encoding='utf-8').read()
start_marker = '-- 1. PRODUCTS'
idx = content.find(start_marker)
if idx != -1:
    schema = '-- Wong Digital Shop - Fresh Installation Schema\n-- ═══════════════════════════════════════════════════════════════\n\ncreate extension if not exists "uuid-ossp";\n\n-- ═══════════════════════════════════════════════════════════════\n' + content[idx:]
    open('w:\Documents\WDS\supabase\schema.sql', 'w', encoding='utf-8').write(schema)
