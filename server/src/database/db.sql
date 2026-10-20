CREATE DATABASE smart_expense_tracker_db


CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NULL,
    profile_image VARCHAR(500) NULL,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone_number UNIQUE(phone_number)
);

CREATE TABLE refresh_tokens(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    device_name VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    CONSTRAINT uq_refresh_tokens_token_hash UNIQUE(token_hash),
    CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_password_reset_tokens_user
        (user_id),

    INDEX idx_password_reset_tokens_expires_at
        (expires_at)
);

CREATE TABLE email_verification_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_email_verification_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_email_verification_tokens_user
        (user_id),

    INDEX idx_email_verification_tokens_expires_at
        (expires_at)
);

CREATE TABLE accounts(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL,
    opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    color VARCHAR(20) NULL,
    icon VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_accounts_user_name UNIQUE(user_id,name),
    CONSTRAINT fk_accounts_user 
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
    CONSTRAINT chk_accounts_opening_balance
    CHECK (opening_balance >= 0)
);

CREATE TABLE user_settings(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    preferred_currency CHAR(3) NOT NULL DEFAULT 'ETB',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(100) NOT NULL DEFAULT 'East African timezone',
    date_format VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(10) NOT NULL DEFAULT '24-hour',
    theme VARCHAR(20) NOT NULL DEFAULT 'system',
    default_account_id BIGINT UNSIGNED NULL,
    default_export_format VARCHAR(20) NOT NULL DEFAULT 'PDF',
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    first_day_of_week VARCHAR(10) NOT NULL DEFAULT 'monday',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP ,
    CONSTRAINT uq_user_settings_user UNIQUE(user_id),
    CONSTRAINT fk_user_settings_user
       FOREIGN KEY(user_id)
       REFERENCES users(id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
    CONSTRAINT fk_user_settings_default_account
       FOREIGN KEY (default_account_id)
       REFERENCES accounts(id)
       ON DELETE SET NULL
       ON UPDATE CASCADE 
    
);
CREATE TABLE categories(
     id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
     user_id BIGINT UNSIGNED  NULL,
     name VARCHAR(50) NOT NULL,
     transaction_type VARCHAR(20) NOT NULL,
     icon VARCHAR(100) NULL,
     color VARCHAR(20) NULL,
     is_system BOOLEAN NOT NULL DEFAULT FALSE,
     is_active BOOLEAN NOT NULL DEFAULT TRUE,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     CONSTRAINT uq_categories_user_name_type
     UNIQUE(user_id,name,transaction_type),
    CONSTRAINT fk_categories_user
     FOREIGN KEY (user_id)
     REFERENCES users(id)
     ON DELETE CASCADE
     ON UPDATE CASCADE
);

CREATE TABLE tags(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_tags_user_name UNIQUE(user_id,name),
    CONSTRAINT fk_tags_user
     FOREIGN KEY (user_id)
     REFERENCES users(id)
     ON DELETE CASCADE
     ON UPDATE CASCADE
);


CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    category_id BIGINT UNSIGNED NULL,

    from_account_id BIGINT UNSIGNED NULL,

    to_account_id BIGINT UNSIGNED NULL,

    transaction_type VARCHAR(20) NOT NULL,

    amount DECIMAL(15,2) NOT NULL,

    title VARCHAR(150) NOT NULL,

    description TEXT NULL,

    payment_method VARCHAR(50) NULL,

    transaction_date DATETIME NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',

    reference_number VARCHAR(100) NULL,

    location VARCHAR(255) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_transactions_from_account
        FOREIGN KEY (from_account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_transactions_to_account
        FOREIGN KEY (to_account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_transactions_amount
        CHECK (amount > 0),

    INDEX idx_transactions_user_date
        (user_id, transaction_date),

    INDEX idx_transactions_user_category
        (user_id, category_id),

    INDEX idx_transactions_from_account
        (from_account_id),

    INDEX idx_transactions_to_account
        (to_account_id)
);

CREATE TABLE transaction_tags (
    transaction_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (transaction_id, tag_id),
    CONSTRAINT fk_transaction_tags_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_transaction_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE transaction_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    transaction_id BIGINT UNSIGNED NOT NULL,

    original_file_name VARCHAR(255) NOT NULL,

    stored_file_name VARCHAR(255) NOT NULL,

    file_path VARCHAR(500) NOT NULL,

    mime_type VARCHAR(100) NOT NULL,

    file_size BIGINT UNSIGNED NOT NULL,

    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_attachments_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_transaction_attachments_transaction
        (transaction_id)
);

CREATE TABLE budgets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    category_id BIGINT UNSIGNED NULL,

    name VARCHAR(100) NOT NULL,

    amount DECIMAL(15,2) NOT NULL,

    period VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    alert_percentage TINYINT UNSIGNED NOT NULL DEFAULT 80,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_budget_amount
        CHECK (amount > 0),

    CONSTRAINT chk_budget_alert_percentage
        CHECK (alert_percentage BETWEEN 1 AND 100),

    CONSTRAINT chk_budget_dates
        CHECK (start_date <= end_date),

    CONSTRAINT uq_budget_period
        UNIQUE (user_id, category_id, period, start_date),

    INDEX idx_budgets_user_active
        (user_id, is_active),

    INDEX idx_budgets_category
        (category_id)
);


CREATE TABLE savings_goals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    account_id BIGINT UNSIGNED NOT NULL,

    name VARCHAR(100) NOT NULL,

    description TEXT NULL,

    target_amount DECIMAL(15,2) NOT NULL,

    target_date DATE NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',

    icon VARCHAR(100) NULL,

    color VARCHAR(20) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_savings_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_savings_goals_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_savings_goal_amount
        CHECK (target_amount > 0),

    INDEX idx_savings_goals_user_status
        (user_id, status),

    INDEX idx_savings_goals_account
        (account_id)
);


CREATE TABLE savings_contributions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    savings_goal_id BIGINT UNSIGNED NOT NULL,

    transaction_id BIGINT UNSIGNED NOT NULL,

    note VARCHAR(255) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_savings_contributions_transaction
        UNIQUE (transaction_id),

    CONSTRAINT fk_savings_contributions_goal
        FOREIGN KEY (savings_goal_id)
        REFERENCES savings_goals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_savings_contributions_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_savings_contributions_goal
        (savings_goal_id)
);


CREATE TABLE recurring_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    category_id BIGINT UNSIGNED NULL,

    account_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(150) NOT NULL,

    description TEXT NULL,

    transaction_type VARCHAR(20) NOT NULL,

    amount DECIMAL(15,2) NOT NULL,

    frequency VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NULL,

    next_execution_date DATE NOT NULL,

    last_execution_date DATE NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_recurring_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_recurring_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_recurring_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_recurring_transaction_amount
        CHECK (amount > 0),

    CONSTRAINT chk_recurring_dates
        CHECK (end_date IS NULL OR end_date >= start_date),

    INDEX idx_recurring_transactions_execution
        (next_execution_date),

    INDEX idx_recurring_transactions_user
        (user_id)
);


CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(30) NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    read_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_notifications_user_read
        (user_id, is_read),

    INDEX idx_notifications_created_at
        (created_at)
);


CREATE TABLE report_exports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    report_type VARCHAR(50) NOT NULL,

    export_format VARCHAR(20) NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    storage_key VARCHAR(500) NOT NULL,

    filters JSON NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',

    exported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    expires_at DATETIME NULL,

    CONSTRAINT fk_report_exports_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_report_exports_user
        (user_id),

    INDEX idx_report_exports_type
        (report_type)
);