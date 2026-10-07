import 'dotenv/config';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { initDatabase, dbGet, dbRun, saveDb } from '../database/init.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function createAdmin() {
  await initDatabase();
  console.log('\n🔐 Create Admin Account\n');

  const email = await question('Email: ');
  const password = await question('Password (min 8 chars): ');
  const confirm = await question('Confirm Password: ');

  if (password !== confirm) {
    console.error('❌ Passwords do not match!');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters!');
    process.exit(1);
  }

  try {
    const existing = dbGet('SELECT id FROM admins WHERE email = ?', [email]);

    if (existing) {
      const update = await question('Admin already exists. Update password? (y/n): ');
      if (update.toLowerCase() === 'y') {
        const hashed = await bcrypt.hash(password, 12);
        dbRun('UPDATE admins SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [hashed, email]);
        saveDb();
        console.log('\n✅ Admin password updated successfully!');
      } else {
        console.log('Aborted.');
      }
    } else {
      const hashed = await bcrypt.hash(password, 12);
      dbRun('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashed]);
      saveDb();
      console.log('\n✅ Admin account created successfully!');
      console.log(`   Email: ${email}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }

  rl.close();
  process.exit(0);
}

createAdmin();
