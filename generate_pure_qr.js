import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/rowlandanafu/.gemini/antigravity/brain/d2c9fed0-536d-438c-a90d-6d5d0730edd6';
const OUTPUT_SVG = path.join(ARTIFACT_DIR, 'shiftly_app_test_qr.svg');
const OUTPUT_FLYER_SVG = path.join(ARTIFACT_DIR, 'shiftly_tester_invitation_card.svg');
const LOCAL_SVG = path.join(process.cwd(), 'shiftly_app_test_qr.svg');

// Pure JavaScript QR Code Generator Implementation
function generateQRMatrix(text) {
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
      this.dataList.push(new QR8bitByte(data));
      this.dataCache = null;
    },
    isDark: function(row, col) {
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

  var qr = new QRCodeModel(4, 0); // Type 4, Level M
  qr.addData(text);
  qr.make();
  return qr;
}

// Generate Standalone Vector SVG QR Badge
function buildSquareQRBadgeSVG(url) {
  const qr = generateQRMatrix(url);
  const count = qr.getModuleCount();
  const size = 600;
  const padding = 50;
  const qrSize = size - (padding * 2);
  const cellSize = qrSize / count;

  let rects = '';
  // Avoid placing dots in the center where the logo badge sits
  const centerStart = Math.floor(count / 2) - 2;
  const centerEnd = Math.floor(count / 2) + 2;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
          // Leave clean window for central S logo badge
          continue;
        }
        const x = padding + (c * cellSize);
        const y = padding + (r * cellSize);
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="2" fill="#09090b"/>\n`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 920" width="800" height="920" style="background:#ffffff; font-family:'Plus Jakarta Sans', -apple-system, sans-serif;">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0052ff" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0052ff"/>
    </linearGradient>
  </defs>

  <!-- Background Card -->
  <rect x="0" y="0" width="800" height="920" rx="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Brand Header -->
  <g transform="translate(60, 48)">
    <rect width="52" height="52" rx="16" fill="url(#blueGrad)"/>
    <text x="26" y="36" fill="#ffffff" font-size="28" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">S</text>
    <text x="68" y="38" fill="#09090b" font-size="34" font-weight="900" letter-spacing="-1px">Shiftly<tspan fill="#0052ff">.</tspan></text>
    <rect x="540" y="8" width="140" height="34" rx="17" fill="#eff6ff"/>
    <text x="610" y="30" fill="#0052ff" font-size="13" font-weight="800" text-anchor="middle">LIVE TEST APP</text>
  </g>

  <!-- QR Frame Container -->
  <g transform="translate(100, 130)">
    <rect width="600" height="600" rx="36" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#shadow)"/>
    
    <!-- Matrix Rectangles -->
    ${rects}

    <!-- Center Logo Shield -->
    <g transform="translate(250, 250)">
      <rect width="100" height="100" rx="28" fill="#ffffff"/>
      <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#blueGrad)"/>
      <text x="50" y="62" fill="#ffffff" font-size="46" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">S</text>
    </g>
  </g>

  <!-- Bottom Action Card -->
  <g transform="translate(100, 760)" text-anchor="middle">
    <text x="300" y="36" fill="#09090b" font-size="24" font-weight="900" letter-spacing="-0.5px">Scan with Camera to Test App</text>
    <text x="300" y="66" fill="#64748b" font-size="16" font-weight="600">Instant On-Demand Moving &amp; AI Cargo Scanner</text>
    
    <rect x="150" y="86" width="300" height="38" rx="19" fill="#09090b"/>
    <text x="300" y="110" fill="#ffffff" font-size="13" font-weight="800" letter-spacing="0.5px">📱 OPEN CAMERA OR SCANNER</text>
  </g>
</svg>`;

  return svg;
}

