-- Add 'exemption' to payment_status enum
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'exemption';