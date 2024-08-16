const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

// MySQL Connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "nodejs"
});

connection.connect(function(error) {
    if (error) throw error;
    console.log("Connected to the database successfully!");
});

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/welcome.html", (req, res) => {
    res.sendFile(path.join(__dirname, "welcome.html"));
});

app.get("/payment.html", (req, res) => {
    res.sendFile(path.join(__dirname, "payment.html"));
});

// Handle Login
app.post("/", (req, res) => {
    const { username, password } = req.body;

    connection.query("SELECT * FROM loginuser WHERE user_name = ? AND user_pass = ?", [username, password], (error, results) => {
        if (error) {
            console.error("Error during login:", error);
            res.redirect('/');
        } else if (results.length > 0) {
            res.redirect("/welcome.html");
        } else {
            res.redirect('/');
        }
    });
});

// Handle Registration
app.post("/register", (req, res) => {
    const { fullname, username, email, phone, password, confirm_password, gender } = req.body;

    if (password !== confirm_password) {
        return res.redirect("/register.html");
    }

    const query = "INSERT INTO loginuser (full_name, user_name, user_email, user_phone, user_pass, gender) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(query, [fullname, username, email, phone, password, gender], (error) => {
        if (error) {
            console.error("Error during registration:", error);
            return res.redirect("/register.html");
        } else {
            res.redirect("/");
        }
    });
});
// Handle Payment Verification
app.post("/verifyPayment", (req, res) => {
    const { fullName, email, phoneNumber, birthDate, gender, streetAddress1, streetAddress2, country, city, region, postalCode } = req.body;

    const query = "SELECT * FROM payments WHERE full_name = ? AND email = ? AND phone_number = ? AND birth_date = ? AND gender = ? AND street_address1 = ? AND street_address2 = ? AND country = ? AND city = ? AND region = ? AND postal_code = ?";
    connection.query(query, [fullName, email, phoneNumber, birthDate, gender, streetAddress1, streetAddress2, country, city, region, postalCode], (error, results) => {
        if (error) {
            console.error("Error during payment verification:", error);
            return res.json({ success: false });
        }

        if (results.length > 0) {
            // Payment details verified successfully
            return res.json({ success: true });
        } else {
            // Payment verification failed
            return res.json({ success: false });
        }
    });
});

// 404 Error Handling
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "404.html"));
});

// Set app port
app.listen(4400, () => {
    console.log("Server is running on http://localhost:4400");
});

