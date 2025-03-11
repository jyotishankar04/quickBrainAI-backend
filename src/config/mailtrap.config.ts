import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import _env from "./envConfig";

const TOKEN = _env.MAILTRAP_TOKEN;

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN as string,
  })
);

const sender = {
  address: "quickbrainAI@devsuvam.xyz",
  name: "QuickBrainAI",
};

// transport
//   .sendMail({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  category = "QuickBrainAI temp",
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
  category?: string;
}) => {
  let recipients: string[] = [];
  if (typeof to === "string") {
    recipients = [to];
  } else {
    recipients = to;
  }
  console.log("Sending email to:", recipients);
  try {
    const response = await transport.sendMail({
      from: sender,
      to: recipients,
      subject,
      text,
      html,
      category: category || "QuickBrainAI temp",
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export { sendEmail };
