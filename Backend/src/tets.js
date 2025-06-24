const bcrypt = require("bcrypt");
const newPassword = "thomasiafrate";
const hashed = bcrypt.hashSync(newPassword, 10);
console.log("Hash :", hashed);
