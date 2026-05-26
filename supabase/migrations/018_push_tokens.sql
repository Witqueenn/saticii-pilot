-- 018_push_tokens.sql
-- Expo push notification token per seller
alter table sellers add column if not exists push_token text;
