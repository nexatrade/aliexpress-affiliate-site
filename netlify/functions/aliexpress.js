const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const keyword = event.queryStringParameters.keyword || "tech";

    const appKey = process.env.ALI_APP_KEY;
    const appSecret = process.env.ALI_APP_SECRET;

    if (!appKey || !appSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing AliExpress API credentials" })
      };
    }

    const params = {
      app_key: appKey,
      method: "aliexpress.affiliate.product.query",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      sign_method: "md5",
      format: "json",
      v: "2.0",
      keywords: keyword
    };

    const sortedKeys = Object.keys(params).sort();
    let signString = appSecret;

    sortedKeys.forEach((key) => {
      signString += key + params[key];
    });

    signString += appSecret;

    const sign = crypto.createHash("md5").update(signString).digest("hex").toUpperCase();

    const query = new URLSearchParams({ ...params, sign }).toString();
    const url = `https://api.aliexpress.com/sync?${query}`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
