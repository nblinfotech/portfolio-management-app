const { sendEmail, renderTemplate } = require('./mailSender');

/**
 * assemble html layout for email
 *
 * @param {string} headerContent
 * @param {string} userName
 * @param {string} content
 * @returns {string}
 */
const assembleLayout = (headerContent, userName, content) => {
  const header = `<div><h1>${headerContent}</h1></div>`;
  const subHeading = `<b>Dear ${userName},</b>`;
  const footer = `<div>Regard aegis</div>`;

  return `${headerContent ? header : ''}
  ${subHeading}
  ${content}
  ${footer} `;
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token, name) => {
  try {
    const link = `${process.env.TENANT_URL}/reset-password?token=${token}`;
    const variables = { token, name, link };
    const { subject, content } = await renderTemplate('reset_password', variables);

    const param = { to };

    await sendEmail({
      senderEmail: process.env.EMAIL_FROM,
      senderName: process.env.EMAIL_FROM_NAME,
      recipientName: to,
      recipientEmail: to,
      subject: subject,
      htmlContent: content,

      // htmlContent: assembleLayout(subject, name || 'user', htmlContent),
      params: param,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * send set password email
 *
 * @async
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendSetPasswordEmail = async (to, token, name) => {
  try {
    const link = `${process.env.TENANT_URL}/set-password?token=${token}`;
    const variables = { token, name, link };
    const { subject, content } = await renderTemplate('set_password', variables);

    const param = { to };

    await sendEmail({
      senderEmail: process.env.EMAIL_FROM,
      senderName: process.env.EMAIL_FROM_NAME,
      recipientName: to,
      recipientEmail: to,
      subject: subject,
      htmlContent: content,
      // htmlContent: assembleLayout(subject, name || 'user', htmlContent),
      params: param,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token, name) => {
  try {
    const link = `${process.env.CORE_URL}/verify-email?token=${token}`;

    const variables = { token, name, link };
    const { subject, content } = await renderTemplate('email_verification', variables);

    const param = { to };

    await sendEmail({
      senderEmail: process.env.EMAIL_FROM,
      senderName: process.env.EMAIL_FROM_NAME,
      recipientName: to,
      recipientEmail: to,
      subject: subject,
      // htmlContent: assembleLayout(subject, name || 'user', htmlContent),
      htmlContent: content,
      params: param,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * send otp for login
 *
 * @async
 * @param {string} to
 * @param {string} otp
 * @param {string} name
 * @returns {promise}
 */
const sendOtp = async (to, otp, name) => {
  try {
    const variables = { otp, name };
    const { subject, content } = await renderTemplate('login_otp', variables);
    const param = { to };

    await sendEmail({
      senderEmail: process.env.EMAIL_FROM,
      senderName: process.env.EMAIL_FROM_NAME,
      recipientName: to,
      recipientEmail: to,
      subject: subject,
      // htmlContent: assembleLayout(subject, name || 'user', htmlContent),
      htmlContent: content,
      params: param,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * send failed login email
 *
 * @async
 * @param {string} to
 * @param {string} otp
 * @param {string} name
 * @returns {promise}
 */
const sendLoginFailedEmail = async (to, name) => {
  try {
    const variables = { name};
    const { subject, content } = await renderTemplate('failed_login', variables);
    const param = { to };

    await sendEmail({
      senderEmail: process.env.EMAIL_FROM,
      senderName: process.env.EMAIL_FROM_NAME,
      recipientName: to,
      recipientEmail: to,
      subject: subject,
      // htmlContent: assembleLayout(subject, name || 'user', htmlContent),
      htmlContent: content,
      params: param,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendResetPasswordSuccessEmail = async (to, name) => {
  try {
    const variables = { name};
    const { subject, content } = await renderTemplate('reset_password_success', variables);
    const param = { to };

    await sendEmail({
      senderEmail: process.env.EMAIL_FROM,
      senderName: process.env.EMAIL_FROM_NAME,
      recipientName: to,
      recipientEmail: to,
      subject: subject,
      // htmlContent: assembleLayout(subject, name || 'user', htmlContent),
      htmlContent: content,
      params: param,
    });
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendOtp,
  sendSetPasswordEmail,
  sendLoginFailedEmail,
  sendResetPasswordSuccessEmail
};
