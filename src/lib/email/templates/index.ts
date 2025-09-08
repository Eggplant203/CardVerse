export const passwordChangedTemplate = (username: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header h1 {
      color: #6366f1;
      margin: 0;
    }
    .content {
      padding: 20px 0;
    }
    .alert {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 4px;
      padding: 12px;
      margin: 20px 0;
    }
    .alert h3 {
      color: #92400e;
      margin: 0 0 8px 0;
    }
    .alert p {
      color: #78350f;
      margin: 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🃏 CardVerse</h1>
    </div>
    <div class="content">
      <p>Hello ${username},</p>
      <p>Your CardVerse account password has been successfully changed.</p>
      
      <div class="alert">
        <h3>Security Notice</h3>
        <p>If you did not make this change, please contact our support team immediately and consider changing your password again.</p>
      </div>
      
      <p>For your security, we recommend:</p>
      <ul>
        <li>Using a strong, unique password</li>
        <li>Regularly monitoring your account activity</li>
      </ul>
      
      <p>If you have any questions or concerns, please don't hesitate to contact our support team by replying to this email.</p>
      
      <p>Thanks,<br>The CardVerse Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EGGPLANT STUDIO. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const resetPasswordTemplate = (username: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header h1 {
      color: #6366f1;
      margin: 0;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #6366f1;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4f46e5;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🃏 CardVerse</h1>
    </div>
    <div class="content">
      <p>Hello ${username},</p>
      <p>We received a request to reset your CardVerse account password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below. This link will expire in 24 hours.</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 12px;">${resetLink}</p>
      <p>Thanks,<br>The CardVerse Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EGGPLANT STUDIO. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const welcomeTemplate = (username: string, verifyLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CardVerse</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header h1 {
      color: #6366f1;
      margin: 0;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #6366f1;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4f46e5;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🃏 CardVerse</h1>
    </div>
    <div class="content">
      <p>Welcome to CardVerse, ${username}!</p>
      <p>Thank you for joining our community of card game enthusiasts. With CardVerse, you can create custom cards, build decks, and challenge other players.</p>
      <p>To verify your email address, please click the button below:</p>
      <div style="text-align: center;">
        <a href="${verifyLink}" class="button">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 12px;">${verifyLink}</p>
      <p>Ready to get started? Here are a few things you can do:</p>
      <ul>
        <li>Create your first custom card</li>
        <li>Build a deck with your cards</li>
        <li>Challenge other players to a battle</li>
      </ul>
      <p>Thanks,<br>The CardVerse Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EGGPLANT STUDIO. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
