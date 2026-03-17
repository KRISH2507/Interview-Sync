import axios from "axios";

export const sendOtpEmail = async ({ name, email, otp }) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      "EmailJS server configuration is incomplete. Required: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY."
    );
  }

  if (!email || !String(email).trim()) {
    throw new Error("Recipient email is required.");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name || normalizedEmail).trim();
  const normalizedOtp = String(otp || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Recipient email format is invalid.");
  }

  if (!/^\d{4,8}$/.test(normalizedOtp)) {
    throw new Error("OTP format is invalid.");
  }

  const templateParams = {
    to_email: normalizedEmail,
    email: normalizedEmail,
    user_email: normalizedEmail,
    to: normalizedEmail,
    user_name: normalizedName,
    otp: normalizedOtp,
  };

  console.log("[EmailJS] Sending OTP", {
    serviceId,
    templateId,
    to_email: templateParams.to_email,
    strictMode: Boolean(privateKey),
  });

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  try {
    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        timeout: 15000,
      }
    );

    console.log("[EmailJS] OTP send response", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const responseBody = error?.response?.data;
    const rawMessage =
      (typeof responseBody === "string" && responseBody) ||
      responseBody?.message ||
      error?.message ||
      "EmailJS request failed";
    const isSecurityBlock =
      String(rawMessage).includes("non-browser environments") ||
      String(rawMessage).includes("API access from non-browser environments");

    console.error("[EmailJS] OTP send failed", {
      status,
      message: rawMessage,
      response: responseBody,
      to_email: normalizedEmail,
      serviceId,
      templateId,
    });

    throw new Error(
      `[EmailJS] ${status || "NO_STATUS"}: ${rawMessage}${
        isSecurityBlock
          ? " | Enable EmailJS server API access in Account > Security and allow your localhost + deployed domains."
          : ""
      }`
    );
  }
};
