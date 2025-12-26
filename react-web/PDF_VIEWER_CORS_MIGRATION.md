# PDF Viewer CORS Migration Guide

## Current State (Temporary Solution)

### What Was Implemented

We've implemented a **temporary file proxy** to work around CORS restrictions from Google Cloud Storage (GCS) and Azure Blob Storage. This solution allows the PDF viewer to function immediately but adds unnecessary server load and latency.

**Current Architecture:**
```
User Browser
    ↓ (requests PDF)
Next.js App (/api/file-proxy)
    ↓ (fetches file)
Google Cloud Storage / Azure Blob
    ↓ (returns file)
Next.js App
    ↓ (forwards file with CORS headers)
User Browser (renders in @react-pdf-viewer)
```

### Files Modified

1. **`src/app/api/file-proxy/route.ts`** (NEW - renamed from pdf-proxy)
   - Proxies file requests from GCS/Azure Blob Storage
   - Supports PDFs, images, and other document types
   - Adds CORS headers
   - **⚠️ TO BE REMOVED after infrastructure upgrade**

2. **`src/components/DocumentPreview/PDFDocumentPreview.tsx`**
   - Uses `/api/file-proxy?url=...` for PDF files
   - **⚠️ TO BE MODIFIED after infrastructure upgrade**

### Why This Is Temporary

**Problems with the proxy approach:**
- ❌ **Double bandwidth**: PDF data flows through your server unnecessarily
- ❌ **Increased latency**: Two hops instead of one direct connection
- ❌ **Server load**: Every PDF view hits your Next.js server
- ❌ **Cost**: More egress bandwidth from your server
- ❌ **Scalability**: Proxy becomes bottleneck for large PDFs or many users

---

## Infrastructure Upgrade Required

### Google Cloud Storage CORS Configuration

You need to configure your GCS bucket to allow direct browser access from your domains.

### 1. **Identify Your GCS Bucket**

Your PDF URLs look like:
```
https://storage.googleapis.com/eeva-files-dev/1760044400000-pdf-test.pdf?...
```

**Bucket name:** `eeva-files-dev`

You likely have multiple buckets:
- `eeva-files-dev` (development)
- `eeva-files-staging` (staging - if you have one)
- `eeva-files-prod` (production)

### 2. **Required CORS Configuration**

Apply this CORS configuration to **each bucket**:

```json
[
  {
    "origin": [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://dev.eeva.app",
      "https://eeva.app",
      "https://www.eeva.app"
    ],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Content-Range"],
    "maxAgeSeconds": 3600
  }
]
```

**Customize the `origin` array** with your actual domains:
- Add all localhost ports you use for development
- Add your staging environment URL(s)
- Add your production domain(s)
- Add any preview/deployment URLs (e.g., Vercel preview branches)

### 3. **How to Apply CORS Configuration**

#### **Option A: Using `gsutil` (Command Line)**

```bash
# Create a cors.json file with the configuration above
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3001", "https://eeva.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Content-Range"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply to development bucket
gsutil cors set cors.json gs://eeva-files-dev

# Apply to production bucket
gsutil cors set cors.json gs://eeva-files-prod

# Verify it was applied
gsutil cors get gs://eeva-files-dev
```

#### **Option B: Using Google Cloud Console (Web UI)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Storage** → **Buckets**
3. Click on your bucket (e.g., `eeva-files-dev`)
4. Go to the **Permissions** tab
5. Scroll down to **CORS configuration**
6. Click **Edit CORS configuration**
7. Paste the JSON configuration above
8. Save

#### **Option C: Using Terraform (Infrastructure as Code)**

If you manage infrastructure with Terraform:

```hcl
resource "google_storage_bucket" "files" {
  name     = "eeva-files-dev"
  location = "US"

  cors {
    origin          = ["http://localhost:3001", "https://eeva.app"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type", "Content-Length", "Content-Range"]
    max_age_seconds = 3600
  }
}
```

### 4. **Testing CORS Configuration**

After applying, test it:

```bash
# Should return CORS headers
curl -I -H "Origin: http://localhost:3001" \
  "https://storage.googleapis.com/eeva-files-dev/your-test-file.pdf"

# Look for these headers in the response:
# Access-Control-Allow-Origin: http://localhost:3001
# Access-Control-Allow-Methods: GET, HEAD
```

Or test in browser console:
```javascript
fetch('https://storage.googleapis.com/eeva-files-dev/test.pdf', {
  method: 'HEAD',
  mode: 'cors'
}).then(r => console.log('CORS works!', r.headers))
```

---

## Development Best Practices

### Using a Local Domain Name (Recommended)

Instead of `localhost:3001`, use a proper local domain for development:

#### **Benefits:**
- ✅ More realistic CORS testing
- ✅ Consistent cookie behavior
- ✅ Easier debugging
- ✅ Matches production setup better

#### **Setup:**

**1. Edit your `/etc/hosts` file:**
```bash
sudo nano /etc/hosts
```

**2. Add this line:**
```
127.0.0.1  dev.eeva.local
```

**3. Update your Next.js dev script in `package.json`:**
```json
{
  "scripts": {
    "debug": "lsof -ti tcp:3001 | xargs kill -9 || true && PORT=3001 HOST=dev.eeva.local next dev"
  }
}
```

**4. Access your app at:**
```
http://dev.eeva.local:3001
```

**5. Update CORS config to include:**
```json
"origin": ["http://dev.eeva.local:3001", ...]
```

#### **Alternative: Use mkcert for HTTPS**

For even better dev/prod parity:

```bash
# Install mkcert
brew install mkcert  # macOS
# or: choco install mkcert  # Windows
# or: sudo apt install mkcert  # Linux

# Create local CA
mkcert -install

# Generate certificates
mkcert dev.eeva.local

# Use with Next.js (requires custom server or configuration)
```

