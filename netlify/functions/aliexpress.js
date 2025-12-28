const crypto = require("crypto");

exports.handler = async (event, context) => {
  try {
    const APP_KEY = process.env.ALI_APP_KEY;
    const APP_SECRET = process.env.ALI_APP_SECRET;

    const keyword =
      (event.queryStringParameters && event.queryStringParameters.keyword) ||
      "tech";

    const params = {
      app_key: APP_KEY,
      method: "aliexpress.affiliate.product.query",
      timestamp: Date.now(),
      sign_method: "sha256",
      fields:
        "product_title,product_main_image_url,product_detail_url,app_sale_price",
      keywords: keyword
    };

    const sorted = Object.keys(params)
      .sort()
      .map(k => `${k}${params[k]}`)
      .join("");

    const sign = crypto
      .createHash("sha256")
      .update(APP_SECRET + sorted + APP_SECRET)
      .digest("hex");

    const body = new URLSearchParams({ ...params, sign });

    const response = await fetch("https://api.aliexpress.com/sync", {
      method: "POST",
      body
    });

    const text = await response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
