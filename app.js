const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

// set up flash
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const { Contact } = require("./model/contact");

const app = express();
const port = 3000;

// set up method override
app.use(methodOverride("_method"));

// set up ejs
app.set("view engine", "ejs"); // gunakan ejs
app.use(expressLayouts); // third party middlewar
app.use(express.static("public")); // built-in middleware
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 3000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// halaman home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Zee",
      email: "zee@gmail.com",
    },
    {
      nama: "Ucup",
      email: "ucup@gmail.com",
    },
    {
      nama: "Parjo",
      email: "Parjo@gmail.com",
    },
  ];
  res.render("index", {
    nama: "ucup surucup",
    title: "Home",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});

// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman about",
    layout: "layouts/main-layout",
  });
});

// halaman kontak
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();
  res.render("contact", {
    title: "Halaman kontak",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});

// halaman tambah data kontak
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Tambah data kontak",
    layout: "layouts/main-layout",
  });
});

app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama kontak sudah ada!");
      }
      return true;
    }),
    check("email", "Format email salah!").isEmail(),
    check("nohp", "Format nomor salah!").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Tambah data kontak",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      try {
        // versi modern: tanpa callback
        await Contact.insertMany(req.body);

        // kirimkan flash message
        req.flash("msg", "Data kontak berhasil ditambahkan!");
        res.redirect("/contact");
      } catch (error) {
        console.error(error);
        res.status(500).send("Gagal menambahkan data kontak");
      }
      //   Contact.insertMany(req.body, (error, result) => {
      //     // kirimkan flash message
      //     req.flash("msg", "Data kontak berhasil di Tambahkan!");
      //     res.redirect("/contact");
      //   });
    }
  }
);

// proses delete kontak
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   // jika kontak tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       req.flash("msg", "Data kontak berhasil di Hapus!");
//       res.redirect("/contact");
//     });
//   }
// });
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data kontak berhasil di Hapus!");
    res.redirect("/contact");
  });
});

// halaman ubah data
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Ubah data kontak",
    layout: "layouts/main-layout",
    contact,
  });
});

// proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldName && duplikat) {
        throw new Error("Nama kontak sudah ada!");
      }
      return true;
    }),
    check("email", "Format email salah!").isEmail(),
    check("nohp", "Format nomor salah!").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Ubah data kontak",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      await Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash("msg", "Data kontak berhasil di Ubah!");
        res.redirect("/contact");
      });
    }
  }
);

// halaman detail kontak
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    title: "Halaman detail",
    layout: "layouts/main-layout",
    contact,
  });
});

app.listen(port, () => {
  console.log(`server running at http://localhost:${port}...`);
});
