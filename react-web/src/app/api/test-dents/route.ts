import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/test-dents
 * 
 * Test endpoint to verify DENTS API integration is working.
 * This endpoint tests both contact and tile DENTS endpoints.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testContactId = searchParams.get('contactId') || '3fb40c3d-e5ca-4ee6-b385-97d5a94004a1'; // Sample contact ID
    const testTileId = searchParams.get('tileId') || 'sample-tile-id';
    const accountId = searchParams.get('accountId') || '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31';
    const userId = searchParams.get('userId') || '659917a4-302e-4117-8a5f-8be3b8cc945b';
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required for testing' },
        { status: 401 }
      );
    }
    
    const baseUrl = new URL(request.url).origin;
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    // Test 1: Contact DENTS API
    try {
      const contactDentsUrl = `${baseUrl}/api/dents/contact/${testContactId}?accountId=${accountId}&userId=${userId}`;
      console.log('[DENTS_TEST] Testing contact DENTS:', contactDentsUrl);
      
      const contactResponse = await fetch(contactDentsUrl, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      
      const contactData = contactResponse.ok ? await contactResponse.json() : null;
      
      results.tests.push({
        name: 'Contact DENTS API',
        url: contactDentsUrl,
        status: contactResponse.status,
        success: contactResponse.ok,
        data: contactData,
        error: contactResponse.ok ? null : `${contactResponse.status} ${contactResponse.statusText}`
      });
      
    } catch (error) {
      results.tests.push({
        name: 'Contact DENTS API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Tile DENTS API
    try {
      const tileDentsUrl = `${baseUrl}/api/dents/tiles/${testTileId}?accountId=${accountId}&userId=${userId}`;
      console.log('[DENTS_TEST] Testing tile DENTS:', tileDentsUrl);
      
      const tileResponse = await fetch(tileDentsUrl, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      
      const tileData = tileResponse.ok ? await tileResponse.json() : null;
      
      results.tests.push({
        name: 'Tile DENTS API',
        url: tileDentsUrl,
        status: tileResponse.status,
        success: tileResponse.ok,
        data: tileData,
        error: tileResponse.ok ? null : `${tileResponse.status} ${tileResponse.statusText}`
      });
      
    } catch (error) {
      results.tests.push({
        name: 'Tile DENTS API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 3: DENTS Service Functions
    try {
      // Import the service functions dynamically to test them
      const { getContactDents, getTileDents } = await import('../../../services/dentsService');
      
      const serviceTestResult = await getContactDents(testContactId, {
        accountId,
        userId,
        includeDeleted: false
      });
      
      results.tests.push({
        name: 'DENTS Service Function',
        success: true,
        data: {
          entityType: serviceTestResult.entityType,
          entityId: serviceTestResult.entityId,
          counts: serviceTestResult.counts
        }
      });
      
    } catch (error) {
      results.tests.push({
        name: 'DENTS Service Function',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const allTestsPassed = results.tests.every((test: any) => test.success);
    
    return NextResponse.json({
      ...results,
      summary: {
        totalTests: results.tests.length,
        passed: results.tests.filter((test: any) => test.success).length,
        failed: results.tests.filter((test: any) => !test.success).length,
        allPassed: allTestsPassed
      }
    });
    
  } catch (error) {
    console.error('[DENTS_TEST] Error in test endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Test endpoint error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
