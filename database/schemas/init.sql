-- S6S IoT Platform Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- User role assignments
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- SUBSCRIPTION PLANS (SaaS)
-- ============================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    max_devices INTEGER NOT NULL DEFAULT 5,
    max_users INTEGER NOT NULL DEFAULT 1,
    max_data_retention_days INTEGER NOT NULL DEFAULT 30,
    max_mqtt_messages_per_day INTEGER,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    canceled_at TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================
-- DEVICES
-- ============================================

-- Device types
CREATE TABLE device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    description TEXT,
    default_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device protocols
CREATE TABLE device_protocols (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    port INTEGER DEFAULT 1883,
    tls_port INTEGER DEFAULT 8883,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_type_id INTEGER REFERENCES device_types(id),
    device_protocol_id INTEGER REFERENCES device_protocols(id),
    
    -- Device identification
    device_uuid VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- MQTT credentials
    mqtt_username VARCHAR(100),
    mqtt_password_hash VARCHAR(255),
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Status
    status VARCHAR(50) DEFAULT 'offline', -- online, offline, error, maintenance
    last_seen_at TIMESTAMP,
    firmware_version VARCHAR(50),
    
    -- Configuration
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Tags for grouping
    tags JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device groups
CREATE TABLE device_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device group memberships
CREATE TABLE device_group_members (
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    group_id UUID REFERENCES device_groups(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (device_id, group_id)
);

-- ============================================
-- SENSOR DATA
-- ============================================

-- Sensors (per device)
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(100) NOT NULL, -- e.g., "temperature", "humidity", "pressure"
    unit VARCHAR(20), -- e.g., "°C", "%", "hPa"
    data_type VARCHAR(20) DEFAULT 'numeric', -- numeric, boolean, string
    icon VARCHAR(50),
    
    -- Visualization settings
    chart_type VARCHAR(20) DEFAULT 'line', -- line, gauge, bar
    color VARCHAR(7),
    
    -- Alert thresholds
    min_threshold DECIMAL(15, 4),
    max_threshold DECIMAL(15, 4),
    threshold_enabled BOOLEAN DEFAULT false,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, identifier)
);

-- Sensor readings (time-series data)
-- Partitioned by day for performance
CREATE TABLE sensor_readings (
    id BIGSERIAL,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    value DECIMAL(15, 4) NOT NULL,
    quality INTEGER DEFAULT 100, -- 0-100 quality indicator
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Partition key
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for sensor readings (next 12 months)
CREATE TABLE sensor_readings_2026_03 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE sensor_readings_2026_04 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE sensor_readings_2026_05 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE sensor_readings_2026_06 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE sensor_readings_2026_07 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE sensor_readings_2026_08 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE sensor_readings_2026_09 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE sensor_readings_2026_10 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE sensor_readings_2026_11 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE sensor_readings_2026_12 PARTITION OF sensor_readings
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE sensor_readings_2027_01 PARTITION OF sensor_readings
    FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');

CREATE TABLE sensor_readings_2027_02 PARTITION OF sensor_readings
    FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');

CREATE TABLE sensor_readings_default PARTITION OF sensor_readings DEFAULT;

-- Indexes for sensor readings
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);

-- ============================================
-- ALERTS
-- ============================================

