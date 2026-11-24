/** Aggregation SQL shared by the app (scheduled job) and the seed script. Plain module — no server-only imports. */
export const REFRESH_STATS_SQL: string[] = [
  `
    INSERT INTO referral_stats(user_id, registrations, verified, pending, under_review, rejected, verified_7d, verified_30d, clicks, shares, updated_at)
    SELECT u.id,
           COALESCE(r.registrations,0), COALESCE(r.verified,0), COALESCE(r.pending,0), COALESCE(r.under_review,0), COALESCE(r.rejected,0),
           COALESCE(r.v7,0), COALESCE(r.v30,0), COALESCE(a.clicks,0), COALESCE(a.shares,0), now()
    FROM users u
    LEFT JOIN (
      SELECT referrer_id, count(*) registrations,
             count(*) FILTER (WHERE status='verified') verified,
             count(*) FILTER (WHERE status='pending') pending,
             count(*) FILTER (WHERE status='under_review') under_review,
             count(*) FILTER (WHERE status='rejected') rejected,
             count(*) FILTER (WHERE status='verified' AND verified_at > now() - interval '7 days') v7,
             count(*) FILTER (WHERE status='verified' AND verified_at > now() - interval '30 days') v30
      FROM referrals GROUP BY referrer_id) r ON r.referrer_id = u.id
    LEFT JOIN (
      SELECT referrer_id, sum(count) FILTER (WHERE kind='click') clicks, sum(count) FILTER (WHERE kind='share') shares
      FROM referral_daily_activity GROUP BY referrer_id) a ON a.referrer_id = u.id
    WHERE u.role = 'member'
    ON CONFLICT (user_id) DO UPDATE SET registrations=EXCLUDED.registrations, verified=EXCLUDED.verified, pending=EXCLUDED.pending,
      under_review=EXCLUDED.under_review, rejected=EXCLUDED.rejected, verified_7d=EXCLUDED.verified_7d, verified_30d=EXCLUDED.verified_30d,
      clicks=EXCLUDED.clicks, shares=EXCLUDED.shares, updated_at=now()`,
  `
    UPDATE referral_stats s SET rank = x.rnk
    FROM (SELECT s2.user_id, CASE WHEN s2.verified > 0 THEN rank() OVER (ORDER BY s2.verified DESC) END rnk
          FROM referral_stats s2 JOIN users u ON u.id = s2.user_id WHERE u.status = 'active') x
    WHERE x.user_id = s.user_id AND s.rank IS DISTINCT FROM x.rnk`,
  `
    INSERT INTO referral_snapshots(verified_members, verified_referrals, organic_verified, active_referrers)
    SELECT count(*) FILTER (WHERE u.email_verified_at IS NOT NULL),
           count(*) FILTER (WHERE u.email_verified_at IS NOT NULL AND r.status = 'verified'),
           count(*) FILTER (WHERE u.email_verified_at IS NOT NULL AND r.id IS NULL),
           (SELECT count(DISTINCT r2.referrer_id) FROM referrals r2 JOIN users u2 ON u2.id = r2.referrer_id WHERE r2.status='verified' AND NOT u2.is_demo)
    FROM users u LEFT JOIN referrals r ON r.referred_id = u.id
    WHERE u.role = 'member' AND u.status = 'active' AND NOT u.is_demo`,
];
