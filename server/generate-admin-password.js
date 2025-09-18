const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node generate-admin-password.js "your-password"');
  console.log('Example: node generate-admin-password.js "mySecretPassword123"');
  process.exit(1);
}

const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating password hash:', err);
    process.exit(1);
  }
  
  console.log('\n=== ADMIN PASSWORD SETUP ===');
  console.log('Your password hash is:');
  console.log(hash);
  console.log('\nAdd this to your server/.env file:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log('\nAlso add:');
  console.log('JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"');
  console.log('DATABASE_URL="your-database-url-here"');
  console.log('\n=== END SETUP ===\n');
});
