// Vercel Serverless Function: Secure Maily Space OTP Proxy
// Keeps Maily Space API Secret Key 100% on the server side (never exposed to client browser)

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET or POST
  const emailParam = req.method === 'POST' ? req.body?.email : req.query?.email;
  const searchParam = req.method === 'POST' ? req.body?.search : req.query?.search;
  const pageParam = parseInt(req.method === 'POST' ? req.body?.page : req.query?.page) || 1;
  const sizeParam = parseInt(req.method === 'POST' ? req.body?.size : req.query?.size) || 40;

  const rawEmail = (emailParam || '').trim().toLowerCase();

  if (!rawEmail || !rawEmail.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'กรุณาระบุที่อยู่อีเมลที่ถูกต้อง (เช่น example@rdcw.plus)'
    });
  }

  const apiKey = process.env.MAILY_API_KEY || 'sk_v1_phbofy2tb4gvtmsq4g7nw1ywmmwv6c9p';

  try {
    // 1. Try official Maily Space REST API POST /v1/mails
    const mailyPayload = {
      apiKey,
      email: rawEmail,
      size: Math.min(sizeParam, 100),
      page: pageParam
    };
    if (searchParam && searchParam.trim()) {
      mailyPayload.search = searchParam.trim();
    }

    const upstreamResponse = await fetch('https://api.maily.space/v1/mails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mailyPayload)
    });

    const resData = await upstreamResponse.json();

    // If REST API succeeded and returned mails
    if (upstreamResponse.ok && resData && Array.isArray(resData.mails)) {
      return res.status(200).json({
        success: true,
        source: 'v1_api',
        totalPage: resData.totalPage || 1,
        currentPage: resData.currentPage || pageParam,
        mails: resData.mails
      });
    }

    // 2. Fallback: Public Mailbox API if REST API returns "อีเมลไม่ถูกต้อง" or 404
    const [accountName, domainPart] = rawEmail.split('@');
    if (accountName && domainPart) {
      const domainId = domainPart.replace(/\./g, '');
      const queryParams = new URLSearchParams({
        accountName: accountName.toLowerCase(),
        domainId: domainId.toLowerCase(),
        size: String(Math.min(sizeParam, 100))
      });
      if (searchParam && searchParam.trim()) {
        queryParams.set('search', searchParam.trim());
      }

      const publicUrl = `https://api.maily.space/mail/public/mails?${queryParams.toString()}`;
      const pubRes = await fetch(publicUrl);

      if (pubRes.ok) {
        const pubData = await pubRes.json();
        const mailList = Array.isArray(pubData) ? pubData : (pubData?.data || pubData?.mails || []);
        
        return res.status(200).json({
          success: true,
          source: 'public_mailbox',
          totalPage: 1,
          currentPage: pageParam,
          mails: mailList.map(m => ({
            id: m.id || `mail-${Math.random().toString(36).substr(2, 9)}`,
            from: m.from || m.sender || 'ไม่ระบุผู้ส่ง',
            to: rawEmail,
            subject: m.subject || '(ไม่มีหัวข้อ)',
            html: m.html || '',
            text: m.text || m.body || '',
            createdAt: m.createdAt || m.date || new Date().toISOString()
          }))
        });
      }
    }

    // If both failed, return a friendly message based on upstream response
    const errorMessage = resData?.message || 'ไม่พบกล่องข้อความของอีเมลนี้ หรือยังไม่มีข้อความส่งเข้ามา';
    return res.status(200).json({
      success: true,
      mails: [],
      warning: errorMessage,
      message: 'ยังไม่มีข้อความเข้าในกล่องจดหมายนี้'
    });

  } catch (error) {
    console.error('Error fetching OTP from Maily Space:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อไปยังเซิร์ฟเวอร์ Maily Space'
    });
  }
}
