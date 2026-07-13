const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const Flutterwave = require("flutterwave-node-v3");

const app = express();

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const HERO_API_KEY = process.env.HERO_API_KEY;


// ======================
// MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());



// ======================
// CONNECT MONGODB
// ======================

mongoose.connect(
  "mongodb://ognation:DAYsmith7658@ac-cy4rjnl-shard-00-00.rzoihfs.mongodb.net:27017,ac-cy4rjnl-shard-00-01.rzoihfs.mongodb.net:27017,ac-cy4rjnl-shard-00-02.rzoihfs.mongodb.net:27017/?ssl=true&replicaSet=atlas-wk8l8b-shard-0&authSource=admin&appName=Cluster0"
)

.then(() => {

  console.log(
    "MongoDB Connected"
  );

})

.catch((err) => {

  console.log(err);

});


// ======================
// USER SCHEMA
// ======================
// ======================
// USER SCHEMA + MODEL
// ======================

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    balance: { type: Number, default: 0 },
    processedTxIds: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema); // ✅ THIS WAS MISSING
// ======================
// PRICING SCHEMA + MODEL
// ======================

const pricingSchema = new mongoose.Schema({

    country: String,

    service: String,

    price: Number,

    active: {
        type: Boolean,
        default: true
    }

});

const Pricing = mongoose.model("Pricing", pricingSchema);

// ======================
// NUMBER SCHEMA + MODEL
// ======================