// Generate Full Testing Invitation Poster SVG
function buildTesterFlyerSVG(url) {
  const qr = generateQRMatrix(url);
  const count = qr.getModuleCount();
  const size = 360;
  const padding = 20;
  const qrSize = size - (padding * 2);
  const cellSize = qrSize / count;

  let rects = '';
  const centerStart = Math.floor(count / 2) - 2;
  const centerEnd = Math.floor(count / 2) + 2;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) continue;
        const x = padding + (c * cellSize);
        const y = padding + (r * cellSize);
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="1.5" fill="#09090b"/>\n`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200" style="background:#09090b; font-family:'Plus Jakarta Sans', -apple-system, sans-serif;">
  <defs>
    <radialGradient id="glow1" cx="20%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#0052ff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="80%" r="60%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#0052ff"/>
    </linearGradient>
    <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#0052ff" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background Gradients -->
  <rect width="900" height="1200" fill="#09090b"/>
  <rect width="900" height="1200" fill="url(#glow1)"/>
  <rect width="900" height="1200" fill="url(#glow2)"/>

  <!-- VIP Badge -->
  <g transform="translate(450, 70)" text-anchor="middle">
    <rect x="-110" y="0" width="220" height="38" rx="19" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="0" y="24" fill="#60a5fa" font-size="13" font-weight="800" letter-spacing="1.5px">✨ VIP TESTER ACCESS</text>
  </g>

  <!-- Title & Headline -->
  <g transform="translate(450, 160)" text-anchor="middle">
    <text x="0" y="0" fill="#ffffff" font-size="44" font-weight="900" letter-spacing="-1.5px">Experience the Future of Moving</text>
    <text x="0" y="48" fill="url(#textGrad)" font-size="44" font-weight="900" letter-spacing="-1.5px">with Shiftly</text>
    <text x="0" y="94" fill="#94a3b8" font-size="17" font-weight="600">Scan below with your iPhone or Android to test the live app instantly.</text>
  </g>

  <!-- Center QR Card -->
  <g transform="translate(270, 310)">
    <rect width="360" height="420" rx="36" fill="#ffffff" filter="url(#boxShadow)"/>
    
    <!-- QR Matrix -->
    <g transform="translate(0, 10)">
      ${rects}
      <!-- Center S Logo -->
      <g transform="translate(145, 145)">
        <rect width="70" height="70" rx="20" fill="#ffffff"/>
        <rect x="6" y="6" width="58" height="58" rx="16" fill="#0052ff"/>
        <text x="35" y="46" fill="#ffffff" font-size="34" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">S</text>
      </g>
    </g>

    <!-- Scan Instruction -->
    <text x="180" y="392" fill="#09090b" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1px">SCAN WITH iOS CAMERA OR ANDROID</text>
  </g>

  <!-- 3 Testing Steps -->
  <g transform="translate(80, 800)">
    <!-- Step 1 -->
    <g transform="translate(0, 0)">
      <rect width="230" height="180" rx="24" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
      <rect x="20" y="20" width="36" height="36" rx="12" fill="#0052ff"/>
      <text x="38" y="44" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle">1</text>
      <text x="20" y="86" fill="#ffffff" font-size="17" font-weight="800">Scan QR Code</text>
      <text x="20" y="112" fill="#94a3b8" font-size="13" font-weight="600">Point phone camera</text>
      <text x="20" y="132" fill="#94a3b8" font-size="13" font-weight="600">at the code above.</text>
    </g>

    <!-- Step 2 -->
    <g transform="translate(255, 0)">
      <rect width="230" height="180" rx="24" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
      <rect x="20" y="20" width="36" height="36" rx="12" fill="#0052ff"/>
      <text x="38" y="44" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle">2</text>
      <text x="20" y="86" fill="#ffffff" font-size="17" font-weight="800">Test AI Scanner</text>
      <text x="20" y="112" fill="#94a3b8" font-size="13" font-weight="600">Snap any furniture to</text>
      <text x="20" y="132" fill="#94a3b8" font-size="13" font-weight="600">measure mass &amp; size.</text>
    </g>

    <!-- Step 3 -->
    <g transform="translate(510, 0)">
      <rect width="230" height="180" rx="24" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
      <rect x="20" y="20" width="36" height="36" rx="12" fill="#0052ff"/>
      <text x="38" y="44" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle">3</text>
      <text x="20" y="86" fill="#ffffff" font-size="17" font-weight="800">Experience Pay</text>
      <text x="20" y="112" fill="#94a3b8" font-size="13" font-weight="600">Try Face ID, Cards &amp;</text>
      <text x="20" y="132" fill="#94a3b8" font-size="13" font-weight="600">live mover radar.</text>
    </g>
  </g>

  <!-- Footer -->
  <g transform="translate(80, 1080)">
    <line x1="0" y1="0" x2="740" y2="0" stroke="#27272a" stroke-width="1"/>
    <text x="0" y="40" fill="#64748b" font-size="14" font-weight="700">🚀 Built for iOS &amp; Android</text>
    <text x="370" y="40" fill="#64748b" font-size="14" font-weight="700" text-anchor="middle">shiftly.app • @shiftly.app</text>
    <text x="740" y="40" fill="#64748b" font-size="14" font-weight="700" text-anchor="end">🔒 256-bit Encrypted</text>
  </g>
</svg>`;

  return svg;
}

function main() {
  const offlineUrl = "http://192.168.1.126:5173";
  console.log("Generating Offline Local Wi-Fi QR assets for:", offlineUrl);

  const qrSquareSvg = buildSquareQRBadgeSVG(offlineUrl);
  fs.writeFileSync(OUTPUT_SVG, qrSquareSvg);
  fs.writeFileSync(LOCAL_SVG, qrSquareSvg);

  const offlineSpecificSvg = path.join(ARTIFACT_DIR, 'shiftly_offline_test_qr.svg');
  fs.writeFileSync(offlineSpecificSvg, qrSquareSvg);
  console.log("✅ Generated Offline QR Badge SVG:", OUTPUT_SVG);

  const flyerSvg = buildTesterFlyerSVG(offlineUrl);
  fs.writeFileSync(OUTPUT_FLYER_SVG, flyerSvg);

  const offlineFlyerSvg = path.join(ARTIFACT_DIR, 'shiftly_offline_tester_card.svg');
  fs.writeFileSync(offlineFlyerSvg, flyerSvg);
  console.log("✅ Generated Offline VIP Tester Card SVG:", OUTPUT_FLYER_SVG);
}

main();
