const API_URL = "https://ogsms-3.onrender.com";



// ======================
// CURRENT USER
// ======================

const currentUser =
JSON.parse(
  localStorage.getItem(
    "currentUser"
  )
);


// ======================
// REGISTER SYSTEM
// ======================

const registerForm =
document.getElementById(
  "registerForm"
);

if(registerForm){

  registerForm.addEventListener(
    "submit",
    async function(e){

      e.preventDefault();

      const fullName =
      document.getElementById(
        "fullName"
      ).value;

      const email =
      document.getElementById(
        "email"
      ).value;

      const password =
      document.getElementById(
        "password"
      ).value;

      try{

        const response =
        await fetch(

          `${API_URL}/register`,

          {

            method: "POST",

            headers: {

              "Content-Type":
              "application/json"

            },

 body: JSON.stringify({

  fullName,
  email,
  password

})

          }

        );

        const data =
        await response.json();

        if(data.success){

          alert(
            "Registration Successful"
          );

          window.location.href =
          "login.html";

        }

        else{

          alert(
            data.message
          );

        }

      }

      catch(error){

        console.log(error);

        alert(
          "Server Error"
        );

      }

    }

  );

}


// ======================
// LOGIN SYSTEM
// ======================

const loginForm =
document.getElementById(
  "loginForm"
);

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async function(e){

      e.preventDefault();

      const email =
      document.getElementById(
        "email"
      ).value;

      const password =
      document.getElementById(
        "password"
      ).value;

      try{

        const response =
        await fetch(

          `${API_URL}/login`,

          {

            method: "POST",

            headers: {

              "Content-Type":
              "application/json"

            },

            body: JSON.stringify({

              email,
              password

            })

          }

        );

        const data =
        await response.json();

        if(data.success){

          localStorage.setItem(

            "currentUser",

            JSON.stringify(
              data.user
            )

          );

          alert(
            "Login Successful"
          );

          window.location.href =
          "dashboard.html";

        }

        else{

          alert(
            data.message
          );

        }

      }

      catch(error){

        console.log(error);

        alert(
          "Server Error"
        );

      }

    }

  );

}


// ======================
// LOAD USER DATA
// ======================

async function loadUserData(){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  if(!currentUser){

    return;

  }

  try{

    const response =
    await fetch(

      `${API_URL}/get-user`,

      {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json"

        },

        body: JSON.stringify({

          email:
          currentUser.email

        })

      }

    );

    const data =
    await response.json();

    if(data.success){

      localStorage.setItem(

        "currentUser",

        JSON.stringify(
          data.user
        )

      );

      // USER NAME

      const userName =
      document.getElementById(
        "userName"
      );

      if(userName){

        userName.innerText =

        data.user.fullName ||

        "OGSMS User";

      }

      // USER EMAIL

      const userEmail =
      document.getElementById(
        "userEmail"
      );

      if(userEmail){

        userEmail.innerText =
        data.user.email;

      }

      // WALLET BALANCE

      const walletBalance =
      document.getElementById(
        "walletBalance"
      );

      if(walletBalance){

        walletBalance.innerText =

        "₦" +

        Number(
          data.user.balance || 0
        ).toLocaleString();

      }

    }

  }

  catch(error){

    console.log(error);

  }

}


// ======================
// SET QUICK AMOUNT
// ======================

function setAmount(amount){

  document.getElementById(
    "amount"
  ).value = amount;

}


// ======================
// FUND WALLET
// ======================

async function fundWallet(amount){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  if(!currentUser){

    alert(
      "Login Required"
    );

    return;

  }

  try{

    const response =
    await fetch(

      `${API_URL}/update-wallet`,

      {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json"

        },

        body: JSON.stringify({

          email:
          currentUser.email,

          amount

        })

      }

    );

    const data =
    await response.json();

    if(data.success){

      currentUser.balance =
      data.balance;

      localStorage.setItem(

        "currentUser",

        JSON.stringify(
          currentUser
        )

      );

      alert(
        "Wallet Funded Successfully"
      );

      location.reload();

    }

    else{

      alert(
        data.message
      );

    }

  }

  catch(error){

    console.log(error);

    alert(
      "Server Error"
    );

  }

}


// ======================
// FLUTTERWAVE PAYMENT
// ======================

function makePayment(){

  const amount =
  document.getElementById(
    "amount"
  ).value;

  if(amount === ""){

    alert(
      "Enter amount"
    );

    return;

  }

  if(!currentUser){

    alert(
      "Login Required"
    );

    return;

  }

  FlutterwaveCheckout({

    public_key:
    "FLWPUBK-ab46a67dfb1a6016ae7159462676aee7-X",

    tx_ref:
    "OGSMS-" + Date.now(),

    amount:
    amount,

    currency:
    "NGN",

    payment_options:
    "card,banktransfer,ussd",

    customer: {

      email:
      currentUser.email,

      name:
      currentUser.fullName || "OGSMS User"

    },

    customizations: {

      title:
      "OGSMS Wallet Funding",

      description:
      "Wallet Deposit",

      logo:
      "https://flutterwave.com/images/logo-colored.svg"

    },

    callback: function(response){

      fundWallet(amount);

    },

    onclose: function(){

      console.log(
        "Payment Closed"
      );

    }

  });

}


// ======================
// BUY NUMBER
// ======================

const buyButtons =
document.querySelectorAll(
  "#buyBtn"
);

