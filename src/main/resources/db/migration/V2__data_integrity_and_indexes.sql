-- Migration deliberately fails on conflicting legacy rows; it never deletes data.
ALTER TABLE product_prices ADD CONSTRAINT uq_product_store_date UNIQUE (product_id, store_id, price_date);
ALTER TABLE product_prices ADD CONSTRAINT chk_price_positive CHECK (price > 0);
ALTER TABLE package_items ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0);
ALTER TABLE package_items ADD CONSTRAINT uq_package_product UNIQUE (package_id, product_id);
ALTER TABLE store_promotions ADD CONSTRAINT chk_discount_range CHECK (discount_percent BETWEEN 0 AND 100);
ALTER TABLE store_promotions ADD CONSTRAINT chk_promotion_dates CHECK (valid_to >= valid_from);
ALTER TABLE app_users ADD CONSTRAINT chk_user_role CHECK (role IN ('ADMIN', 'USER'));
CREATE INDEX idx_stores_city ON stores(city_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_promotions_store_dates ON store_promotions(store_id, valid_from, valid_to);
-- uq_product_store_date is also the B-tree index for latest-price and history queries.
