# 📱 iOS Firebase Integration Guide

## Overview
The web app triggers events (contact import, calendar integration) by writing to a Firestore collection. The iOS app listens for these events and triggers native functionality.

**Important:** This implementation does NOT use Firebase Authentication. The iOS app connects to Firestore as an unauthenticated client.

## Firebase Setup

### 1. Get Firebase Configuration Files

You need to download the iOS configuration files from Firebase Console:

#### For Development Environment:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the **`eeva-dev`** project
3. Click the **gear icon** → **Project Settings**
4. Go to **"Your apps"** section
5. Click on your **iOS app** (or click "Add app" if iOS app doesn't exist)
6. Download **`GoogleService-Info.plist`**
7. Rename it to **`GoogleService-Info-Dev.plist`**

#### For Production Environment:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the **`eeva-prod`** project
3. Click the **gear icon** → **Project Settings**
4. Go to **"Your apps"** section
5. Click on your **iOS app** (or click "Add app" if iOS app doesn't exist)
6. Download **`GoogleService-Info.plist`**
7. Rename it to **`GoogleService-Info-Prod.plist`**

#### Important Notes:
- ⚠️ **Do NOT use** the `eeva-dev-firebase.json` or `eeva-prod-firebase.json` files - these are server-side service account files
- ✅ **Use only** the `GoogleService-Info.plist` files downloaded from the iOS app section
- 🔧 **Configure build schemes** to use the appropriate plist file for each environment

### 2. Add Firebase to iOS Project
```bash
# Add Firebase iOS SDK via SPM or CocoaPods
pod 'Firebase/Firestore'
```

### 3. Configure Firebase
- Add both `GoogleService-Info-Dev.plist` and `GoogleService-Info-Prod.plist` to your iOS project
- Configure build schemes to use the correct file for each environment
- Initialize Firebase in `AppDelegate` or `@main App`

```swift
import Firebase

@main
struct YourApp: App {
    init() {
        // Configure Firebase with the appropriate plist for your environment
        FirebaseApp.configure()
    }
}
```

## Implementation

### 4. Create Event Listener Manager
```swift
import FirebaseFirestore

class EventListener: ObservableObject {
    private var db = Firestore.firestore()
    private var contactImportListener: ListenerRegistration?
    private var calendarListener: ListenerRegistration?
    
    func startListening(for userId: String) {
        startContactImportListening(for: userId)
        startCalendarEventListening(for: userId)
    }
    
    // MARK: - Contact Import Events
    
    private func startContactImportListening(for userId: String) {
        let documentId = "\(userId)_import_contact"
        
        contactImportListener = db.collection("AccountEvents")
            .document(documentId)
            .addSnapshotListener { [weak self] documentSnapshot, error in
                
                guard let document = documentSnapshot else {
                    print("Error fetching contact import document: \(error!)")
                    return
                }
                
                if document.exists {
                    let data = document.data()
                    let triggered = data?["triggered"] as? Bool ?? false
                    
                    if triggered {
                        print("🔥 Contact import triggered!")
                        self?.triggerNativeContactImport()
                        self?.markEventAsConsumed(documentId: documentId)
                    }
                }
            }
    }
    
    private func triggerNativeContactImport() {
        print("📱 Starting native contact import...")
        
        DispatchQueue.main.async {
            // TODO: Implement your contact import logic
            // Examples:
            // self.presentContactPicker()
            // self.navigateToContactImportScreen()
            // self.requestContactsPermission()
        }
    }
    
    // MARK: - Calendar Events
    
    private func startCalendarEventListening(for userId: String) {
        let documentId = "\(userId)_add_calendar"
        
        calendarListener = db.collection("AccountEvents")
            .document(documentId)
            .addSnapshotListener { [weak self] documentSnapshot, error in
                
                guard let document = documentSnapshot else {
                    print("Error fetching calendar document: \(error!)")
                    return
                }
                
                if document.exists {
                    let data = document.data()
                    let triggered = data?["triggered"] as? Bool ?? false
                    
                    if triggered {
                        print("🔥 Calendar integration triggered!")
                        self?.triggerNativeCalendarIntegration()
                        self?.markEventAsConsumed(documentId: documentId)
                    }
                }
            }
    }
    
    private func triggerNativeCalendarIntegration() {
        print("📱 Starting native calendar integration...")
        
        DispatchQueue.main.async {
            self.showCalendarIntegrationOptions()
        }
    }
    
    // MARK: - Calendar Integration Options
    
    private func showCalendarIntegrationOptions() {
        let alert = UIAlertController(
            title: "Add Calendar", 
            message: "Choose how you'd like to add a calendar", 
            preferredStyle: .actionSheet
        )
        
        // Google Calendar option
        alert.addAction(UIAlertAction(title: "Google Calendar", style: .default) { _ in
            self.initiateGoogleCalendarAuth()
        })
        
        // iCloud Calendar option
        alert.addAction(UIAlertAction(title: "iCloud Calendar", style: .default) { _ in
            self.requestSystemCalendarAccess()
        })
        
        // Other calendar services
        alert.addAction(UIAlertAction(title: "Other Calendar (CalDAV)", style: .default) { _ in
            self.showCalDAVSetup()
        })
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        
        // Present the alert
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(alert, animated: true)
        }
    }
    
    private func initiateGoogleCalendarAuth() {
        print("🔗 Starting Google Calendar authentication...")
        // TODO: Implement Google Calendar OAuth flow
        // Use Google Sign-In SDK or your preferred method
    }
    
    private func requestSystemCalendarAccess() {
        import EventKit
        
        let eventStore = EKEventStore()
        
        eventStore.requestAccess(to: .event) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    print("✅ Calendar access granted")
                    // TODO: Navigate to calendar selection or setup
                } else {
                    print("❌ Calendar access denied")
                    // TODO: Show error message or settings redirect
                }
            }
        }
    }
    
    private func showCalDAVSetup() {
        print("🔗 Starting CalDAV setup...")
        // TODO: Navigate to CalDAV setup screen
        // Show your CalDAV configuration UI
    }
    
    // MARK: - Event Cleanup
    
    private func markEventAsConsumed(documentId: String) {
        // Update the document to mark as consumed
        db.collection("AccountEvents")
            .document(documentId)
            .updateData([
                "triggered": false,
                "consumed": true,
                "consumedAt": FieldValue.serverTimestamp()
            ]) { error in
                if let error = error {
                    print("Error marking event as consumed: \(error)")
                } else {
                    print("✅ Event marked as consumed: \(documentId)")
                }
            }
    }
    
    // MARK: - Cleanup
    
    func stopListening() {
        contactImportListener?.remove()
        calendarListener?.remove()
    }
}
```

### 5. Usage in Your App
```swift
class AppCoordinator: ObservableObject {
    private let eventListener = EventListener()
    
    func startEventListening() {
        // Get the current user ID from your auth system
        let userId = getCurrentUserId() // Your implementation
        eventListener.startListening(for: userId)
    }
    
    func stopEventListening() {
        eventListener.stopListening()
    }
}
```

### 6. App Lifecycle Integration
```swift
@main
struct YourApp: App {
    @StateObject private var appCoordinator = AppCoordinator()
    
    init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onAppear {
                    appCoordinator.startEventListening()
                }
                .onDisappear {
                    appCoordinator.stopEventListening()
                }
        }
    }
}
```

## Firestore Document Structures

### Contact Import Event
**Document ID:** `{userId}_import_contact`
```json
{
  "userId": "user-123",
  "accountId": "account-456",
  "eventType": "import_contact",
  "triggered": true,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Calendar Event
**Document ID:** `{userId}_add_calendar`
```json
{
  "userId": "user-123",
  "accountId": "account-456",
  "eventType": "add_calendar",
  "triggered": true,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Security & Authentication

**Important:** This implementation does NOT use Firebase Authentication. The iOS app connects to Firestore as an unauthenticated client.

- ✅ **Read access:** Allowed for AccountEvents collection
- ✅ **Write access:** Only from backend (Admin SDK)
- ✅ **Security:** Document IDs require knowing exact userId
- ✅ **Privacy:** No sensitive data stored in event documents

## Testing

### Contact Import Flow:
1. **Web app:** Go to `/people` → Click "Import From Contacts"
2. **iOS app:** Should receive event and trigger contact import
3. **Firestore:** Document marked as consumed

### Calendar Flow:
1. **Web app:** Go to `/calendars` → Click "Add Calendar"
2. **iOS app:** Should receive event and show calendar options
3. **Firestore:** Document marked as consumed

## Firebase Configuration

### Environment Variables

The web app uses a dedicated Firebase environment variable for flexibility:

- **`NEXT_PUBLIC_FIREBASE_ENV`** - Controls which Firebase project to use
  - `dev` (default) - Uses `eeva-dev` Firebase project
  - `prod` - Uses `eeva-prod` Firebase project

**Note:** This variable is primarily for pre-v2 release flexibility. Since the iOS app and backend API are not yet production-ready, we need a way to dynamically point the production-ready web experience to either dev or prod Firebase environments during development and testing phases.

### Firebase Projects

- **Development:** `eeva-dev` project
- **Production:** `eeva-prod` project
- **Collection:** `AccountEvents`
- **Document patterns:**
  - `{userId}_import_contact`
  - `{userId}_add_calendar`

### Deployment Configuration Examples

| Deployment Type | NEXT_PUBLIC_FIREBASE_ENV | Firebase Project Used |
|----------------|-------------------------|---------------------|
| Local Development | `dev` | `eeva-dev` |
| Vercel Preview | `dev` | `eeva-dev` |
| Vercel Production (pre-v2) | `dev` or `prod` | Configurable |
| Vercel Production (post-v2) | `prod` | `eeva-prod` |

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow unauthenticated read access to AccountEvents
    match /AccountEvents/{documentId} {
      // Allow read access to documents that follow the userId_eventType pattern
      allow read: if documentId.matches('.*_import_contact$') || 
                     documentId.matches('.*_add_calendar$');
      
      // Only allow write access from server (Admin SDK bypasses this anyway)
      allow write: if false;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

This implementation handles both contact import and calendar integration events triggered from the web app! 🚀
