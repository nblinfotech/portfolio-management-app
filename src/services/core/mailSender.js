const axios = require('axios');
const MarkdownIt = require('markdown-it');
const { showOneEmailTemplateByType } = require('./email.template.service');

const sendEmail = async ({
  senderEmail,
  senderName,
  recipientName,
  recipientEmail,
  subject,
  htmlContent,
  templateId = null,
  params,
}) => {
  console.log('sending email to aegisinfo2025@gmail.com');
  const data = JSON.stringify({
    sender: {
      email: senderEmail,
      name: senderName,
    },
    to: [
      {
        name: recipientName,
        email: 'aegisinfo2025@gmail.com',
      },
    ],
    subject: `Recipient for ${recipientEmail}`,
    htmlContent,
    templateId,
    params,
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.brevo.com/v3/smtp/email',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    data,
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Template manager

const assembleLayout = (headerContent, userName, content) => {
  const header = `<div><h1>${headerContent}</h1></div>`;
  const subHeading = `<b>Dear ${userName},</b>`;
  const footer = `<div>Regards, Aegis</div>`;

  return `${headerContent ? header : ''}
  ${subHeading}
  ${content}
  ${footer}`;
};

const renderTemplate = async (templateType, variables) => {
  try {
    const md = new MarkdownIt();
    const result = await showOneEmailTemplateByType(templateType);
    console.log('result', result);
    if (!result || !result.content) {
      throw new Error(`Template with Type ${templateType} not found or content is missing`);
    }

    const templateContent = result.content;
    const templateSubject = result.subject;

    const content = md.render(
      templateContent
        .replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || '')
        .replace(/<\/?[^>]+>/g, (match) => (match.startsWith('<') ? match : ''))
    );
    const assembledContent = assembleLayout(templateSubject, variables.name || 'User', content);

    return { subject: templateSubject, content: assembledContent };
  } catch (error) {
    console.error('Error rendering template:', error.message);
    throw error;
  }
};

module.exports = {
  sendEmail, renderTemplate
};