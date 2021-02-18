const genRandomString = () => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = char.length;
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

const checkPassword = (loginemail, loginpassword, objectDb) => {
  for (let user in objectDb) {
    if (objectDb[user].email === loginemail && loginpassword) {
      return true;
    }
  }
  return false;
};

module.exports =  { genRandomString, getUserByEmail, checkPassword};