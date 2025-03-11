export const getEmailVerificaionOtpTemplate = (email: string, otp: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickBrainAI - Welcome</title>
    <style>
        :root {
            --bg-color: #f4f7fc;
            --text-color: #2c3e50;
            --container-bg: #ffffff;
            --heading-color: #2a9d8f;
            --otp-color: #e63946;
            --footer-color: #6c757d;
            --link-color: #007bff;
            --shadow-color: rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
            --bg-color: #121212;
            --text-color: #f8f9fa;
            --container-bg: #1e1e1e;
            --heading-color: #00bfa6;
            --otp-color: #ff8787;
            --footer-color: #adb5bd;
            --link-color: #74c0fc;
            --shadow-color: rgba(255, 255, 255, 0.1);
        }

        body {
            font-family: "Inter", sans-serif;
            background-color: var(--bg-color);
            margin: 0;
            padding: 0;
            color: var(--text-color);
            transition: background-color 0.3s, color 0.3s;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: var(--container-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 5px 20px var(--shadow-color);
            text-align: center;
            transition: background-color 0.3s;
        }

        h1 {
            color: var(--heading-color);
            font-size: 30px;
            margin-bottom: 20px;
            transition: color 0.3s;
            font-weight: 600;
        }

        p {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 15px;
        }

        .otp {
            font-size: 26px;
            font-weight: bold;
            color: var(--otp-color);
            background: rgba(230, 57, 70, 0.1);
            padding: 14px 20px;
            border-radius: 10px;
            display: inline-block;
            letter-spacing: 2px;
            transition: color 0.3s;
        }

        .footer {
            font-size: 14px;
            color: var(--footer-color);
            margin-top: 30px;
            transition: color 0.3s;
        }

        .footer a {
            color: var(--link-color);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-color);
            transition: color 0.3s;
        }
    </style>
</head>
<body>
    <button class="theme-toggle" id="themeToggle">&#9788;</button>
    <div class="container">
        <h1>Welcome to QuickBrainAI!</h1>
        <p>Hi there,</p>
        <p>Thank you for joining QuickBrainAI! We're excited to have you on board.</p>
        <p>Here are your account details:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>To complete your registration, please verify your email address using the OTP below:</p>
        <p class="otp">${otp}</p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>
            If you have any questions, feel free to contact our support team at
            <a href="mailto:support@quickbrainai.com">support@quickbrainai.com</a>.
        </p>
        <div class="footer">
            <p>Best regards,<br>The QuickBrainAI Team</p>
            <p>
                <a href="https://www.quickbrainai.com">Visit our website</a> |
                <a href="mailto:support@quickbrainai.com">Contact Support</a>
            </p>
        </div>
    </div>

    <script>
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;
        const currentTheme = localStorage.getItem('theme');

        if (currentTheme) {
            body.dataset.theme = currentTheme;
            updateThemeToggleIcon();
        }

        themeToggle.addEventListener('click', () => {
            if (body.dataset.theme === 'dark' || !body.dataset.theme) {
                body.dataset.theme = 'light';
                localStorage.setItem('theme', 'light');
            } else {
                body.dataset.theme = 'dark';
                localStorage.setItem('theme', 'dark');
            }
            updateThemeToggleIcon();
        });

        function updateThemeToggleIcon() {
            themeToggle.innerHTML = body.dataset.theme === 'dark' ? '&#9728;' : '&#9788;';
        }
    </script>
</body>
</html>
`;
};

export const getWelcomeEmailTemplate = (name: string) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to QuickBrainAI</title>
    <style>
        :root {
            --bg-color: #f4f7fc;
            --text-color: #2c3e50;
            --container-bg: #ffffff;
            --heading-color: #2a9d8f;
            --footer-color: #6c757d;
            --link-color: #007bff;
            --shadow-color: rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
            --bg-color: #1e1e2e;
            --text-color: #e0e0e0;
            --container-bg: #2a2a3b;
            --heading-color: #81e6d9;
            --footer-color: #a0aec0;
            --link-color: #90caf9;
            --shadow-color: rgba(255, 255, 255, 0.1);
        }

        body {
            font-family: "Inter", sans-serif;
            background-color: var(--bg-color);
            margin: 0;
            padding: 0;
            color: var(--text-color);
            transition: background-color 0.3s, color 0.3s;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: var(--container-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 5px 20px var(--shadow-color);
            text-align: center;
            transition: background-color 0.3s;
        }

        h1 {
            color: var(--heading-color);
            font-size: 30px;
            margin-bottom: 20px;
            font-weight: 600;
            transition: color 0.3s;
        }

        p {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 15px;
        }

        .footer {
            font-size: 14px;
            color: var(--footer-color);
            margin-top: 30px;
            transition: color 0.3s;
        }

        .footer a {
            color: var(--link-color);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body data-theme="light">
    <div class="container">
        <h1>Welcome to QuickBrainAI!</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for joining QuickBrainAI! We’re thrilled to have you onboard.</p>
        <p>QuickBrainAI is an AI-powered note-taking app designed to enhance your productivity. Here’s what you can do:</p>
        <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
            <li>📝 Take smart, organized notes with AI assistance.</li>
            <li>🔍 Easily search and retrieve important information.</li>
            <li>📌 Categorize and manage notes effortlessly.</li>
            <li>📤 Access your notes anytime, anywhere.</li>
        </ul>
        <p>Start your journey now and let QuickBrainAI help you stay organized and efficient.</p>
        <p>Need help? Contact our support team at <a href="mailto:support@quickbrainai.com">support@quickbrainai.com</a>.</p>
        <div class="footer">
            <p>Best regards,<br>The QuickBrainAI Team</p>
            <p>
                <a href="https://www.quickbrainai.com">Visit our website</a> |
                <a href="mailto:support@quickbrainai.com">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>

    `;
};
