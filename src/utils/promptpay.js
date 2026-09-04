// Official EMVCo PromptPay Payload & QR Generator
// Supports Phone Numbers (10 digits), Citizen ID / Tax ID (13 digits), and e-Wallets (15 digits)

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(targetId = '0812345678', amount = 0) {
  const cleaned = (targetId || '0812345678').toString().replace(/[^0-9]/g, '');
  let formattedTarget = '';
  let targetType = '01'; // 01 for mobile phone, 02 for citizen ID / Tax ID, 03 for e-wallet

  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Thai Mobile: 08x-xxx-xxxx -> 00668xxxxxxxx
    formattedTarget = '0066' + cleaned.substring(1);
    targetType = '01';
  } else if (cleaned.length === 13) {
    // Citizen ID or Tax ID
    formattedTarget = cleaned;
    targetType = '02';
  } else if (cleaned.length === 15) {
    // e-Wallet ID
    formattedTarget = cleaned;
    targetType = '03';
  } else {
    formattedTarget = cleaned.padStart(13, '0');
    targetType = '01';
  }

  const pointOfInitiation = amount && parseFloat(amount) > 0 ? '12' : '11';
  const merchantInfo = tlv('00', 'A000000677010111') + tlv(targetType, formattedTarget);

  let payload =
    tlv('00', '01') +
    tlv('01', pointOfInitiation) +
    tlv('29', merchantInfo) +
    tlv('53', '764'); // THB currency code

  const numAmount = parseFloat(amount) || 0;
  if (numAmount > 0) {
    payload += tlv('54', numAmount.toFixed(2));
  }

  payload += tlv('58', 'TH'); // Country code
  payload += '6304';
  const checksum = crc16(payload);
  return payload + checksum;
}

export function getPromptPayQrUrl(targetId = '0812345678', amount = 0) {
  const payload = generatePromptPayPayload(targetId, amount);
  // High-res (320x320), margin 16px quiet-zone, ECC M for instant mobile banking recognition
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=16&ecc=M&data=${encodeURIComponent(payload)}`;
}

export function getFallbackQrUrl(targetId = '0812345678', amount = 0) {
  const cleaned = (targetId || '0812345678').toString().replace(/[^0-9]/g, '');
  const numAmount = parseFloat(amount) || 0;
  if (numAmount > 0) {
    return `https://promptpay.io/${cleaned}/${numAmount.toFixed(2)}.png`;
  }
  return `https://promptpay.io/${cleaned}.png`;
}
