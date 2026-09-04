import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'BA_STORE_SUPABASE_CONFIG_V1';

export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing /rest/v1 or /rest/v1/ that users often copy from Supabase Data API
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

// Default values from environment if provided
const ENV_URL = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
const ENV_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let cachedClient = null;
let currentConfig = null;

/**
 * Get current Supabase credentials (from localStorage or .env)
 */
export function getSupabaseConfig() {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return {
          url: normalizeSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey.trim(),
          source: 'localStorage'
        };
      }
    }
  } catch (err) {
    console.error('Error reading Supabase config from localStorage', err);
  }

const DEFAULT_URL = 'https://cvqbhkcjbrtykoltqzpy.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cWJoa2NqYnJ0eWtvbHRxenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTI0NTUsImV4cCI6MjEwMzk4ODQ1NX0.DIPPSuHO2hwRmy7FeNkscH5ljVZNpqtZY4PwWmzZy3Y';

  if (ENV_URL && ENV_ANON_KEY) {
    return {
      url: ENV_URL,
      anonKey: ENV_ANON_KEY,
      source: 'env'
    };
  }

  return {
    url: DEFAULT_URL,
    anonKey: DEFAULT_ANON_KEY,
    source: 'default'
  };
}

/**
 * Save Supabase credentials to localStorage
 */
export function saveSupabaseConfig(url, anonKey) {
  try {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = (anonKey || '').trim();

    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem(SUPABASE_CONFIG_KEY);
      cachedClient = null;
      currentConfig = null;
      return;
    }

    localStorage.setItem(
      SUPABASE_CONFIG_KEY,
      JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
    );

    // Reset client to re-initialize with new credentials
    cachedClient = null;
    currentConfig = null;
  } catch (err) {
    console.error('Error saving Supabase config to localStorage', err);
  }
}

/**
 * Check if Supabase credentials are configured
 */
export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

/**
 * Get or create Supabase client instance
 */
export function getSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config.url || !config.anonKey) {
    return null;
  }

  // Reuse cached client if config didn't change
  if (
    cachedClient &&
    currentConfig &&
    currentConfig.url === config.url &&
    currentConfig.anonKey === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    currentConfig = { ...config };
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client', err);
    return null;
  }
}

/**
 * Test Supabase connection and verify table exists
 */
export async function testSupabaseConnection(customUrl, customKey) {
  const url = normalizeSupabaseUrl(customUrl || getSupabaseConfig().url || '');
  const anonKey = (customKey || getSupabaseConfig().anonKey || '').trim();

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'กรุณากรอกทั้ง Supabase URL และ anon Key'
    };
  }

  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false }
    });

    // Test query on products or store_data table
    let { error } = await client
      .from('products')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      const fallback = await client.from('store_data').select('key').limit(1);
      error = fallback.error;
    }

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          code: 'TABLE_NOT_FOUND',
          message:
            'เชื่อมต่อสำเร็จแล้ว แต่ยังไม่พบตารางในฐานข้อมูล (กรุณาคัดลอกโค้ดจาก supabase-schema.sql ไปกด Run ในเมนู SQL Editor ของ Supabase ก่อนครับ)'
        };
      }
      return {
        success: false,
        code: error.code,
        message: `ข้อผิดพลาดจาก Supabase: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'เชื่อมต่อกับ Supabase สำเร็จเรียบร้อยแล้ว!'
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'ไม่สามารถเชื่อมต่อกับ Supabase ได้'
    };
  }
}
