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

  // Handle GET or POST with safe body parsing
  let parsedBody = req.body;
  if (typeof parsedBody === 'string') {
    try { parsedBody = JSON.parse(parsedBody); } catch (e) {}
  }

  const emailParam = req.method === 'POST' ? parsedBody?.email : req.query?.email;
  const searchParam = req.method === 'POST' ? parsedBody?.search : req.query?.search;
  const pageParam = parseInt(req.method === 'POST' ? parsedBody?.page : req.query?.page) || 1;
  const sizeParam = parseInt(req.method === 'POST' ? parsedBody?.size : req.query?.size) || 40;

  const rawEmail = (emailParam || '').trim().toLowerCase();

  if (!rawEmail || !rawEmail.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'กรุณาระบุที่อยู่อีเมลที่ถูกต้อง (เช่น example@rdcw.plus)'
    });
  }

  const apiKey = process.env.MAILY_API_KEY || 'sk_v1_phbofy2tb4gvtmsq4g7nw1ywmmwv6c9p';

  // Smart variant resolution for common OCR / typing confusion (0 vs o, 1 vs l)
  const variants = [rawEmail];
  const [localPart, domainPart] = rawEmail.split('@');
  if (localPart && domainPart) {
    if (localPart.includes('o')) variants.push(localPart.replace(/o/g, '0') + '@' + domainPart);
    if (localPart.includes('0')) variants.push(localPart.replace(/0/g, 'o') + '@' + domainPart);
    if (localPart.includes('l')) variants.push(localPart.replace(/l/g, '1') + '@' + domainPart);
    if (localPart.includes('1')) variants.push(localPart.replace(/1/g, 'l') + '@' + domainPart);
    if (localPart.includes('o') && localPart.includes('l')) {
      variants.push(localPart.replace(/o/g, '0').replace(/l/g, '1') + '@' + domainPart);
    }
  }

  try {
    let lastMails = [];
    let lastResData = null;
    let resolvedEmail = rawEmail;

    // Try all smart variants
    for (const testEmail of [...new Set(variants)]) {
      const mailyPayload = {
        apiKey,
        email: testEmail,
        size: Math.min(sizeParam, 100),
        page: pageParam
      };
      if (searchParam && searchParam.trim()) {
        mailyPayload.search = searchParam.trim();
      }

      const upstreamResponse = await fetch('https://api.maily.space/v1/mails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(mailyPayload)
      });

      const textData = await upstreamResponse.text();
      let resData = null;
      try {
        resData = JSON.parse(textData);
      } catch (e) {
        console.error('Non-JSON response from Maily Space:', textData?.slice(0, 200));
      }

      lastResData = resData;
      const mailList = Array.isArray(resData?.data?.mails)
        ? resData.data.mails
        : (Array.isArray(resData?.mails) ? resData.mails : []);

      if (mailList.length > 0) {
        lastMails = mailList;
        resolvedEmail = testEmail;
        break;
      }
    }

    // If mails were found in any variant
    if (lastMails.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'v1_api',
        resolvedEmail,
        totalPage: lastResData?.data?.totalPage || lastResData?.totalPage || 1,
        currentPage: lastResData?.data?.currentPage || lastResData?.currentPage || pageParam,
        mails: lastMails
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
