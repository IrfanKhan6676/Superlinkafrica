-- Database functions for AI recommendations

-- Function to find users with similar behavior patterns
CREATE OR REPLACE FUNCTION find_similar_users(
  target_user_id UUID,
  similarity_threshold DECIMAL DEFAULT 0.3,
  limit_users INTEGER DEFAULT 10
)
RETURNS TABLE(user_id UUID, similarity_score DECIMAL) AS $$
BEGIN
  RETURN QUERY
  WITH user_vectors AS (
    SELECT 
      ub.user_id,
      array_agg(DISTINCT ub.target_id ORDER BY ub.target_id) as interacted_items
    FROM user_behavior ub
    WHERE ub.action_type IN ('view', 'like', 'swipe_right')
      AND ub.target_type = 'product'
      AND ub.created_at > NOW() - INTERVAL '30 days'
    GROUP BY ub.user_id
    HAVING COUNT(DISTINCT ub.target_id) >= 3
  ),
  target_vector AS (
    SELECT interacted_items
    FROM user_vectors
    WHERE user_vectors.user_id = target_user_id
  ),
  similarities AS (
    SELECT 
      uv.user_id,
      CASE 
        WHEN array_length(uv.interacted_items, 1) = 0 OR array_length(tv.interacted_items, 1) = 0 
        THEN 0::DECIMAL
        ELSE (
          array_length(
            ARRAY(SELECT unnest(uv.interacted_items) INTERSECT SELECT unnest(tv.interacted_items)), 
            1
          )::DECIMAL / 
          GREATEST(array_length(uv.interacted_items, 1), array_length(tv.interacted_items, 1))
        )
      END as similarity_score
    FROM user_vectors uv
    CROSS JOIN target_vector tv
    WHERE uv.user_id != target_user_id
  )
  SELECT s.user_id, s.similarity_score
  FROM similarities s
  WHERE s.similarity_score >= similarity_threshold
  ORDER BY s.similarity_score DESC
  LIMIT limit_users;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended sellers
CREATE OR REPLACE FUNCTION get_recommended_sellers(
  target_user_id UUID,
  limit_sellers INTEGER DEFAULT 10
)
RETURNS TABLE(
  seller_id UUID,
  seller_name VARCHAR,
  recommendation_score DECIMAL,
  total_products INTEGER,
  avg_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    SELECT DISTINCT p.category_id
    FROM user_behavior ub
    JOIN products p ON ub.target_id = p.id
    WHERE ub.user_id = target_user_id
      AND ub.action_type IN ('view', 'like', 'swipe_right')
      AND ub.target_type = 'product'
      AND ub.created_at > NOW() - INTERVAL '30 days'
  ),
  seller_stats AS (
    SELECT 
      u.id as seller_id,
      u.full_name as seller_name,
      COUNT(p.id) as total_products,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(CASE WHEN p.category_id IN (SELECT category_id FROM user_categories) THEN 1 END) as matching_categories
    FROM users u
    JOIN products p ON u.id = p.seller_id
    LEFT JOIN reviews r ON u.id = r.reviewed_user_id AND r.review_type = 'seller'
    WHERE u.role = 'seller'
      AND u.is_verified = true
      AND p.status = 'active'
    GROUP BY u.id, u.full_name
    HAVING COUNT(p.id) >= 3
  )
  SELECT 
    ss.seller_id,
    ss.seller_name,
    (
      (ss.matching_categories::DECIMAL / GREATEST(ss.total_products, 1)) * 0.4 +
      (ss.avg_rating / 5.0) * 0.3 +
      (LEAST(ss.total_products, 50)::DECIMAL / 50.0) * 0.3
    ) as recommendation_score,
    ss.total_products,
    ss.avg_rating
  FROM seller_stats ss
  WHERE ss.seller_id != target_user_id
  ORDER BY recommendation_score DESC
  LIMIT limit_sellers;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending categories
CREATE OR REPLACE FUNCTION get_trending_categories(
  user_id UUID,
  limit_categories INTEGER DEFAULT 10
)
RETURNS TABLE(
  category_id UUID,
  category_name VARCHAR,
  trend_score DECIMAL,
  recent_activity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH category_activity AS (
    SELECT 
      p.category_id,
      c.name as category_name,
      COUNT(*) as recent_activity,
      COUNT(DISTINCT ub.user_id) as unique_users
    FROM user_behavior ub
    JOIN products p ON ub.target_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE ub.created_at > NOW() - INTERVAL '7 days'
      AND ub.action_type IN ('view', 'like', 'swipe_right')
      AND ub.target_type = 'product'
    GROUP BY p.category_id, c.name
  ),
  user_interests AS (
    SELECT category_id, interest_level
    FROM user_interests
    WHERE user_interests.user_id = get_trending_categories.user_id
  )
  SELECT 
    ca.category_id,
    ca.category_name,
    (
      (ca.recent_activity::DECIMAL / 100.0) * 0.5 +
      (ca.unique_users::DECIMAL / 50.0) * 0.3 +
      COALESCE(ui.interest_level::DECIMAL / 5.0, 0) * 0.2
    ) as trend_score,
    ca.recent_activity
  FROM category_activity ca
  LEFT JOIN user_interests ui ON ca.category_id = ui.category_id
  ORDER BY trend_score DESC
  LIMIT limit_categories;
END;
$$ LANGUAGE plpgsql;

-- Function to get bundle recommendations
CREATE OR REPLACE FUNCTION get_bundle_recommendations(
  user_id UUID,
  limit_bundles INTEGER DEFAULT 10
)
RETURNS TABLE(
  product_id UUID,
  product_title VARCHAR,
  bundle_score DECIMAL,
  frequently_bought_with UUID[]
) AS $$
BEGIN
  RETURN QUERY
  WITH user_orders AS (
    SELECT DISTINCT o.product_id
    FROM orders o
    WHERE o.buyer_id = get_bundle_recommendations.user_id
      AND o.order_status = 'delivered'
  ),
  product_pairs AS (
    SELECT 
      o1.product_id as product_a,
      o2.product_id as product_b,
      COUNT(*) as pair_frequency
    FROM orders o1
    JOIN orders o2 ON o1.buyer_id = o2.buyer_id 
      AND o1.product_id != o2.product_id
      AND o1.created_at::DATE = o2.created_at::DATE
    WHERE o1.order_status = 'delivered'
      AND o2.order_status = 'delivered'
    GROUP BY o1.product_id, o2.product_id
    HAVING COUNT(*) >= 2
  ),
  recommendations AS (
    SELECT 
      pp.product_b as product_id,
      p.title as product_title,
      AVG(pp.pair_frequency::DECIMAL) as bundle_score,
      array_agg(DISTINCT pp.product_a) as frequently_bought_with
    FROM product_pairs pp
    JOIN products p ON pp.product_b = p.id
    WHERE pp.product_a IN (SELECT product_id FROM user_orders)
      AND pp.product_b NOT IN (SELECT product_id FROM user_orders)
      AND p.status = 'active'
    GROUP BY pp.product_b, p.title
  )
  SELECT 
    r.product_id,
    r.product_title,
    r.bundle_score,
    r.frequently_bought_with
  FROM recommendations r
  ORDER BY r.bundle_score DESC
  LIMIT limit_bundles;
END;
$$ LANGUAGE plpgsql;
