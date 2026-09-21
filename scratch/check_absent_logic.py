import json, re

def extract_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    start = c.find('{')
    # Find matching brace
    stack = []
    end = -1
    for i in range(start, len(c)):
        if c[i] == '{':
            stack.append('{')
        elif c[i] == '}':
            stack.pop()
            if not stack:
                end = i
                break
    return json.loads(c[start:end+1])

b11 = extract_json('modules/hrm/monthly_yearly_attendance_bot_data.js')
b10 = extract_json('modules/hrm/monthly_attendance_bot_data.js')

diff_count = 0
for r in b11.get('items', []):
    pl = float(r.get('paid_leave') or 0)
    cl = float(r.get('cl') or 0)
    ml = float(r.get('ml') or 0)
    el = float(r.get('el') or 0)
    if pl != (cl + ml + el):
        diff_count += 1
print("diff_count pl vs cl+ml+el:", diff_count)
for r in b11.get('items', []):
    eid = str(r.get('emp_id')).strip()
    if eid not in b10_emp and r.get('month_year') == 'Sep-2026':
        print(f"Emp {eid} {r.get('emp_name')}: working={r.get('total_working_days')}, present={r.get('present_days')}, absent={r.get('absent_days')}")
        break

for emp_id in ['15387', '855', '910', '924', '10676']:
    rows = [r for r in b11.get('items', []) if str(r.get('emp_id')).strip() == emp_id]
    b10_item = b10_emp.get(emp_id, {})
    daily_absents = len([d for d in b10_item.get('daily', []) if 'absent' in (d.get('status') or '').lower()])
    print(f'Emp {emp_id}:')
    for r in rows:
        print(f"  Month: {r.get('month_year')}, absent_days: {r.get('absent_days')}, present: {r.get('present_days')}, working: {r.get('total_working_days')}, cl: {r.get('cl')}, paid: {r.get('paid_leave')}")
    print(f"  Bot 10: absent_days={b10_item.get('absent_days')}, daily_absents_count={daily_absents}")
