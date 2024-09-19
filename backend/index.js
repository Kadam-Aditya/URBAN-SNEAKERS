const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const crypto = require('crypto');
const Razorpay = require("razorpay");
const { type } = require("os");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');


require('dotenv').config();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


mongoose.connect(process.env.MONGODB_URL);



const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  })
})



app.use('/images', express.static('upload/images'));



const fetchuser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user; // Attach user data to the request object
    next();
  } catch (error) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};



const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now() },
  otpverified: {type: Boolean, default: false}
});



const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});






app.get("/", (req, res) => {
  res.send("Root");
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  const { email, password } = req.body;
  
  try {
    // Find the user by email
    let user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, errors: "Please try with correct email/password." });
    }

    // Check if the password matches
    const passCompare = password === user.password;

    if (!passCompare) {
      return res.status(400).json({ success: false, errors: "Please try with correct email/password." });
    }

    // Check if OTP is verified
    if (!user.otpverified) {
      // Generate and send OTP verification email
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedOtp = await bcrypt.hash(otp, 10);

      // Save new OTP in the database
      await UserOTPVerificationSchema.updateOne(
        { email },
        { otp: hashedOtp, expireAt: Date.now() + 15 * 60 * 1000 },
        { upsert: true }
      );

      // Send OTP via email
      await verifysendEmailOTP(email, otp);

      return res.status(400).json({ 
        success: false, 
        otpRequired: true,  
        email: user.email, 
        errors: "Please verify your account before logging in. Redirecting to verification page."
      });
    }

    // If OTP is verified, proceed with JWT token generation
    const data = { user: { id: user.id } };
    success = true;
    const token = jwt.sign(data, 'secret_ecom');

    // Send response with token
    return res.json({ success, token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, errors: "Server error." });
  }
});







//Create an endpoint at ip/auth for regestring the user & sending auth-token
app.post('/signup', async (req, res) => {
  try {
    console.log("Sign Up");

    // Check if user already exists
    let check = await Users.findOne({ email: req.body.email });
    
    if (check) {
      // Redirect to login if user already exists
      return res.status(200).json({ success: false, existingUser: true, message: "Existing user found with this email. Redirecting to login page." });
    }

    // Initialize empty cart for user
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    // Create a new user
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();  // Save user data to MongoDB
    await sendOTPVerificationEmail(user, res);  // Send OTP

  } catch (error) {
    console.error("Signup Error: ", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});




// endpoint for getting all products data
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});


// endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  console.log("New Collections");
  res.send(arr);
});


// endpoint for getting womens products data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

// endpoint for getting womens products data
app.post("/relatedproducts", async (req, res) => {
  console.log("Related Products");
  const {category} = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added")
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);

})


// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name })
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name })
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});

const Order = mongoose.model("Order", {
  userId: { type: String, required: true },
  items: [{
    id: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Order Processing" },
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false },
  razorpay_order_id: { type: String }, // Save Razorpay order ID here
});


app.post("/place",fetchuser, async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    // Create an order in Razorpay
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (in paisa for INR)
      currency: "INR",
      receipt: `receipt_order_${Math.random() * 1000}`,
    };

    const order = await razorpay.orders.create(options);

    // Create a new order in your MongoDB database
    const newOrder = new Order({
      userId: req.user.id,
      items,
      amount,
      address,
      status: "Order Processing",
      payment: false,
      razorpay_order_id: order.id, // Save Razorpay order ID
    });

    await newOrder.save();

    // Send back the Razorpay order details
    res.json({
      success: true,
      order_id: order.id,   // Razorpay order ID
      amount: order.amount, // Amount in paise
      currency: order.currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error placing the order");
  }
});

app.post("/verify-payment", fetchuser, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Create a hash using your Razorpay secret key
  const key_secret = process.env.RAZORPAY_SECRET_KEY;

  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    // Update the order as paid
    const order = await Order.findOneAndUpdate(
      { razorpay_order_id },
      { payment: true, status: "Payment Successful" }
    );

    res.json({ success: true, message: "Payment verified and order updated" });
  } else {
    res.json({ success: false, message: "Payment verification failed" });
  }
});

app.post("/userorders", fetchuser, async (req, res) => {
  try {
    // Fetch all orders for the authenticated user
    const orders = await Order.find({ userId: req.user.id });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for this user" });
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).send("Error fetching user orders");
  }


});


