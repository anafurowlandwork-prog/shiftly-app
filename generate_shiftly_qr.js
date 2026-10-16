import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/rowlandanafu/.gemini/antigravity/brain/d2c9fed0-536d-438c-a90d-6d5d0730edd6';
const OUTPUT_PNG = path.join(ARTIFACT_DIR, 'shiftly_app_test_qr.png');
const OUTPUT_FLYER_PNG = path.join(ARTIFACT_DIR, 'shiftly_tester_invitation_card.png');
const LOCAL_PNG = path.join(process.cwd(), 'shiftly_app_test_qr.png');

// Find Chrome binary on macOS
function getChromePath() {
  const paths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shiftly QR Generator</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Inter:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #09090b;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    /* Standalone High-Res QR Card */
    .qr-badge-card {
      width: 720px;
      height: 720px;
      background: #ffffff;
      border-radius: 48px;
      padding: 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
      position: relative;
    }

    .qr-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: #0052ff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 26px;
      box-shadow: 0 8px 20px rgba(0, 82, 255, 0.35);
    }

    .brand-title {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: -0.04em;
      color: #09090b;
    }

    .brand-title span {
      color: #0052ff;
    }

    .qr-canvas-wrapper {
      position: relative;
      width: 460px;
      height: 460px;
      background: #ffffff;
      padding: 18px;
      border-radius: 32px;
      border: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 82, 255, 0.08);
    }

    canvas {
      width: 420px;
      height: 420px;
      border-radius: 18px;
    }

    .qr-center-logo {
      position: absolute;
      width: 76px;
      height: 76px;
      background: #0052ff;
      border: 5px solid #ffffff;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 32px;
      font-weight: 900;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    }

    .qr-footer {
      text-align: center;
      margin-top: 8px;
    }

    .qr-footer h2 {
      font-size: 22px;
      font-weight: 800;
      color: #09090b;
      margin-bottom: 4px;
    }

    .qr-footer p {
      font-size: 15px;
      font-weight: 600;
      color: #64748b;
    }

    .scan-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #eff6ff;
      color: #0052ff;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 20px;
      margin-top: 8px;
    }

    /* Testing Invitation Flyer (1080 x 1350 Instagram / Print Poster format) */
    .tester-flyer {
      width: 900px;
      height: 1200px;
      background: #09090b;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(0, 82, 255, 0.22) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.18) 0%, transparent 40%);
      border-radius: 40px;
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8);
      position: relative;
      overflow: hidden;
      margin-top: 60px;
    }

    .flyer-badge {
      background: rgba(0, 82, 255, 0.15);
      border: 1px solid rgba(0, 82, 255, 0.4);
      color: #60a5fa;
      font-size: 14px;
      font-weight: 800;
      padding: 8px 20px;
      border-radius: 30px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .flyer-header {
      text-align: center;
      margin-top: 10px;
    }

    .flyer-header h1 {
      font-size: 46px;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 12px;
    }

    .flyer-header h1 span {
      background: linear-gradient(135deg, #60a5fa 0%, #0052ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .flyer-header p {
      font-size: 18px;
      color: #94a3b8;
      max-width: 600px;
      line-height: 1.5;
      margin: 0 auto;
    }

    .flyer-qr-box {
      background: #ffffff;
      padding: 30px;
      border-radius: 36px;
      box-shadow: 0 20px 50px rgba(0, 82, 255, 0.35);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .flyer-qr-box canvas {
      width: 340px;
      height: 340px;
    }

    .flyer-steps {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      width: 100%;
      margin-top: 10px;
    }

    .step-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 18px 16px;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #0052ff;
      color: #ffffff;
      font-weight: 900;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px auto;
    }

    .step-card h4 {
      font-size: 15px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 4px;
    }

    .step-card p {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.4;
    }

    .flyer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 20px;
      font-size: 14px;
      color: #64748b;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- STANDALONE SQUARE QR CARD -->
  <div class="qr-badge-card" id="qr-card">
    <div class="qr-header">
      <div class="logo-icon">S</div>
      <div class="brand-title">Shiftly<span>.</span></div>
    </div>

    <div class="qr-canvas-wrapper">
      <canvas id="qr1"></canvas>
      <div class="qr-center-logo">S</div>
    </div>

    <div class="qr-footer">
      <h2>Scan to Test Shiftly App</h2>
      <p>Instant On-Demand Moving & AI Cargo Estimation</p>
      <div class="scan-pill">📱 Open Camera to Scan Instantly</div>
    </div>
  </div>

  <!-- TESTING INVITATION POSTER / FLYER -->
  <div class="tester-flyer" id="tester-flyer">
    <div class="flyer-badge">
      <span>✨</span> VIP Beta Testing Access
    </div>

    <div class="flyer-header">
      <h1>Experience the Future of Moving with <span>Shiftly</span></h1>
      <p>Scan the QR code with your phone to test the live app, try the AI Vision Room Scanner, and explore instant mover dispatch.</p>
    </div>

    <div class="flyer-qr-box">
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <canvas id="qr2"></canvas>
        <div class="qr-center-logo" style="width: 64px; height: 64px; font-size: 26px; border-radius: 16px;">S</div>
      </div>
      <span style="font-size: 13px; font-weight: 800; color: #09090b; letter-spacing: 0.02em;">
        SCAN WITH iOS CAMERA OR ANDROID
      </span>
    </div>

    <div class="flyer-steps">
      <div class="step-card">
        <div class="step-num">1</div>
        <h4>Scan QR Code</h4>
        <p>Point your mobile camera directly at the code above</p>
      </div>
      <div class="step-card">
        <div class="step-num">2</div>
        <h4>Test AI Scanner</h4>
        <p>Snap a photo of your furniture to detect mass & volume</p>
      </div>
      <div class="step-card">
        <div class="step-num">3</div>
        <h4>Share Feedback</h4>
        <p>Experience sub-second Apple Pay & real-time mover radar</p>
      </div>
    </div>

    <div class="flyer-footer">
      <span>🚀 Built for iOS & Android</span>
      <span>shiftly.app • @shiftly.app</span>
      <span>🔒 256-bit Secure</span>
    </div>
  </div>

  <!-- Pure JS Standalone QR Matrix Generator -->
  <script>
    // QR Code Generator implementation in pure JS
    var QRCodeLib = (function() {
      // Standard QR Polynomial and Error Correction tables
      function QR8bitByte(data) {
        this.mode = 4;
        this.data = data;
      }
      QR8bitByte.prototype = {
        getLength: function() { return this.data.length; },
        write: function(buffer) {
          for (var i = 0; i < this.data.length; i++) {
            buffer.put(this.data.charCodeAt(i), 8);
          }
        }
      };

      function QRCodeModel(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
      }

      QRCodeModel.prototype = {
        addData: function(data) {
          var newData = new QR8bitByte(data);
          this.dataList.push(newData);
          this.dataCache = null;
        },
        isDark: function(row, col) {
          if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error(row + "," + col);
          }
          return this.modules[row][col];
        },
        getModuleCount: function() { return this.moduleCount; },
        make: function() {
          this.makeImpl(false, this.getBestMaskPattern());
        },
        makeImpl: function(test, maskPattern) {
          this.moduleCount = this.typeNumber * 4 + 17;
          this.modules = new Array(this.moduleCount);
          for (var row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (var col = 0; col < this.moduleCount; col++) {
              this.modules[row][col] = null;
            }
          }
          this.setupPositionProbePattern(0, 0);
          this.setupPositionProbePattern(this.moduleCount - 7, 0);
          this.setupPositionProbePattern(0, this.moduleCount - 7);
          this.setupTimingPattern();
          this.setupPositionAdjustPattern();
          this.setupTypeInfo(test, maskPattern);
          if (this.typeNumber >= 7) this.setupTypeNumber(test);
          if (this.dataCache == null) {
            this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
          }
          this.mapData(this.dataCache, maskPattern);
        },
        setupPositionProbePattern: function(row, col) {
          for (var r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r) continue;
            for (var c = -1; c <= 7; c++) {
              if (col + c <= -1 || this.moduleCount <= col + c) continue;
              if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
                  (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
                  (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        },
        getBestMaskPattern: function() {
          var minLostPoint = 0;
          var pattern = 0;
          for (var i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
              minLostPoint = lostPoint;
              pattern = i;
            }
          }
          return pattern;
        },
        setupTimingPattern: function() {
          for (var r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) continue;
            this.modules[r][6] = (r % 2 == 0);
          }
          for (var c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) continue;
            this.modules[6][c] = (c % 2 == 0);
          }
        },
        setupPositionAdjustPattern: function() {
          var pos = QRUtil.getPatternPosition(this.typeNumber);
          for (var i = 0; i < pos.length; i++) {
            for (var j = 0; j < pos.length; j++) {
              var row = pos[i];
              var col = pos[j];
              if (this.modules[row][col] != null) continue;
              for (var r = -2; r <= 2; r++) {
                for (var c = -2; c <= 2; c++) {
                  if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                    this.modules[row + r][col + c] = true;
                  } else {
                    this.modules[row + r][col + c] = false;
                  }
                }
              }
            }
          }
        },
        setupTypeInfo: function(test, maskPattern) {
          var data = (this.errorCorrectLevel << 3) | maskPattern;
          var bits = QRUtil.getBCHTypeInfo(data);
          for (var i = 0; i < 15; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 6) this.modules[i][8] = mod;
            else if (i < 8) this.modules[i + 1][8] = mod;
            else this.modules[this.moduleCount - 15 + i][8] = mod;
          }
          for (var i = 0; i < 15; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod;
            else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
            else this.modules[8][15 - i - 1] = mod;
          }
          this.modules[this.moduleCount - 8][8] = (!test);
        },
        setupTypeNumber: function(test) {
          var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
          for (var i = 0; i < 18; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
          }
          for (var i = 0; i < 18; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
          }
        },
        mapData: function(data, maskPattern) {
          var inc = -1;
          var row = this.moduleCount - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          for (var col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col--;
            while (true) {
              for (var c = 0; c < 2; c++) {
                if (this.modules[row][col - c] == null) {
                  var dark = false;
                  if (byteIndex < data.length) {
                    dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                  }
                  var mask = QRUtil.getMask(maskPattern, row, col - c);
                  if (mask) dark = !dark;
                  this.modules[row][col - c] = dark;
                  bitIndex--;
                  if (bitIndex == -1) {
                    byteIndex++;
                    bitIndex = 7;
                  }
                }
              }
              row += inc;
              if (row < 0 || this.moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        }
      };

      QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
        var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
        var buffer = new QRBitBuffer();
        for (var i = 0; i < dataList.length; i++) {
          var data = dataList[i];
          buffer.put(data.mode, 4);
          buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
          data.write(buffer);
        }
        var totalDataCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
        if (buffer.getLengthInBits() > totalDataCount * 8) {
          throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
        while (buffer.getLengthInBits() % 8 != 0) buffer.putBit(false);
        while (true) {
          if (buffer.getLengthInBits() >= totalDataCount * 8) break;
          buffer.put(0xEC, 8);
          if (buffer.getLengthInBits() >= totalDataCount * 8) break;
          buffer.put(0x11, 8);
        }
        return QRCodeModel.createBytes(buffer, rsBlocks);
      };

      QRCodeModel.createBytes = function(buffer, rsBlocks) {
        var offset = 0;
        var maxDcCount = 0;
        var maxEcCount = 0;
        var dcdata = new Array(rsBlocks.length);
        var ecdata = new Array(rsBlocks.length);
        for (var r = 0; r < rsBlocks.length; r++) {
          var dcCount = rsBlocks[r].dataCount;
          var ecCount = rsBlocks[r].totalCount - dcCount;
          maxDcCount = Math.max(maxDcCount, dcCount);
          maxEcCount = Math.max(maxEcCount, ecCount);
          dcdata[r] = new Array(dcCount);
          for (var i = 0; i < dcdata[r].length; i++) {
            dcdata[r][i] = 0xff & buffer.buffer[i + offset];
          }
          offset += dcCount;
          var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
          var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
          var modPoly = rawPoly.mod(rsPoly);
          ecdata[r] = new Array(rsPoly.getLength() - 1);
          for (var i = 0; i < ecdata[r].length; i++) {
            var modIndex = i + modPoly.getLength() - ecdata[r].length;
            ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
          }
        }
        var totalCodeCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
        var data = new Array(totalCodeCount);
        var index = 0;
        for (var i = 0; i < maxDcCount; i++) {
          for (var r = 0; r < rsBlocks.length; r++) {
            if (i < dcdata[r].length) data[index++] = dcdata[r][i];
          }
        }
        for (var i = 0; i < maxEcCount; i++) {
          for (var r = 0; r < rsBlocks.length; r++) {
            if (i < ecdata[r].length) data[index++] = ecdata[r][i];
          }
        }
        return data;
      };

      var QRMode = { MODE_8BIT_BYTE: 4 };
      var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
      var QRMaskPattern = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 };

      var QRUtil = {
        PATTERN_POSITION_TABLE: [
          [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
          [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54],
          [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70]
        ],
        G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
        G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
        G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
        getBCHTypeInfo: function(data) {
          var d = data << 10;
          while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
          }
          return ((data << 10) | d) ^ QRUtil.G15_MASK;
        },
        getBCHTypeNumber: function(data) {
          var d = data << 12;
          while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
          }
          return (data << 12) | d;
        },
        getBCHDigit: function(data) {
          var digit = 0;
          while (data != 0) {
            digit++;
            data >>>= 1;
          }
          return digit;
        },
        getPatternPosition: function(typeNumber) {
          return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1] || [];
        },
        getMask: function(maskPattern, i, j) {
          switch (maskPattern) {
            case 0: return (i + j) % 2 == 0;
            case 1: return i % 2 == 0;
            case 2: return j % 3 == 0;
            case 3: return (i + j) % 3 == 0;
            case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
            case 5: return (i * j) % 2 + (i * j) % 3 == 0;
            case 6: return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
            case 7: return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
            default: throw new Error("bad maskPattern:" + maskPattern);
          }
        },
        getErrorCorrectPolynomial: function(errorCorrectLength) {
          var a = new QRPolynomial([1], 0);
          for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
          }
          return a;
        },
        getLengthInBits: function(mode, type) {
          if (1 <= type && type < 10) return 8;
          else if (type < 27) return 16;
          else return 16;
        },
        getLostPoint: function(qrCode) {
          var moduleCount = qrCode.getModuleCount();
          var lostPoint = 0;
          for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
              var sameCount = 0;
              var dark = qrCode.isDark(row, col);
              for (var r = -1; r <= 1; r++) {
                if (row + r < 0 || moduleCount <= row + r) continue;
                for (var c = -1; c <= 1; c++) {
                  if (col + c < 0 || moduleCount <= col + c) continue;
                  if (r == 0 && c == 0) continue;
                  if (dark == qrCode.isDark(row + r, col + c)) sameCount++;
                }
              }
              if (sameCount > 5) lostPoint += (3 + sameCount - 5);
            }
          }
          return lostPoint;
        }
      };

      var QRMath = {
        glog: function(n) {
          if (n < 1) throw new Error("glog(" + n + ")");
          return QRMath.LOG_TABLE[n];
        },
        gexp: function(n) {
          while (n < 0) n += 255;
          while (n >= 256) n -= 255;
          return QRMath.EXP_TABLE[n];
        },
        EXP_TABLE: new Array(256),
        LOG_TABLE: new Array(256)
      };

      for (var i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
      for (var i = 8; i < 256; i++) QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
      for (var i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

      function QRPolynomial(num, shift) {
        if (num.length == undefined) throw new Error(num.length + "/" + shift);
        var offset = 0;
        while (offset < num.length && num[offset] == 0) offset++;
        this.num = new Array(num.length - offset + shift);
        for (var i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
      }

      QRPolynomial.prototype = {
        get: function(index) { return this.num[index]; },
        getLength: function() { return this.num.length; },
        multiply: function(e) {
          var num = new Array(this.getLength() + e.getLength() - 1);
          for (var i = 0; i < this.getLength(); i++) {
            for (var j = 0; j < e.getLength(); j++) {
              num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
            }
          }
          return new QRPolynomial(num, 0);
        },
        mod: function(e) {
          if (this.getLength() - e.getLength() < 0) return this;
          var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
          var num = new Array(this.getLength());
          for (var i = 0; i < this.getLength(); i++) num[i] = this.get(i);
          for (var i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
          }
          return new QRPolynomial(num, 0).mod(e);
        }
      };

      function QRRSBlock(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
      }
      QRRSBlock.RS_BLOCK_TABLE = [
        [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
        [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
        [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
        [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9]
      ];
      QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
        var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock == undefined) throw new Error("bad rs block");
        var length = rsBlock.length / 3;
        var list = [];
        for (var i = 0; i < length; i++) {
          var count = rsBlock[i * 3 + 0];
          var totalCount = rsBlock[i * 3 + 1];
          var dataCount = rsBlock[i * 3 + 2];
          for (var j = 0; j < count; j++) list.push(new QRRSBlock(totalCount, dataCount));
        }
        return list;
      };
      QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
        switch (errorCorrectLevel) {
          case 1: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
          case 0: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
          case 3: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
          case 2: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
          default: return undefined;
        }
      };

      function QRBitBuffer() {
        this.buffer = [];
        this.length = 0;
      }
      QRBitBuffer.prototype = {
        get: function(index) {
          var bufIndex = Math.floor(index / 8);
          return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
        },
        put: function(num, length) {
          for (var i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) == 1);
        },
        getLengthInBits: function() { return this.length; },
        putBit: function(bit) {
          var bufIndex = Math.floor(this.length / 8);
          if (this.buffer.length <= bufIndex) this.buffer.push(0);
          if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
          this.length++;
        }
      };

      return {
        create: function(text, typeNumber, errorLevel) {
          var qr = new QRCodeModel(typeNumber || 4, errorLevel !== undefined ? errorLevel : 0);
          qr.addData(text);
          qr.make();
          return qr;
        }
      };
    })();

    // Render QR matrix onto HTML5 canvas with custom styling
    function renderQRToCanvas(canvasId, text, size) {
      var canvas = document.getElementById(canvasId);
      var ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;

      var qr = QRCodeLib.create(text, 4, 0); // Type 4, Level M
      var count = qr.getModuleCount();
      var cellSize = size / count;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Dark modules with subtle rounded aesthetic
      ctx.fillStyle = '#09090b';
      for (var r = 0; r < count; r++) {
        for (var c = 0; c < count; c++) {
          if (qr.isDark(r, c)) {
            var x = c * cellSize;
            var y = r * cellSize;
            // Draw clean crisp pixel
            ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(cellSize), Math.ceil(cellSize));
          }
        }
      }
    }

    window.onload = function() {
      var testUrl = "https://shiftly-app.vercel.app";
      renderQRToCanvas('qr1', testUrl, 420);
      renderQRToCanvas('qr2', testUrl, 340);
    };
  </script>
