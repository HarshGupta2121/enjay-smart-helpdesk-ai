const fs = require('fs');
const file = 'src/routes/auth.routes.ts';
let code = fs.readFileSync(file, 'utf8');

const oldConfig = `const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});`;

const newConfig = `const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});`;

if (code.includes(oldConfig)) {
  code = code.replace(oldConfig, newConfig);
  fs.writeFileSync(file, code);
  console.log('Patched authLimiter');
} else {
  console.log('authLimiter config not found or already patched');
}