buyButtons.forEach((button) => {

  button.addEventListener(
    "click",
    async function(){

      const currentUser =
      JSON.parse(
        localStorage.getItem(
          "currentUser"
        )
      );

      if(!currentUser){

        alert(
          "Login Required"
        );

        return;

      }

      try{

        const response =
        await fetch(

          `${API_URL}/buy-number`,

          {

            method: "POST",

            headers: {

              "Content-Type":
              "application/json"

            },

           body: JSON.stringify({

  email:
  currentUser.email,

  country:
  document.getElementById(
    "country"
  ).value,

  service:
  document.getElementById(
    "service"
  ).value

})
          }

        );

        const data =
        await response.json();

        if(data.success){

          currentUser.balance =
          data.balance;

          localStorage.setItem(

            "currentUser",

            JSON.stringify(
              currentUser
            )

          );

          alert(

            "Number Purchased\n\n" +

            data.number

          );

          loadUserData();

        }

        else{

          alert(
            data.message
          );

        }

      }

      catch(error){

        console.log(error);

        alert(
          "Server Error"
        );

      }

    }
  );

});


// ======================
// LOGOUT
// ======================

function logout(){

  localStorage.removeItem(
    "currentUser"
  );

  window.location.href =
  "login.html";

}


// ======================
// LOAD DATA
// ======================

loadUserData();



// ======================
// LIVE 5SIM PRICE
// ======================

const countrySelect =
document.getElementById(
  "country"
);

const serviceSelect =
document.getElementById(
  "service"
);

const priceInput =
document.getElementById(
  "price"
);

async function loadPrice(){

  if(
    !countrySelect ||
    !serviceSelect ||
    !priceInput
  ){

    return;

  }

  try{

    priceInput.value =
    "Loading...";

   const response =
await fetch(
  `${API_URL}/get-price`,
      {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json"

        },

        body: JSON.stringify({

         country:
countrySelect.value,

service:
serviceSelect.value

        })

      }

    );

    const data =
    await response.json();

    console.log(data);

   

   if (serviceSelect.value === "whatsapp") {

    priceInput.value = "₦3500";

}

else if (serviceSelect.value === "facebook") {

    if (countrySelect.value === "usa") {

        priceInput.value = "₦900";

    }

    else if (countrySelect.value === "uk") {

        priceInput.value = "₦500";

    }

    else {

        priceInput.value = "₦500";

    }

}

else if (serviceSelect.value === "telegram") {

    priceInput.value = "₦1500";

}

else if (serviceSelect.value === "instagram") {

    priceInput.value = "₦2200";

}

else if (serviceSelect.value === "gmail") {

    priceInput.value = "₦2000";

}

else {

    priceInput.value = "₦3000";

}

}


  

  catch(error){

    console.log(error);

    priceInput.value =
    "Error";

  }

}

if(countrySelect){

  countrySelect.addEventListener(
    "change",
    loadPrice
  );

}

if(serviceSelect){

  serviceSelect.addEventListener(
    "change",
    loadPrice
  );

}

loadPrice();

async function cancelNumber(orderId, price){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  try{

    const response =
await fetch(
  `${API_URL}/cancel-number`,
      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          email:
          currentUser.email,

          orderId:
          orderId,

          price:
          price

        })

      }

    );

    const data =
    await response.json();

    if(data.success){

      alert(
        "Refund Successful"
      );

      location.reload();

    }

    else{

      alert(
        data.message
      );

    }

  }

  catch(error){

    console.log(error);

  }

}


// ======================
// RECENT ORDERS
// ======================

async function loadRecentOrders(){

  const currentUser =
  JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );

  if(!currentUser){
    return;
  }

  const table =
  document.getElementById(
    "recentOrders"
  );

  if(!table){
    return;
  }

  try{

    const response =
await fetch(
  `${API_URL}/purchase-history`,

      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          email:
          currentUser.email

        })

      }

    );

   const data = await response.json();

console.log("API RESPONSE:", data);

table.innerHTML = "";

// mobile reset
const mobileOrders = document.getElementById("mobileOrders");
if (mobileOrders) {
  mobileOrders.innerHTML = "";
}

// SAFE FIX
const purchases = data.purchases || data.data || data.orders || [];

if (!Array.isArray(purchases) || purchases.length === 0) {
  table.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-6 text-gray-400">
        No orders yet
      </td>
    </tr>
  `;
  return;
}

purchases.slice(0, 5).forEach((item) => {   
    

if(mobileOrders){

  mobileOrders.innerHTML += `
    <div class="bg-gray-50 p-4 rounded-xl border">

      <p class="font-semibold text-gray-800">
        ${item.country || "🌍"} • ${item.service}
      </p>

      <p class="text-gray-600 mt-1">
        ${item.number}
      </p>

      <p class="text-sm mt-2 ${
        item.status === "successful"
          ? "text-green-500"
          : item.status === "cancelled"
          ? "text-red-500"
          : "text-orange-500"
      }">
        ${item.status}
      </p>

    </div>
  `;

}
      table.innerHTML += `

      <tr class="border-b">

        <td class="py-6">
          🌍
        </td>

        <td>
          ${item.number}
        </td>

        <td>
          ${item.service}
        </td>

        <td>
          ${item.status}
        </td>

        <td>
          ${new Date(
            item.createdAt
          ).toLocaleDateString()}
        </td>

      </tr>

      `;

    });

  }

  catch(error){

    console.log(error);

  }

}

loadRecentOrders();

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";

  });

}


const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});