-- Alert rules
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_type VARCHAR(50) NOT NULL, -- threshold, range, change_rate, offline
    condition JSONB NOT NULL, -- { min, max, rate, duration }
    severity VARCHAR(20) NOT NULL, -- critical, warning, info
    notification_channels JSONB DEFAULT '[]', -- email, sms, webhook
    is_active BOOLEAN DEFAULT true,
    
    triggered_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert history
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    sensor_id UUID REFERENCES sensors(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity VARCHAR(20) NOT NULL,
    value DECIMAL(15, 4),
    threshold_value DECIMAL(15, 4),
    status VARCHAR(20) DEFAULT 'triggered', -- triggered, acknowledged, resolved
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DASHBOARDS & WIDGETS
-- ============================================

-- Dashboards
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '[]', -- Grid layout configuration
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    
    widget_type VARCHAR(50) NOT NULL, -- gauge, line_chart, value, status
    title VARCHAR(255),
    config JSONB DEFAULT '{}', -- chart settings, display options
    
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- API KEYS & WEBHOOKS
-- ============================================

-- API keys for device integration
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '[]',
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSONB DEFAULT '[]', -- alert.triggered, device.online, etc.
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_devices, max_users, max_data_retention_days, features, sort_order) VALUES
('Free', 'free', 'Perfect for hobbyists and testing', 0, 0, 5, 1, 7, '{"alerts": true, "dashboard": true, "api_access": false, "export_data": false}', 1),
('Starter', 'starter', 'For small projects and prototypes', 9.99, 99.99, 25, 3, 30, '{"alerts": true, "dashboard": true, "api_access": true, "export_data": true}', 2),
('Professional', 'professional', 'For growing businesses', 29.99, 299.99, 100, 10, 90, '{"alerts": true, "dashboard": true, "api_access": true, "export_data": true, "white_label": false, "priority_support": false}', 3),
('Enterprise', 'enterprise', 'For large-scale deployments', 99.99, 999.99, -1, -1, 365, '{"alerts": true, "dashboard": true, "api_access": true, "export_data": true, "white_label": true, "priority_support": true, "dedicated_support": true}', 4);

