# Hosting Setup Guide

TitanBlade Games uses multiple hosting platforms to ensure maximum availability and redundancy.

## 🌐 Primary Hosting: GitHub Pages

**Main Website & Games:**
- **URL**: https://sunstar2423.github.io/titanblade-games/
- **Cost**: 100% Free
- **Features**: Automatic HTTPS, Global CDN, Git integration
- **Deployment**: Automatic on every push to main branch

### Game URLs:
- **Main Site**: https://sunstar2423.github.io/titanblade-games/
- **Battle of the Druids**: https://sunstar2423.github.io/titanblade-games/battle-of-the-druids/
- **Isle of Adventure**: https://sunstar2423.github.io/titanblade-games/isle-of-adventure/
- **Doom Riders**: https://sunstar2423.github.io/titanblade-games/doom-riders/

## ☁️ Backup Hosting: AWS S3

**Legacy/Backup Deployment:**
- **URL**: http://battle-of-the-druids-web.s3-website-ap-southeast-2.amazonaws.com/
- **Cost**: ~$1-5/month
- **Features**: CloudFront CDN, Custom domain support
- **Deployment**: Manual trigger or weekly backup

## 🚀 Deployment Workflows

### GitHub Pages (Primary)
```yaml
# .github/workflows/pages.yml
- Triggers: Every push to main branch
- Process: Build → Environment variable injection → Deploy
- Time: ~2-3 minutes
- Status: ✅ Active
```

### AWS S3 (Backup)
```yaml
# .github/workflows/deploy.yml  
- Triggers: Manual or weekly schedule
- Process: Build → S3 sync → CloudFront invalidation
- Time: ~3-5 minutes
- Status: 🔄 Backup/Legacy
```

## 🔧 Environment Variables

Both hosting platforms use the same environment variable system:

| Variable | GitHub Pages | AWS S3 | Source |
|----------|--------------|--------|--------|
| `GOOGLE_ANALYTICS_ID` | ✅ | ✅ | GitHub Secrets |
| `SITE_URL` | Auto-detected | Set in secrets | GitHub Secrets |
| `CONTACT_EMAIL` | ✅ | ✅ | GitHub Secrets |

## 📊 Benefits of Dual Hosting

### GitHub Pages Benefits:
- ✅ **Free hosting** - Zero cost
- ✅ **Automatic deployment** - No manual intervention
- ✅ **Open source friendly** - Perfect for public repositories
- ✅ **Built-in SSL** - HTTPS by default
- ✅ **Git integration** - Deploy directly from repository

### AWS S3 Benefits:
- ✅ **Redundancy** - Backup if GitHub Pages has issues
- ✅ **Custom domain** - Can use titanbladegames.com
- ✅ **CloudFront** - Advanced CDN features
- ✅ **Legacy support** - Existing links continue to work

## 🎯 Recommended Usage

**For Development:**
```bash
# Test locally
python3 -m http.server 8000
# or
npx serve .
```

**For Production:**
1. **Push to main branch** → Automatic GitHub Pages deployment
2. **Manual backup** → Trigger AWS S3 workflow if needed
3. **Custom domain** → Point to GitHub Pages for free hosting

## 🔗 URL Migration Strategy

### Current Status:
- **Primary**: GitHub Pages (new)
- **Legacy**: AWS S3 (existing users)
- **Transition**: Gradual migration of links

### Update Links:
```markdown
# Old AWS S3 URLs
http://battle-of-the-druids-web.s3-website-ap-southeast-2.amazonaws.com/

# New GitHub Pages URLs  
https://sunstar2423.github.io/titanblade-games/
```

## 📈 Performance Comparison

| Metric | GitHub Pages | AWS S3 |
|--------|--------------|--------|
| **Load Time** | ~1-2s | ~1-3s |
| **Global CDN** | ✅ Built-in | ✅ CloudFront |
| **SSL/HTTPS** | ✅ Free | ✅ Included |
| **Uptime** | 99.9%+ | 99.9%+ |
| **Cost** | $0 | ~$1-5/month |

## 🛠️ Troubleshooting

### GitHub Pages Issues:
```bash
# Check deployment status
gh workflow list --repo sunstar2423/titanblade-games

# View logs
gh run list --workflow=pages.yml --repo sunstar2423/titanblade-games
```

### AWS S3 Issues:
```bash
# Manual deployment
gh workflow run deploy.yml --repo sunstar2423/titanblade-games

# Check S3 sync
aws s3 ls s3://battle-of-the-druids-web/
```

### Environment Variables:
```bash
# Verify placeholders are replaced
grep -r "{{.*}}" . --include="*.html"

# Should return no results after build
```

## 🔄 Migration Timeline

1. **Phase 1** (Current): Dual hosting active
2. **Phase 2** (Next month): Update all documentation to GitHub Pages URLs
3. **Phase 3** (Future): Consider custom domain on GitHub Pages
4. **Phase 4** (Later): Potentially phase out AWS S3 to save costs

## 🌟 Custom Domain Setup (Optional)

To use `titanbladegames.com` with GitHub Pages:

1. **Add CNAME file** to repository root:
   ```
   titanbladegames.com
   ```

2. **Update DNS records**:
   ```
   Type: CNAME
   Name: www
   Value: sunstar2423.github.io
   
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

3. **Enable in GitHub repository settings**

---

**Result**: Free, reliable, globally distributed hosting for all TitanBlade Games! 🎮✨