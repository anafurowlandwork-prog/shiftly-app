import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = '/Users/rowlandanafu/.gemini/antigravity/brain/d2c9fed0-536d-438c-a90d-6d5d0730edd6';
const PKG_NAME = 'shiftly_official_launch_package';
const pkgDir = path.join(process.cwd(), PKG_NAME);
const pkgDirArtifact = path.join(ARTIFACT_DIR, PKG_NAME);

console.log('📦 Assembling all Shiftly assets into one structured directory...');

// Clean & create directories
fs.rmSync(pkgDir, { recursive: true, force: true });
fs.rmSync(pkgDirArtifact, { recursive: true, force: true });

fs.mkdirSync(path.join(pkgDir, '01_Promo_Videos'), { recursive: true });
fs.mkdirSync(path.join(pkgDir, '02_Official_Soundtrack'), { recursive: true });
fs.mkdirSync(path.join(pkgDir, '03_App_Store_Screenshots_6.7inch'), { recursive: true });
fs.mkdirSync(path.join(pkgDir, '04_Store_Icons_and_Graphics'), { recursive: true });

// 1. Copy Promo Videos
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_coming_soon_demo.mp4'), path.join(pkgDir, '01_Promo_Videos', 'shiftly_promo_1080p.mp4'));
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_coming_soon_demo.avi'), path.join(pkgDir, '01_Promo_Videos', 'shiftly_promo_1080p.avi'));
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_coming_soon_demo.webm'), path.join(pkgDir, '01_Promo_Videos', 'shiftly_promo_1080p.webm'));

// 2. Copy Official Soundtrack
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_soundtrack.mp3'), path.join(pkgDir, '02_Official_Soundtrack', 'shiftly_soundtrack_320kbps.mp3'));
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_soundtrack.wav'), path.join(pkgDir, '02_Official_Soundtrack', 'shiftly_soundtrack_studio_lossless.wav'));
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_soundtrack.m4a'), path.join(pkgDir, '02_Official_Soundtrack', 'shiftly_soundtrack_apple.m4a'));

// 3. Copy App Store Screenshots
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'app_store_6.7_01_real_move_posts.png'), path.join(pkgDir, '03_App_Store_Screenshots_6.7inch', '01_app_store_6.7_move_posts_feed.png'));
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'app_store_6.7_02_ai_vision_inventory.png'), path.join(pkgDir, '03_App_Store_Screenshots_6.7inch', '02_app_store_6.7_ai_vision_inventory.png'));
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'app_store_6.7_03_live_telemetry_gps.png'), path.join(pkgDir, '03_App_Store_Screenshots_6.7inch', '03_app_store_6.7_live_gps_tracking.png'));
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'app_store_6.7_04_driver_shift_radar.png'), path.join(pkgDir, '03_App_Store_Screenshots_6.7inch', '04_app_store_6.7_driver_shift_radar.png'));
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'app_store_6.7_05_verified_shield_policy.png'), path.join(pkgDir, '03_App_Store_Screenshots_6.7inch', '05_app_store_6.7_shiftly_shield_guarantee.png'));

// 4. Copy Icons & Graphics
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'app_store_icon_1024x1024.png'), path.join(pkgDir, '04_Store_Icons_and_Graphics', 'app_store_icon_1024x1024.png'));
fs.copyFileSync(path.join(process.cwd(), 'app_store_assets', 'google_play_feature_graphic_1024x500.png'), path.join(pkgDir, '04_Store_Icons_and_Graphics', 'google_play_feature_graphic_1024x500.png'));
fs.copyFileSync(path.join(ARTIFACT_DIR, 'shiftly_logo_hd.png'), path.join(pkgDir, '04_Store_Icons_and_Graphics', 'shiftly_logo_hd.png'));

// 5. Add README.md Guide
const readmeContent = `# Shiftly — Official Launch & Marketing Asset Package

This folder contains all official marketing, app store submission, video, and audio assets for **Shiftly**.

---

## 📁 Folder Contents

### 1. 01_Promo_Videos
- \`shiftly_promo_1080p.mp4\` — Universal 1080p MP4 (H.264 + AAC) for App Store previews, website, and social media.
- \`shiftly_promo_1080p.avi\` — 1080p High-Bitrate AVI format (MPEG-4 + MP3).
- \`shiftly_promo_1080p.webm\` — 1080p Web-optimized VP8 format.

### 2. 02_Official_Soundtrack
- \`shiftly_soundtrack_320kbps.mp3\` — Warm acoustic Rhodes chord theme (320kbps MP3).
- \`shiftly_soundtrack_studio_lossless.wav\` — Studio master 24-bit 48kHz uncompressed WAV.
- \`shiftly_soundtrack_apple.m4a\` — Apple Core Audio 320kbps AAC.

### 3. 03_App_Store_Screenshots_6.7inch
Exact Apple App Store 6.7" Display resolution (\`1290 x 2796\`) featuring Titanium Burgundy iPhone 18 Pro Max mockups:
- \`01_app_store_6.7_move_posts_feed.png\` — Live Move Posts & Active Orders Feed
- \`02_app_store_6.7_ai_vision_inventory.png\` — AI Vision Room Scanner & Item Bounding Boxes
- \`03_app_store_6.7_live_gps_tracking.png\` — Live GPS Telemetry Radar & Turn-by-Turn Map
- \`04_app_store_6.7_driver_shift_radar.png\` — Driver Partner Shift Radar & Earnings Dashboard
- \`05_app_store_6.7_shiftly_shield_guarantee.png\` — Verified Shiftly Shield $50,000 Guarantee

### 4. 04_Store_Icons_and_Graphics
- \`app_store_icon_1024x1024.png\` — Apple App Store Connect Master Icon (1024x1024 PNG)
- \`google_play_feature_graphic_1024x500.png\` — Google Play Store Feature Graphic Banner (1024x500 PNG)
- \`shiftly_logo_hd.png\` — High-Definition Brand Logo Mark (1024x1024 PNG)
`;

fs.writeFileSync(path.join(pkgDir, 'README.md'), readmeContent);

// Copy directory to artifacts
execSync(`cp -r "${pkgDir}" "${pkgDirArtifact}"`);

// Create ZIP file
const zipPath = path.join(process.cwd(), 'shiftly_official_launch_package.zip');
const zipPathArtifact = path.join(ARTIFACT_DIR, 'shiftly_official_launch_package.zip');

execSync(`zip -r "${zipPath}" "${PKG_NAME}"`);
fs.copyFileSync(zipPath, zipPathArtifact);

console.log('🎉 Successfully created shiftly_official_launch_package folder and ZIP archive!');