-- Insert default device types (Supported Microcontrollers)
INSERT INTO device_types (name, slug, manufacturer, model, description, default_config) VALUES
-- Espressif Systems
('ESP32', 'esp32', 'Espressif', 'ESP32', 'Powerful WiFi + Bluetooth combo microcontroller', '{"sensors": ["temperature", "humidity", "pressure"], "wifi": true, "ble": true, "flash_size": "4MB", "ram": "520KB"}'),
('ESP32-S2', 'esp32-s2', 'Espressif', 'ESP32-S2', 'Single-core WiFi MCU with USB OTG', '{"sensors": ["temperature", "humidity"], "wifi": true, "usb": true, "flash_size": "4MB", "ram": "320KB"}'),
('ESP32-S3', 'esp32-s3', 'Espressif', 'ESP32-S3', 'Dual-core WiFi + Bluetooth LE with AI acceleration', '{"sensors": ["temperature", "humidity", "acceleration"], "wifi": true, "ble": true, "usb": true, "flash_size": "8MB", "ram": "512KB"}'),
('ESP32-C3', 'esp32-c3', 'Espressif', 'ESP32-C3', 'RISC-V based WiFi + Bluetooth LE microcontroller', '{"sensors": ["temperature", "humidity"], "wifi": true, "ble": true, "flash_size": "4MB", "ram": "400KB"}'),
('ESP8266', 'esp8266', 'Espressif', 'ESP8266', 'Low-cost WiFi microcontroller', '{"sensors": ["temperature", "humidity"], "wifi": true, "flash_size": "4MB", "ram": "80KB"}'),
-- Arduino
('Arduino Uno WiFi', 'arduino-uno-wifi', 'Arduino', 'UNO WiFi Rev2', 'ATmega4809 with WiFi and Bluetooth', '{"sensors": ["temperature", "humidity"], "wifi": true, "ble": true, "voltage": "5V"}'),
('Arduino Nano 33 IoT', 'arduino-nano-33-iot', 'Arduino', 'Nano 33 IoT', 'SAMD21 with WiFi and Bluetooth', '{"sensors": ["temperature", "humidity", "acceleration"], "wifi": true, "ble": true, "voltage": "3.3V"}'),
('Arduino MKR WiFi 1010', 'arduino-mkr-wifi-1010', 'Arduino', 'MKR WiFi 1010', 'SAMD21 with WiFi and crypto', '{"sensors": ["temperature", "humidity"], "wifi": true, "voltage": "3.3V"}'),
-- Raspberry Pi
('Raspberry Pi Pico', 'raspberry-pi-pico', 'Raspberry Pi', 'RP2040', 'Dual-core ARM Cortex-M0+ microcontroller', '{"sensors": ["temperature", "humidity"], "wifi": false, "ble": false, "flash_size": "2MB", "ram": "264KB"}'),
('Raspberry Pi Pico W', 'raspberry-pi-pico-w', 'Raspberry Pi', 'RP2040', 'Pico with WiFi and Bluetooth', '{"sensors": ["temperature", "humidity"], "wifi": true, "ble": true, "flash_size": "2MB", "ram": "264KB"}'),
-- STMicroelectronics (STM32)
('STM32 F401RE', 'stm32-f401re', 'STMicroelectronics', 'STM32F401RE', 'ARM Cortex-M4 with 84MHz', '{"sensors": ["temperature", "humidity"], "wifi": false, "voltage": "3.3V", "flash_size": "512KB", "ram": "96KB"}'),
('STM32 L476RG', 'stm32-l476rg', 'STMicroelectronics', 'STM32L476RG', 'Ultra-low-power ARM Cortex-M4', '{"sensors": ["temperature", "humidity"], "wifi": false, "voltage": "3.3V", "flash_size": "1MB", "ram": "128KB"}'),
('STM32WB55', 'stm32-wb55', 'STMicroelectronics', 'STM32WB55', 'Dual-core Bluetooth LE MCU', '{"sensors": ["temperature", "humidity"], "wifi": false, "ble": true, "voltage": "3.3V", "flash_size": "512KB", "ram": "256KB"}'),
-- Nordic Semiconductor
('nRF52840', 'nrf52840', 'Nordic Semiconductor', 'nRF52840', 'Powerful Bluetooth LE ARM Cortex-M4', '{"sensors": ["temperature", "humidity"], "ble": true, "voltage": "3.3V", "flash_size": "1MB", "ram": "256KB"}'),
('nRF52832', 'nrf52832', 'Nordic Semiconductor', 'nRF52832', 'Bluetooth LE ARM Cortex-M4', '{"sensors": ["temperature", "humidity"], "ble": true, "voltage": "3.3V", "flash_size": "512KB", "ram": "64KB"}'),
-- Texas Instruments
('CC3220', 'cc3220', 'Texas Instruments', 'CC3220', 'Single-chip WiFi MCU', '{"sensors": ["temperature", "humidity"], "wifi": true, "voltage": "3.3V", "flash_size": "2MB", "ram": "256KB"}'),
('MSP432', 'msp432', 'Texas Instruments', 'MSP432P401R', 'Ultra-low-power ARM Cortex-M4', '{"sensors": ["temperature", "humidity"], "wifi": false, "voltage": "3.3V", "flash_size": "256KB", "ram": "64KB"}'),
-- Microchip
('ATmega4809', 'atmega4809', 'Microchip', 'ATmega4809', '8-bit AVR with enhanced peripherals', '{"sensors": ["temperature", "humidity"], "wifi": false, "voltage": "5V", "flash_size": "48KB", "ram": "6KB"}'),
('SAMD21', 'samd21', 'Microchip', 'SAMD21G18', '32-bit ARM Cortex-M0+', '{"sensors": ["temperature", "humidity"], "wifi": false, "voltage": "3.3V", "flash_size": "256KB", "ram": "32KB"}');

-- Insert default device protocols
INSERT INTO device_protocols (name, slug, description, port, tls_port) VALUES
('MQTT', 'mqtt', 'Message Queuing Telemetry Transport', 1883, 8883);

-- Insert default role
INSERT INTO roles (name, description) VALUES
('admin', 'Full system access'),
('user', 'Regular user access'),
('viewer', 'Read-only access');

-- Insert default permissions
INSERT INTO permissions (name, description, category) VALUES
-- Device permissions
('devices:read', 'View devices', 'devices'),
('devices:create', 'Create devices', 'devices'),
('devices:update', 'Update devices', 'devices'),
('devices:delete', 'Delete devices', 'devices'),
('devices:control', 'Control devices (restart, etc.)', 'devices'),

-- Sensor permissions
('sensors:read', 'View sensors', 'sensors'),
('sensors:create', 'Create sensors', 'sensors'),
('sensors:update', 'Update sensors', 'sensors'),
('sensors:delete', 'Delete sensors', 'sensors'),

-- Alert permissions
('alerts:read', 'View alerts', 'alerts'),
('alerts:create', 'Create alerts', 'alerts'),
('alerts:update', 'Update alerts', 'alerts'),
('alerts:delete', 'Delete alerts', 'alerts'),

