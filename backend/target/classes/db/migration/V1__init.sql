CREATE TABLE categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME NOT NULL,
    CONSTRAINT uq_categories_name UNIQUE (name)
);

CREATE TABLE products (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(200) NOT NULL,
    brand                VARCHAR(100),
    model_number         VARCHAR(100),
    serial_number        VARCHAR(100),
    barcode              VARCHAR(100),
    category_id          BIGINT NOT NULL,
    purchase_date        DATE NOT NULL,
    purchase_price       DECIMAL(12, 2),
    warranty_start_date  DATE,
    warranty_expiry_date DATE,
    warranty_period      INT,
    warranty_period_unit VARCHAR(10),
    store_seller         VARCHAR(150),
    notes                VARCHAR(1000),
    created_at           DATETIME NOT NULL,
    updated_at           DATETIME NOT NULL,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_expiry ON products (warranty_expiry_date);
CREATE INDEX idx_products_barcode ON products (barcode);
CREATE INDEX idx_products_serial ON products (serial_number);

CREATE TABLE documents (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id    BIGINT NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    file_path     VARCHAR(255) NOT NULL,
    file_type     VARCHAR(100) NOT NULL,
    document_type VARCHAR(20) NOT NULL,
    file_size     BIGINT NOT NULL,
    created_at    DATETIME NOT NULL,
    CONSTRAINT fk_documents_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_product ON documents (product_id);

CREATE TABLE notifications (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id        BIGINT NOT NULL,
    type              VARCHAR(30) NOT NULL,
    message           VARCHAR(255) NOT NULL,
    notification_date DATE NOT NULL,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        DATETIME NOT NULL,
    CONSTRAINT fk_notifications_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT uq_notifications_once UNIQUE (product_id, type, notification_date)
);

CREATE INDEX idx_notifications_read ON notifications (is_read);

INSERT INTO categories (name, created_at, updated_at) VALUES
    ('Electronics',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Computers',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Home Appliances',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Mobile',           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Furniture',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Vehicle',          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Fashion',          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Other',            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
