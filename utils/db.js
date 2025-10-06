const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/folks"),
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    userCreateIndex: true,
  };



// // menambah satu data
// const addContact = new Contact({
//   nama: "Zee",
//   nohp: "085770022651",
//   email: "zee@gmail.com",
// });

// // simpan ke koleksi
// addContact.save().then((contact) => console.log(contact));
