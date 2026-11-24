-- Rewrite the SAMPLE announcements (is_demo = true) in plain English.
-- Real announcements (is_demo = false) are never touched.
UPDATE announcements a SET title = v.t, body = v.b
FROM (VALUES
  ('Official', 'We are not taking any money yet', 'TBC hasn''t launched, so we are not accepting any payments. If anyone asks you to pay in our name, it''s a scam — please report it in Help & support.'),
  ('Governance', 'Our lawyers are working on approvals', 'Our legal team is preparing formal opinions on licensing, how members'' money will be held, and consumer protection. We''ll share each milestone on the Transparency page.'),
  ('Transparency', 'You''ll see the draw rules first', 'Before any draw happens, we''ll publish exactly how winners are chosen and invite public comment. Independent observers will watch every draw.'),
  ('Security', 'ID checks will use your NIN or BVN', 'After launch, we''ll confirm members'' identity through licensed partners. We will never ask for your PIN, OTP or password.')
) AS v(c, t, b)
WHERE a.category = v.c AND a.is_demo;