-- Firmware permissions
('firmware:read', 'View firmware', 'firmware'),
('firmware:create', 'Create firmware', 'firmware'),
('firmware:update', 'Update firmware', 'firmware'),
('firmware:delete', 'Delete firmware', 'firmware'),

-- User permissions
('users:read', 'View users', 'users'),
('users:create', 'Create users', 'users'),
('users:update', 'Update users', 'users'),
('users:delete', 'Delete users', 'users'),

-- Analytics permissions
('analytics:read', 'View analytics', 'analytics'),
('analytics:export', 'Export analytics data', 'analytics'),

-- Settings permissions
('settings:read', 'View settings', 'settings'),
('settings:update', 'Update settings', 'settings');

-- Assign permissions to roles
-- Admin role gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- User role gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE category IN ('devices', 'sensors', 'alerts');

-- Viewer role gets read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE name LIKE '%:read';

-- ============================================
-- FIRMWARE MANAGEMENT
-- ============================================

-- Firmware versions
CREATE TABLE firmware_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    device_type_id INTEGER REFERENCES device_types(id),
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    checksum VARCHAR(128),
    build_date DATE,
    is_stable BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Firmware update history
CREATE TABLE firmware_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    firmware_id UUID REFERENCES firmware_versions(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, initiated, downloading, flashing, completed, failed
    progress INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notification templates
CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- email, sms, push, webhook
    subject VARCHAR(255),
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- email, sms, push, webhook
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, channel, notification_type)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- alert, device, system, firmware
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    channel VARCHAR(20), -- email, sms, push, webhook, in_app
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS
-- ============================================

-- Aggregated sensor data (hourly)
CREATE TABLE sensor_data_hourly (
    id BIGSERIAL PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    bucket TIMESTAMP NOT NULL,
    avg_value DECIMAL(15, 4),
    min_value DECIMAL(15, 4),
    max_value DECIMAL(15, 4),
    count INTEGER DEFAULT 0,
    stddev DECIMAL(15, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sensor_id, bucket)
);

-- Aggregated sensor data (daily)
CREATE TABLE sensor_data_daily (
    id BIGSERIAL PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    bucket DATE NOT NULL,
    avg_value DECIMAL(15, 4),
    min_value DECIMAL(15, 4),
    max_value DECIMAL(15, 4),
    count INTEGER DEFAULT 0,
    stddev DECIMAL(15, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sensor_id, bucket)
);

-- Device analytics
CREATE TABLE device_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    online_time_minutes INTEGER DEFAULT 0,
    offline_time_minutes INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, date)
);

-- ============================================
-- VIEWS
-- ============================================

-- Device with latest reading view
CREATE OR REPLACE VIEW device_latest_readings AS
SELECT 
    d.id as device_id,
    d.name as device_name,
    d.status,
    d.last_seen_at,
    s.id as sensor_id,
    s.name as sensor_name,
    s.identifier,
    s.unit,
    sr.value as latest_value,
    sr.timestamp as latest_timestamp
FROM devices d
LEFT JOIN sensors s ON s.device_id = d.id AND s.is_active = true
LEFT JOIN LATERAL (
    SELECT value, timestamp 
    FROM sensor_readings 
    WHERE sensor_id = s.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) sr ON true
WHERE d.is_active = true;

-- User subscription status view
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
    u.id as user_id,
    u.email,
    sp.name as plan_name,
    sp.slug as plan_slug,
    s.status as subscription_status,
    s.billing_cycle,
    s.expires_at,
    sp.max_devices,
    sp.max_users,
    sp.max_data_retention_days,
    (SELECT COUNT(*) FROM devices WHERE user_id = u.id AND is_active = true) as device_count
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id;

-- ============================================
-- PROJECTS
-- ============================================

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- smart_home, industrial, agriculture, healthcare, smart_city, environmental, other
    tags JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active', -- active, paused, archived
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project devices (many-to-many)
CREATE TABLE project_devices (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, device_id)
);

-- Create trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEQUENCES FOR API KEYS
-- ============================================

CREATE SEQUENCE api_key_prefix_seq START WITH 1000;
