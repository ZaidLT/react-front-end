# Mobile deeplink pass-through changes (eeva://)

This document summarizes the code changes that update mobile app deeplink generation so that all current URL query parameters are passed through to the eeva:// links. This ensures mobile app context (e.g., mobile, token, contactId, associationId/associationType, etc.) is preserved when handing off from the web UI to the mobile app.

## What changed

- **Goal**: Include all current page query parameters in each deeplink to eeva://create/{note|task|document|event} and make mobile deeplink logic mirror web URL logic exactly.
- **Modified components**:
  - src/components/PillDetailsNote.tsx
  - src/components/PillDetailsTask.tsx
  - src/components/PillDetailDocs.tsx
  - src/components/PillDetailEvent.tsx (empty-state button)
- **Key improvements**:
  1. **Removed fragile conditional logic**: Previously deeplinks only worked if `isMobileApp && someId` was true. Now deeplinks work whenever `isMobileApp` is true, regardless of ID availability.
  2. **Mirror web parameter logic**: Mobile deeplinks now use the same parameter name logic as web URLs (`delegateUserId`, `contactId`, or `tileId` based on `entityType`).
  3. **Preserve all URL parameters**: All current URL query parameters are passed through to the deeplink.
  4. **Enhanced debugging**: Debug logs show the complete deeplink and all parameters when `NEXT_PUBLIC_DEBUG_MODE=true`.

This preserves existing query parameters such as `mobile`, `token`, `contactId`, `delegateUserId`, `associationId`, `associationType`, etc.

## Before vs After (example)

- Current page URL: `/my-hive?mobile=true&token=abc123&contactId=456`
- Member/tile context: `memberId = 123`, `name = "Property Tax"`, `entityType = "contact"`

**Before (fragile logic)**:
```
// Only worked if both isMobileApp && memberId were true
if (isMobileApp && memberId) {
  eeva://create/note?tileId=123&name=Property%20Tax  // Missing URL params!
}
```

**After (robust logic)**:
```
// Works whenever isMobileApp is true, mirrors web parameter logic
if (isMobileApp) {
  eeva://create/note?contactId=123&name=Property%20Tax&mobile=true&token=abc123
}
```

**Key improvements**:
- Uses `contactId` instead of `tileId` (matches web logic for `entityType = "contact"`)
- Preserves all URL parameters (`mobile`, `token`, etc.)
- Works even if `memberId` is undefined (still passes through other params)

## Implementation details

**Common pattern across all components**:
```javascript
const tileName = sanitizeNameParam(searchParams.get('name') || '');
const paramName = entityType === 'user' ? 'delegateUserId' :
                 entityType === 'contact' ? 'contactId' : 'tileId';

if (isMobileApp) {
  // Start with current URL parameters to preserve context
  const currentParams = new URLSearchParams(window.location.search);
  // Set the main parameter (delegateUserId, contactId, or tileId)
  if (idValue) {
    currentParams.set(paramName, idValue);
  }
  // Add name if available
  if (tileName) currentParams.set('name', tileName);
  const deeplink = `eeva://create/{type}?${currentParams.toString()}`;
  window.location.href = deeplink;
} else {
  router.push(`/create-{type}?${paramName}=${idValue}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
}
```

**Component-specific details**:
- **Notes (PillDetailsNote.tsx)**: Uses `memberId` as the ID value
- **Tasks (PillDetailsTask.tsx)**: Uses `actualTileId` as the ID value
- **Documents (PillDetailDocs.tsx)**: Uses `homeMemberId` as the ID value
- **Events (PillDetailEvent.tsx)**: Uses `memberId` as the ID value

**Key changes from previous implementation**:
1. **Removed conditional ID checks**: No longer requires `&& actualTileId` or `&& memberId` - deeplink works as long as `isMobileApp` is true
2. **Dynamic parameter names**: Uses `paramName` logic to match web behavior (`delegateUserId`, `contactId`, or `tileId`)
3. **Graceful ID handling**: If ID is undefined, still passes through other URL parameters

## Debugging

- Set `NEXT_PUBLIC_DEBUG_MODE=true` (e.g., in your `.env.local`).
- On deeplink click in a mobile context, the console will show:
  - `📱 Opening mobile deeplink (with passthrough params): <final_deeplink_string>`
  - An array of `[key, value]` entries for the deeplink query params

## How to test

1. Start the app and navigate to a page that renders one of the PillDetail components (Notes / Tasks / Docs / Events).
2. Add query params to the current URL, for example:
   - `?mobile=true&token=abc123&contactId=456&associationId=789&associationType=contact`
3. Ensure you're in a mobile app/WebView context (or simulate with the `mobile=true` param).
4. Click the corresponding "Add new …" button.
5. With `NEXT_PUBLIC_DEBUG_MODE=true`, verify the console output matches expectations:
   - The deeplink starts with `eeva://create/{note|task|document|event}`
   - Includes `tileId` and optionally `name`
   - Contains all existing page query parameters (e.g., `mobile`, `token`, `contactId`, `associationId`, `associationType`, etc.)
6. Verify the deeplink activates the mobile app correctly and that the parameters are received.

## Notes & caveats

- URL encoding is safely handled by `URLSearchParams`.
- If the current URL already contains `tileId` or `name`, these are overwritten to the correct context-specific values so the mobile app receives consistent identifiers.
- No changes were made to non-deeplink code paths except for adding the debug log.

## Files touched (for quick review)

- src/components/PillDetailsNote.tsx
- src/components/PillDetailsTask.tsx
- src/components/PillDetailDocs.tsx
- src/components/PillDetailEvent.tsx

## Rollback plan

If you need to revert, replace each deeplink generation block back to the previous pattern:

```
const deeplink = `eeva://create/<type>?tileId=${id}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
```

…and remove the `URLSearchParams` logic and the enhanced debug log lines.