---

## Migration Steps (After Infrastructure Upgrade)

Once GCS CORS is configured, follow these steps to remove the proxy:

### Step 1: Verify CORS Works

Test that PDFs load directly without proxy:

```javascript
// In browser console on your app
fetch('https://storage.googleapis.com/eeva-files-dev/test.pdf')
  .then(r => console.log('Direct access works!', r.status))
  .catch(e => console.error('CORS still broken:', e))
```

### Step 2: Update PDFDocumentPreview Component

**File:** `src/components/DocumentPreview/PDFDocumentPreview.tsx`

**Remove these lines:**
```typescript
// Use file proxy for PDFs to avoid CORS issues
// Note: Signed URLs bypass auth but NOT CORS - GCS bucket needs CORS config
// See PDF_VIEWER_CORS_MIGRATION.md for infrastructure changes needed
const pdfProxyUrl = `/api/file-proxy?url=${encodeURIComponent(fileUrl)}`;
```

**Change the Viewer to use direct URL:**
```typescript
// Before:
<Viewer fileUrl={pdfProxyUrl} />

// After:
<Viewer fileUrl={fileUrl} />
```

### Step 3: Delete the Proxy API Route

**Delete this file entirely:**
```bash
rm src/app/api/file-proxy/route.ts
```

### Step 4: Test Thoroughly

1. **Development environment:**
   - Test with local domain (e.g., `dev.eeva.local:3001`)
   - Verify PDFs load without errors
   - Check browser console for CORS errors

2. **Staging environment:**
   - Deploy to staging
   - Test PDF viewing
   - Monitor for CORS issues

3. **Production:**
   - Deploy to production
   - Monitor error logs
   - Test with real user PDFs

### Step 5: Monitor Performance

After migration, you should see:
- ✅ **Faster PDF load times** (no proxy hop)
- ✅ **Reduced server load** (no proxy bandwidth)
- ✅ **Lower latency** (direct GCS → browser)

**Metrics to track:**
- Average PDF load time (should decrease by 200-500ms)
- Server CPU/memory usage (should decrease slightly)
- Network egress from your server (should decrease significantly)

---

## Troubleshooting

### Issue: CORS errors still appear after configuration

**Check:**
1. Did you apply CORS to the correct bucket?
2. Did you include the exact origin (including protocol and port)?
3. Did you wait for propagation? (Can take a few minutes)
4. Is the browser caching old CORS settings? (Hard refresh: Cmd+Shift+R)

**Solution:**
```bash
# Verify CORS is applied
gsutil cors get gs://eeva-files-dev

# Re-apply if needed
gsutil cors set cors.json gs://eeva-files-dev
```

### Issue: "Signed URLs" don't work with CORS

Signed URLs from GCS **do work** with CORS - the signature is in the query parameters and doesn't interfere with CORS headers.

**If they don't work:**
- Ensure CORS is applied to the bucket
- Check that signature hasn't expired
- Verify the origin is in the CORS allowlist

### Issue: Works in dev but not production

**Check:**
- Did you add production domain to CORS `origin` list?
- Did you apply CORS to production bucket?
- Is production using different bucket than dev?

---

## Rollback Plan

If direct access doesn't work after removing proxy:

### Quick Rollback (Restore Proxy)

```bash
# Restore from git
git checkout HEAD -- src/components/DocumentPreview/PDFDocumentPreview.tsx
git checkout HEAD -- src/app/api/file-proxy/route.ts

# Redeploy
```

### Long-term: Fix CORS and retry

---

## Security Considerations

### CORS Origin Allowlist

**Recommended approach:**
```json
"origin": [
  "http://localhost:3001",
  "http://dev.eeva.local:3001",
  "https://dev.eeva.app",
  "https://staging.eeva.app",
  "https://eeva.app",
  "https://www.eeva.app"
]
```

**⚠️ DO NOT use wildcards in production:**
```json
// ❌ DON'T DO THIS:
"origin": ["*"]  // Allows ANY website to fetch your PDFs
```

**Why?** Wildcards expose your files to any website, enabling:
- Hotlinking (other sites embedding your PDFs)
- Data scraping
- Unauthorized access

### Alternative: Keep Proxy for Sensitive Files

If some PDFs contain sensitive data and you want extra control:

**Option:** Keep the proxy but make it optional:
```typescript
const usePro xy = isConfidentialPDF(fileUrl);
const pdfUrl = useProxy
  ? `/api/pdf-proxy?url=${encodeURIComponent(fileUrl)}`
  : fileUrl;
```

This gives you flexibility to proxy some files while serving others directly.

---

## Timeline Recommendation

| Phase | Action | Duration | Owner |
|-------|--------|----------|-------|
| **Phase 1** | Apply GCS CORS config | 30 min | DevOps/Backend |
| **Phase 2** | Test CORS in dev environment | 1 hour | Frontend Dev |
| **Phase 3** | Remove proxy code | 30 min | Frontend Dev |
| **Phase 4** | Deploy to staging & test | 1 hour | QA Team |
| **Phase 5** | Deploy to production | 1 hour | DevOps |
| **Phase 6** | Monitor for 1 week | 1 week | Engineering Team |

**Total timeline:** 1-2 days of work + 1 week monitoring

---

## Questions?

If you need help with:
- Applying CORS configuration → Contact DevOps/Infrastructure team
- Testing CORS changes → Use the testing commands in section 4
- Frontend code changes → This document has all the details

---

## References

- [Google Cloud Storage CORS Documentation](https://cloud.google.com/storage/docs/configuring-cors)
- [@react-pdf-viewer Documentation](https://react-pdf-viewer.dev/)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
