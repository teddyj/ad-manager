import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    console.log('🔍 Debug: Testing database operations...');

    // Get Supabase credentials (same as campaigns.js)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials',
        env: {
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Supabase client created');

    const results = {};

    // Test 1: Try to select from campaigns table (this is what's failing)
    try {
      console.log('Test 1: SELECT from campaigns...');
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .limit(1);

      results.campaignsSelect = {
        success: !campaignError,
        error: campaignError?.message,
        data: campaigns
      };
      console.log('Campaigns select result:', results.campaignsSelect);
    } catch (error) {
      results.campaignsSelect = {
        success: false,
        error: error.message
      };
      console.log('Campaigns select error:', error.message);
    }

    // Test 2: Try to select from users table
    try {
      console.log('Test 2: SELECT from users...');
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      results.usersSelect = {
        success: !userError,
        error: userError?.message,
        data: users
      };
      console.log('Users select result:', results.usersSelect);
    } catch (error) {
      results.usersSelect = {
        success: false,
        error: error.message
      };
      console.log('Users select error:', error.message);
    }

    // Test 3: Try to get table info from information_schema
    try {
      console.log('Test 3: Check table existence via information_schema...');
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info');

      results.tableInfo = {
        success: !tableError,
        error: tableError?.message,
        data: tableInfo
      };
    } catch (error) {
      results.tableInfo = {
        success: false,
        error: error.message
      };
    }

    // Test 4: Try a simple RPC call to test connection
    try {
      console.log('Test 4: Test connection with simple query...');
      const { data: version, error: versionError } = await supabase
        .rpc('version');

      results.version = {
        success: !versionError,
        error: versionError?.message,
        data: version
      };
    } catch (error) {
      results.version = {
        success: false,
        error: error.message
      };
    }

    res.status(200).json({
      success: true,
      message: 'Database debug tests completed',
      tests: results,
      environment: {
        supabaseUrl: supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      }
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 