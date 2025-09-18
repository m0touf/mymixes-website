const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('Usage: node generatePassword.js <your-password>');
    process.exit(1);
  }

  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n🔐 Password Hash Generated:');
    console.log('=====================================');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    console.log('=====================================');
    console.log('\n📝 Copy this to your .env file');
    console.log('⚠️  Keep your password secure and never commit it to git!\n');
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generatePasswordHash();
