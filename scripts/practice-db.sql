-- Run with psql in a disposable database initialized by V1 and V2.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO cities(name) VALUES ('Тест №17') RETURNING id AS city_id \gset
INSERT INTO stores(name,city_id) VALUES ('Учебный магазин', :city_id) RETURNING id AS store_id \gset
INSERT INTO products(name,unit) VALUES ('Учебный товар','шт') RETURNING id AS product_id \gset
INSERT INTO product_prices(product_id,store_id,price_date,price)
VALUES (:product_id,:store_id,DATE '2020-01-01',42.50) RETURNING id AS price_id \gset
UPDATE product_prices SET price=43.00 WHERE id=:price_id RETURNING price;
SELECT price_date,price FROM product_prices WHERE id=:price_id;
DELETE FROM product_prices WHERE id=:price_id RETURNING price;
SELECT count(*) AS remaining FROM product_prices WHERE id=:price_id;

-- Generate daily history for one pair and for 19 other products in the same store.
INSERT INTO products(name,unit)
SELECT 'Учебный ряд ' || n,'шт' FROM generate_series(1,19) AS n;
INSERT INTO product_prices(product_id,store_id,price_date,price)
SELECT p.id,:store_id,DATE '2018-01-01'+day,40+day%25
FROM products p CROSS JOIN generate_series(0,364) AS day
WHERE p.id=:product_id OR p.name LIKE 'Учебный ряд %';
ANALYZE product_prices;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM product_prices WHERE product_id=:product_id AND store_id=:store_id ORDER BY price_date;
EXPLAIN (ANALYZE, BUFFERS)
SELECT price_date,price FROM product_prices WHERE product_id=:product_id AND store_id=:store_id
ORDER BY price_date DESC LIMIT 5;
ROLLBACK;
