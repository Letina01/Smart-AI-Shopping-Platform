CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS history_db;

CREATE USER IF NOT EXISTS 'shopping_user'@'%' IDENTIFIED BY 'shopping_pass';
GRANT ALL PRIVILEGES ON auth_db.* TO 'shopping_user'@'%';
GRANT ALL PRIVILEGES ON user_db.* TO 'shopping_user'@'%';
GRANT ALL PRIVILEGES ON order_db.* TO 'shopping_user'@'%';
GRANT ALL PRIVILEGES ON history_db.* TO 'shopping_user'@'%';
FLUSH PRIVILEGES;
