-- Update enums for automated workflow and exemption flows

-- Add missing analysis_status values used by automated workflow
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'submitted'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'submitted';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'queued'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'queued';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'searching'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'searching';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'analyzing'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'analyzing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'generating_claims'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'generating_claims';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'identifying_whitespace'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'identifying_whitespace';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'writing_report'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'writing_report';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'formatting'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'formatting';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'complete'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'complete';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_status' AND e.enumlabel = 'failed'
  ) THEN
    ALTER TYPE analysis_status ADD VALUE 'failed';
  END IF;
END $$;

-- Ensure payment_status has 'exemption'
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_status' AND e.enumlabel = 'exemption'
  ) THEN
    ALTER TYPE payment_status ADD VALUE 'exemption';
  END IF;
END $$;

-- Ensure analysis_type supports current app values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'analysis_type' AND e.enumlabel = 'premium_whitespace'
  ) THEN
    ALTER TYPE analysis_type ADD VALUE 'premium_whitespace';
  END IF;
END $$;