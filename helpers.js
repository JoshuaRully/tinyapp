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

const urlsForUser = function (id) {
  let arr = Object.values(urlDatabase);
  let arrayOfURLS = [];
  for (let obj of arr) {
    if (obj.userID === id) {
      arrayOfURLS.push(item.longURL);
    }
  }
  return arrayOfURLS;
}

module.exports =  { genRandomString, getUserByEmail, urlsForUser };