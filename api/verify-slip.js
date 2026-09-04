// Vercel Serverless Function: Secure Slip Verification Proxy
// Keeps Slip2Go API Secret Key 100% on the server side (never exposed to browser client)

export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Pre-flight check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    const { imageBase64, expectedAmount } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาส่งรูปภาพสลิปที่ถูกต้อง (Base64 DataURL)'
      });
    }

    // Read Secret Key safely from server environment variables
    const apiKey = process.env.SLIP2GO_API_KEY || 'EwX99Tg_lRWs0SVPGnKlM4NN3j21CY3o1b_XFLkoUBE=';
    const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;

    const slip2goPayload = {
      payload: {
        imageBase64,
        checkCondition: {
          checkDuplicate: true
        }
      }
    };

    const upstreamResponse = await fetch('https://connect.slip2go.com/api/verify-slip/qr-base64/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(slip2goPayload)
    });

    const resData = await upstreamResponse.json();

    // Success code 200000 = Slip found
    if (resData.code === '200000' && resData.data) {
      const bankData = resData.data;
      const verifiedAmount = parseFloat(bankData.amount) || 0;

      return res.status(200).json({
        success: true,
        code: '200000',
        message: 'Slip verified successfully',
        data: {
          referenceId: bankData.referenceId,
          transRef: bankData.transRef || bankData.referenceId,
          amount: verifiedAmount,
          dateTime: bankData.dateTime,
          senderName: bankData.sender?.account?.name || bankData.sender?.name || 'ลูกค้าทั่วไป',
          receiverName: bankData.receiver?.account?.name || bankData.receiver?.name || '',
          bankName: bankData.receiver?.bank?.name || bankData.receiver?.bank || ''
        }
      });
    }

    // Slip is fake / no QR found
    if (resData.code === '200500') {
      return res.status(200).json({
        success: false,
        code: '200500',
        error: 'สลิปไม่ถูกต้อง หรือไม่พบ QR Code ในสลิป กรุณาแนบภาพสลิปที่คมชัด'
      });
    }

    // Duplicate slip
    if (resData.code === '200300' || resData.message?.toLowerCase().includes('duplicate')) {
      return res.status(200).json({
        success: false,
        code: '200300',
        error: 'สลิปนี้ถูกนำมาใช้เติมเงินในระบบไปแล้ว (สลิปซ้ำ)'
      });
    }

    // Token mismatch or configuration issue
    if (resData.code === '401001') {
      return res.status(200).json({
        success: false,
        code: '401001',
        error: 'ระบบเซิร์ฟเวอร์ยังไม่ได้ตั้งค่า API Key ที่ถูกต้อง'
      });
    }

    return res.status(200).json({
      success: false,
      code: resData.code || 'UNKNOWN_ERROR',
      error: resData.message || 'การตรวจสอบสลิปล้มเหลว กรุณาลองใหม่อีกครั้ง'
    });

  } catch (error) {
    console.error('Serverless verify-slip error:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบตรวจสอบสลิป'
    });
  }
}