</body>
</html>
`;

async function main() {
  const chromePath = getChromePath();
  if (!chromePath) {
    console.error('Google Chrome not found on macOS.');
    process.exit(1);
  }

  console.log('Launching browser with Chrome:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 2400, deviceScaleFactor: 2 });

  const tempHtmlPath = path.join(ARTIFACT_DIR, 'temp_qr_render.html');
  fs.writeFileSync(tempHtmlPath, htmlContent);
  await page.goto('file://' + tempHtmlPath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 1: Square QR Card
  const qrCardElement = await page.$('#qr-card');
  if (qrCardElement) {
    await qrCardElement.screenshot({ path: OUTPUT_PNG, omitBackground: false });
    fs.copyFileSync(OUTPUT_PNG, LOCAL_PNG);
    console.log('✅ Generated Square QR Card:', OUTPUT_PNG);
  }

  // Screenshot 2: VIP Tester Invitation Poster
  const flyerElement = await page.$('#tester-flyer');
  if (flyerElement) {
    await flyerElement.screenshot({ path: OUTPUT_FLYER_PNG, omitBackground: false });
    console.log('✅ Generated VIP Tester Invitation Card:', OUTPUT_FLYER_PNG);
  }

  await browser.close();
  try { fs.unlinkSync(tempHtmlPath); } catch(e) {}
}

main().catch(err => {
  console.error('Error generating QR:', err);
  process.exit(1);
});
