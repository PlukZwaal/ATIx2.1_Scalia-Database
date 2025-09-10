const bcrypt = require('bcrypt');

const password = 'password123';
const saltRounds = 12;

const fakeUsers = [
  { first_name: 'Nep', last_name: 'Account1', username: 'nepaccount1', email: 'nepaccount1@gmail.com' },
  { first_name: 'Nep', last_name: 'Account2', username: 'nepaccount2', email: 'nepaccount2@gmail.com' },
  { first_name: 'Nep', last_name: 'Account3', username: 'nepaccount3', email: 'nepaccount3@gmail.com' },
  { first_name: 'Nep', last_name: 'Account4', username: 'nepaccount4', email: 'nepaccount4@gmail.com' },
  { first_name: 'Nep', last_name: 'Account5', username: 'nepaccount5', email: 'nepaccount5@gmail.com' }
];

fakeUsers.forEach(user => {
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) throw err;

    console.log(`
    INSERT INTO staff (
      first_name, 
      last_name, 
      address_id, 
      email, 
      store_id, 
      active, 
      username, 
      password, 
      last_update
    ) VALUES (
      '${user.first_name}',
      '${user.last_name}', 
      3,
      '${user.email}',
      1,
      1,
      '${user.username}',
      '${hashedPassword}',
      NOW()
    );
    `);
  });
});