const numberSchema = new mongoose.Schema({
  userEmail: String,
  number: String,
  orderId: String,
  service: String,
  price: Number,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const PurchasedNumber = mongoose.model("PurchasedNumber", numberSchema);



const paymentSchema = new mongoose.Schema({
    customer: String,
    amount: Number,
    transactionId: String,
    reference: String,
    method: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

// ======================
// ADMIN SCHEMA + MODEL
// ======================

const adminSchema = new mongoose.Schema({

    username: String,

    password: String

});

const Admin = mongoose.model("Admin", adminSchema);



// ======================
// REGISTER
// ======================

app.post(
  "/register",
  async (req, res) => {

    try {

      const {
        fullName,
        email,
        password
      } = req.body;

      const existingUser =
      await User.findOne({
        email
      });

      if(existingUser){

        return res.json({

          success: false,

          message:
          "User already exists"

        });

      }

      const newUser =
      new User({

        fullName,
        email,
        password,

        balance: 0

      });

      await newUser.save();

      res.json({

        success: true,

        message:
        "Registration Successful"

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false,

        message:
        "Server Error"

      });

    }

  }
);


// ======================
// LOGIN
// ======================

app.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;

      const user =
      await User.findOne({

        email,
        password

      });

      if(!user){

        return res.json({

          success: false,

          message:
          "Invalid Email or Password"

        });

      }

      res.json({

        success: true,

        user: {

          fullName:
          user.fullName,

          email:
          user.email,

          balance:
          user.balance

        }

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);


// ======================
// GET USER
// ======================

app.post(
  "/get-user",
  async (req, res) => {

    try {

      const email =
      req.body.email;

      const user =
      await User.findOne({
        email
      });

      if(!user){

        return res.json({

          success: false

        });

      }

      res.json({

        success: true,

        user: {

          fullName:
          user.fullName,

          email:
          user.email,

          balance:
          user.balance

        }

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);



// ======================
// UPDATE WALLET
// ======================
// ======================
// UPDATE WALLET
// ======================
app.post("/update-wallet", async (req, res) => {
  console.log("🔑 SECRET KEY:", process.env.FLW_SECRET_KEY ? "✅ FOUND" : "❌ MISSING");

  const { email, amount, transaction_id } = req.body;

  console.log("📥 UPDATE WALLET HIT");
  console.log("EMAIL:", email);
  console.log("AMOUNT:", amount);
  console.log("TRANSACTION ID:", transaction_id);

  if (!email || !transaction_id) {
    return res.json({ success: false, message: "Invalid request" });
  }

  try {
    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    );

    console.log("🔥 FLW VERIFY STATUS:", verifyRes.data?.data?.status);

    if (!verifyRes.data?.data || verifyRes.data?.data?.status !== "successful") {
      return res.json({ success: false, message: "Payment not successful" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.processedTxIds.includes(String(transaction_id))) {
      return res.json({ success: false, message: "Already processed" });
    }

    user.balance += Number(amount);
    user.processedTxIds.push(String(transaction_id));
    await user.save();

   const payment = new Payment({
    customer: email,
    amount: Number(amount),
    transactionId: transaction_id,
    reference: verifyRes.data.data.tx_ref,
    method: "Flutterwave",
    status: "Successful"
});

await payment.save();


    return res.json({ success: true, balance: user.balance });

  } catch (error) {
    console.log("❌ ERROR:", error.response?.data || error.message);
    return res.json({ success: false, message: error.response?.data?.message || error.message });
  }
});

const heroServiceCodes = {
    facebook: "fb",
    whatsapp: "wa",
    telegram: "tg",
    google: "go",
    gmail: "go",
    youtube: "go",
    instagram: "ig",
    tiktok: "lf",
    paypal: "ts"
};

const heroCountryCodes = {
    usa: 187,
    canada: 36,
    uk: 16,
    "south africa": 1
};


// ======================
// BUY NUMBER
// ======================

app.post(
  "/buy-number",
  async (req, res) => {

    let user;
    let sellingPrice = 0;

    

    try {

      const email =
      req.body.email;

      const country =
      req.body.country;

      const service =
      req.body.service;

      const pricing = await Pricing.findOne({

    country: country.toLowerCase(),

    service: service.toLowerCase(),

    active: true

});

if (!pricing) {

    return res.json({

        success: false,

        message: "Price not configured"

    });

}

sellingPrice = pricing.price;

      console.log("Country:", country);
console.log("Service:", service);



   
       user =
      await User.findOne({

        email

      });

      if(!user){

        return res.json({

          success: false,

          message:
          "User not found"

        });

      }


console.log("Database Balance:", user.balance);
console.log("Selling Price:", sellingPrice);
      
      
 // CHECK BALANCE

      if(user.balance < sellingPrice){

        return res.json({

          success: false,

          message:
          "Insufficient Balance"

        });

      }

      // REMOVE MONEY

      user.balance =
      user.balance - sellingPrice;

      await user.save();


      // BUY FROM 5SIM
     
 
 console.log(country);
console.log(service);  

    const buyResponse = await axios.get(
    "https://hero-sms.com/stubs/handler_api.php",
    {
        params: {
            action: "getNumberV2",
            api_key: HERO_API_KEY,
            service: heroServiceCodes[service.toLowerCase()] || service,
            country: heroCountryCodes[country.toLowerCase()] || country
        }
    }
);
      console.log(
        buyResponse.data
      );

      
     



     if (!buyResponse.data.phoneNumber) {

  // REFUND USER
  user.balance =
  user.balance + sellingPrice;

  await user.save();

  return res.json({

    success:false,

    message:
    "No numbers available currently"

  });

}

     const generatedNumber = buyResponse.data.phoneNumber;

const orderId = buyResponse.data.activationId;
      const realPrice =
      buyResponse.data.price || 0;

     


      

      // SAVE PURCHASE

      const newPurchase =
      new PurchasedNumber({

        userEmail:
        user.email,

        number:
        generatedNumber,

        orderId:
        orderId,

        service:
        service,

        price:
        sellingPrice

      });

      await newPurchase.save();

      res.json({

        success: true,

        number:
        generatedNumber,

        balance:
        user.balance,

        price:
        sellingPrice

      });

    }

    catch(error){

  // REFUND USER
  if(user){

    user.balance =
    user.balance + sellingPrice;

    await user.save();

  }

  console.log(
    error.response?.data ||
    error.message
  );

  res.json({

    success: false,

    message:
    "Failed to buy number"

  });

}

  }
);

app.post(
"/cancel-number",
async (req, res) => {

try {

  const {
    email,
    orderId,
    price
  } = req.body;

  const user =
  await User.findOne({
    email
  });

  if(!user){

    return res.json({

      success:false,

      message:"User not found"

    });

  }
  
  console.log("Cancelling order:", orderId);

  await axios.get(

    `https://5sim.net/v1/user/cancel/${orderId}`,

    {

      headers: {

        Authorization:
        "Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTEzNzQ1NzUsImlhdCI6MTc3OTgzODU3NSwicmF5IjoiMWNkMjg5MWI5ODE3ODg4ZTJiZmY5ODFjZjkyYzllNjQiLCJzdWIiOjQxMjUyMjF9.0of6sZEt8BPcNp-H1G9Hyf2VyPgxuvfKrpYJ1BrR09jH_SiKwxueU0mghaLrVK8ZLUcPQwYH2HoTe5rT1nUtMbjBm1GIcvx9lRv47TAwNWJ3JZ51phEZJjTFZhnh_Dk3zl-2PVxWD0SPAacfP_F696QhyZ6fpW-EzXHHQ9etqfuGQAK4yLbz_kk_BYfSux-Vo-KOAmEzrVqodI1n_799o9m2mGIp6tx8FO2G88A4OPCapiW4sOJAf8CtbD7RN8ydG0dcQPC5KFHUx1VMoV0uveOKPmjZx-zwREmgjU3Hc8M77I-Syvl-iyFA0QbAwzMskB1u7bxJGEXDmPPNIuIByw",

        Accept:
        "application/json"

      }

    }

  );

  user.balance =
  user.balance + Number(price);

  await user.save();

  await PurchasedNumber.findOneAndUpdate(
  { orderId },
  { status: "cancelled" }
);

  res.json({

    success:true,

    balance:user.balance

  });

}

catch(error){

  console.log(error);

  res.json({

    success:false,

    message:"Refund failed"

  });

}

}
);

// ======================
// AUTO REFUND
// ======================

app.get("/auto-refund", async (req, res) => {

  try {

    const purchases = await PurchasedNumber.find({
      status: "pending"
    });

    let refunded = 0;

    for (const purchase of purchases) {

      const minutes =
        (Date.now() - new Date(purchase.createdAt).getTime()) / 60000;

      if (minutes >= 10) {

        const user = await User.findOne({
          email: purchase.userEmail
        });

        if (!user) {
          continue;
        }

        user.balance += purchase.price;

        await user.save();

        purchase.status = "cancelled";

        await purchase.save();

        refunded++;

      }

    }

    res.json({

      success: true,

      pendingOrders: purchases.length,

      refunded

    });

  }

  catch(error){

    console.log(error);

    res.json({

      success: false

    });

  }

});






// ======================
// GET LIVE PRICE
// ======================



   // ======================
// GET PRICE FROM DATABASE
// ======================

app.post("/get-price", async (req, res) => {

    try {

        const { country, service } = req.body;

        const pricing = await Pricing.findOne({

            country: country.toLowerCase(),

            service: service.toLowerCase(),

            active: true

        });

        if (!pricing) {

            return res.json({

                success: false,

                message: "Price not configured"

            });

        }

        res.json({

            success: true,

            price: pricing.price

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false

        });

    }

});


// ======================
// GET SMS
// ======================

app.post(
  "/get-sms",
  async (req, res) => {

    try {

      const orderId =
      req.body.orderId;

      const response =
      await axios.get(

        `https://5sim.net/v1/user/check/${orderId}`,

        {

          headers: {

            Authorization:
            "Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTEzNzQ1NzUsImlhdCI6MTc3OTgzODU3NSwicmF5IjoiMWNkMjg5MWI5ODE3ODg4ZTJiZmY5ODFjZjkyYzllNjQiLCJzdWIiOjQxMjUyMjF9.0of6sZEt8BPcNp-H1G9Hyf2VyPgxuvfKrpYJ1BrR09jH_SiKwxueU0mghaLrVK8ZLUcPQwYH2HoTe5rT1nUtMbjBm1GIcvx9lRv47TAwNWJ3JZ51phEZJjTFZhnh_Dk3zl-2PVxWD0SPAacfP_F696QhyZ6fpW-EzXHHQ9etqfuGQAK4yLbz_kk_BYfSux-Vo-KOAmEzrVqodI1n_799o9m2mGIp6tx8FO2G88A4OPCapiW4sOJAf8CtbD7RN8ydG0dcQPC5KFHUx1VMoV0uveOKPmjZx-zwREmgjU3Hc8M77I-Syvl-iyFA0QbAwzMskB1u7bxJGEXDmPPNIuIByw",

            Accept:
            "application/json"

          }

        }

      );

      if(
  response.data.sms &&
  response.data.sms.length > 0
){

  await PurchasedNumber.findOneAndUpdate(
    { orderId },
    { status: "successful" }
  );

}

      res.json({

        success: true,

        data:
        response.data

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);


// ======================
// PURCHASE HISTORY
// ======================

app.post(
  "/purchase-history",
  async (req, res) => {

    try {

      const email =
req.body.email;

console.log("PURCHASE HISTORY EMAIL:", email);

const purchases =
await PurchasedNumber.find({

  userEmail:
  email

}).sort({

  createdAt: -1

});

console.log("PURCHASES FOUND:", purchases);
      res.json({

        success: true,

        purchases

      });

    }

    catch(error){

      console.log(error);

      res.json({

        success: false

      });

    }

  }
);


// ======================
// ADMIN DASHBOARD
// ======================

app.get("/admin/dashboard", async (req, res) => {

    try {

        const totalUsers = await User.countDocuments();

        const numbersSold = await PurchasedNumber.countDocuments();

        const pendingOrders = await PurchasedNumber.countDocuments({
            status: "pending"
        });

        const cancelledOrders = await PurchasedNumber.countDocuments({
            status: "cancelled"
        });

        const revenueResult = await PurchasedNumber.aggregate([
  {
    $match: {
      status: "successful"
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: {
        $sum: "$price"
      }
    }
  }
]);

const totalRevenue =
  revenueResult.length > 0
    ? revenueResult[0].totalRevenue
    : 0;

    const walletResult = await User.aggregate([
  {
    $group: {
      _id: null,
      totalWallet: {
        $sum: "$balance"
      }
    }
  }
]);

const totalWallet =
walletResult.length > 0
? walletResult[0].totalWallet
: 0;


       res.json({
  success: true,
  totalUsers,
  numbersSold,
  pendingOrders,
  cancelledOrders,
  totalRevenue,
  totalWallet
});

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

app.get("/admin/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("fullName email balance createdAt")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });

    } catch (err) {
        console.log(err);

        res.json({
            success: false
        });
    }
});

// ======================
// SERVER
// ======================

 const PORT = process.env.PORT || 5000;

 // ======================
// ADMIN RECENT PURCHASES
// ======================

app.get("/admin/recent-purchases", async (req, res) => {

  try {

    const purchases = await PurchasedNumber.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      purchases
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false
    });

  }

});

app.get("/admin/payments", async (req, res) => {

    try {

        const payments = await Payment.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});



// ======================
// ADMIN ADD / UPDATE PRICE
// ======================

app.post("/admin/save-price", async (req, res) => {

    try {

        const { country, service, price } = req.body;

        let pricing = await Pricing.findOne({
            country,
            service
        });

        if (pricing) {

            pricing.price = Number(price);
            await pricing.save();

        } else {

            pricing = new Pricing({
                country,
                service,
                price: Number(price)
            });

            await pricing.save();

        }

        res.json({
            success: true,
            pricing
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

// ======================
// ADMIN GET PRICES
// ======================

app.get("/admin/prices", async (req, res) => {

    try {

        const prices = await Pricing.find().sort({
            country: 1,
            service: 1
        });

        res.json({
            success: true,
            prices
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

app.delete("/admin/delete-price/:id", async (req, res) => {

    try {

        await Pricing.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});


// ======================
// GET AVAILABLE COUNTRIES
// ======================

app.get("/countries", async (req, res) => {

    try {

        const countries = await Pricing.distinct("country", {
            active: true
        });

        res.json({
            success: true,
            countries
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});


// ======================
// ADMIN LOGIN
// ======================

app.post("/admin/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const admin = await Admin.findOne({
            username,
            password
        });

        if (!admin) {

            return res.json({
                success: false,
                message: "Invalid Admin Login"
            });

        }

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});



// ======================
// CREATE FIRST ADMIN
// ======================





app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});