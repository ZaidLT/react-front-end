import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = async () => {
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
    // Get Firebase environment from dedicated environment variable
    const firebaseEnv = process.env.NEXT_PUBLIC_FIREBASE_ENV || 'dev';

    let serviceAccount;

    // Use production config if Firebase environment is set to 'prod'
    if (firebaseEnv === 'prod') {
      serviceAccount = require('../../../../config/eeva-prod-firebase.json');
      console.log('Using Firebase Admin production configuration (firebase env: prod)');
    } else {
      serviceAccount = require('../../../../config/eeva-dev-firebase.json');
      console.log('Using Firebase Admin development configuration (firebase env: dev)');
    }

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    }

    return getFirestore();
  } catch (error) {
    console.error('Firebase Admin SDK not available:', error);
    throw new Error('Firebase Admin SDK not available');
  }
};

export async function POST(request: NextRequest) {
  try {
    const { userId, accountId, eventType = 'import_contact', eventData: additionalData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    console.log(`🔥 Server-side: Triggering ${eventType} for user:`, userId);

    // Initialize Firebase Admin
    const db = await initializeFirebaseAdmin();

    // Create document reference with specific naming: userId_eventType
    const documentId = `${userId}_${eventType}`;
    const docRef = db.collection('AccountEvents').doc(documentId);

    // Check if document exists
    const docSnap = await docRef.get();

    const baseEventData = {
      userId,
      accountId: accountId || null, // Include accountId for reference if provided
      eventType,
      triggered: true,
      lastUpdated: new Date(),
      timestamp: new Date(),
      ...additionalData, // Spread any additional event-specific data
    };

    if (docSnap.exists) {
      // Update existing document
      await docRef.update({
        triggered: true,
        lastUpdated: new Date(),
        timestamp: new Date(),
        ...additionalData,
      });

      console.log(`✅ Updated AccountEvents document: ${documentId}`);
    } else {
      // Create new document
      await docRef.set(baseEventData);

      console.log(`✅ Created AccountEvents document: ${documentId}`);
    }

    return NextResponse.json({
      success: true,
      message: `${eventType} event triggered successfully`,
      userId,
      documentId,
      eventType,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error(`❌ Server-side error triggering event:`, error);

    return NextResponse.json(
      {
        error: 'Failed to trigger event',
        details: error.message
      },
      { status: 500 }
    );
  }
}
