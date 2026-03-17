import axios from "axios";

export const sendOtpEmail = async ({ name, email, otp }) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS server configuration is incomplete.");
  }

  if (!email || !String(email).trim()) {
    throw new Error("Recipient email is required.");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const templateParams = {
    to_email: normalizedEmail,
    email: normalizedEmail,
    user_email: normalizedEmail,
    to: normalizedEmail,
    user_name: String(name || normalizedEmail).trim(),
    otp: String(otp),
  };

  console.log("[EmailJS] Sending OTP", {
    serviceId,
    templateId,
    templateParams,
  });

  const response = await axios.post(
    "https://api.emailjs.com/api/v1.0/email/send",
    {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("[EmailJS] OTP send response", {
    status: response.status,
    data: response.data,
  });

  return response.data;
};