const UserOTPVerificationSchema = mongoose.model("UserOTPVerificationSchema", {
  userId: { type: String, required: true },
  email: { type: String, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: Date.now },
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true,
  port: 465,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  },
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`; // Generate a 4-digit OTP

    const mailOptions = {
      from: process.env.AUTH_EMAIL, // Email sender (your configured email)
      to: email, // Recipient's email
      subject: "Urban Sneakers - Confirm Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Welcome to Urban Sneakers!</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            You're just one step away from exploring our exclusive sneaker collection. Please verify your email address to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #333;"><b>Your Verification Code:</b></p>
            <p style="font-size: 24px; color: #6a62f9; font-weight: bold;">${otp}</p>
            <p style="font-size: 14px; color: #777;">This code will expire in 10 mins.</p>
          </div>

          <p style="font-size: 16px; color: #555; text-align: center;">
            Enter this code in the app to verify your email and get started on your Urban Sneakers journey!
          </p>

          <div style="text-align: center; margin-top: 20px;">
            <a href="https://yourwebsite.com" style="background-color: #6a62f9; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Now</a>
          </div>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
            If you did not sign up for Urban Sneakers, please ignore this email or contact our support team.
          </p>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 20px;">
            &copy; 2024 Urban Sneakers, All rights reserved.
          </p>
        </div>
      `
    };

    // Hash the OTP for security reasons
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    // Store the hashed OTP in the database along with user info
    const newOTPVerification = new UserOTPVerificationSchema({
      userId: _id,
      email: email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expireAt: Date.now() + 600000, 
    });

    await newOTPVerification.save(); // Save OTP data in MongoDB

    // Send the OTP email
    await transporter.sendMail(mailOptions);

    // Send response after email is successfully sent
    return res.json({
      status: "PENDING",
      message: "Verification OTP email sent",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    console.error("OTP Sending Error: ", error);

    // Send error response if OTP email fails
    return res.status(500).json({
      status: "FAILED",
      message: "Could not send OTP verification email.",
      error: error.message
    });
  }
};

app.post("/verifyOTP", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Missing email or OTP" });
    }

    // Find the OTP entry for the email
    const userOTPVerification = await UserOTPVerificationSchema.findOne({ email });

    if (!userOTPVerification) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check if the OTP has expired
    if (userOTPVerification.expireAt < Date.now()) {
      await UserOTPVerificationSchema.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    console.log(userOTPVerification.otp);
    console.log(otp);

    // Compare the OTP provided by the user with the stored, hashed OTP
    const isValidOTP = await bcrypt.compare(otp, userOTPVerification.otp);

    if (!isValidOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark the user as verified
    await Users.updateOne({ email }, { otpverified: true });

    // Remove OTP record after successful verification
    await UserOTPVerificationSchema.deleteOne({ email });

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/resendOTP", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing email" });
    }

    // Check if the user exists
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate new OTP and send it to the user
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(newOtp, 10);

    // Save new OTP in the database
    await UserOTPVerificationSchema.updateOne(
      { email },
      { otp: hashedOtp, expireAt: Date.now() + 15 * 60 * 1000 },
      { upsert: true }
    );

    // Send OTP via email
    await resendOtpEmail(email, newOtp);  // Implement this function

    res.json({ success: true, message: "OTP has been resent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const resendOtpEmail = async (email, otp) => {
  try {
    // Create transporter object using your email service
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL, // Email sender (your configured email)
      to: email, // Recipient's email
      subject: "Urban Sneakers - Confirm Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Welcome to Urban Sneakers!</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            You're just one step away from exploring our exclusive sneaker collection. Please verify your email address to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #333;"><b>Your Verification Code:</b></p>
            <p style="font-size: 24px; color: #6a62f9; font-weight: bold;">${otp}</p>
            <p style="font-size: 14px; color: #777;">This code will expire in 10 mins.</p>
          </div>

          <p style="font-size: 16px; color: #555; text-align: center;">
            Enter this code in the app to verify your email and get started on your Urban Sneakers journey!
          </p>

          <div style="text-align: center; margin-top: 20px;">
            <a href="https://yourwebsite.com" style="background-color: #6a62f9; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Now</a>
          </div>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
            If you did not sign up for Urban Sneakers, please ignore this email or contact our support team.
          </p>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 20px;">
            &copy; 2024 Urban Sneakers, All rights reserved.
          </p>
        </div>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully!');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

const verifysendEmailOTP = async (email, otp) => {
  try {
    // Create transporter object using your email service
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL, // Email sender (your configured email)
      to: email, // Recipient's email
      subject: "Urban Sneakers - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">OTP Verification</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            You're just one step away from accessing your account. Please use the OTP below to verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #333;"><b>Your OTP Code:</b></p>
            <p style="font-size: 24px; color: #6a62f9; font-weight: bold;">${otp}</p>
            <p style="font-size: 14px; color: #777;">This code will expire in 10 mins.</p>
          </div>

          <p style="font-size: 16px; color: #555; text-align: center;">
            Enter this code in the app to verify your email and get started with your Urban Sneakers account!
          </p>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
            If you did not request this, please ignore this email or contact our support team.
          </p>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 20px;">
            &copy; 2024 Urban Sneakers, All rights reserved.
          </p>
        </div>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully!');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

