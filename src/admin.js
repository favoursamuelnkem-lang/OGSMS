const API_URL = "https://ogsms-3.onrender.com";

async function loadDashboard() {

    try {

        const response = await fetch(`${API_URL}/admin/dashboard`);

        const data = await response.json();

        console.log(data);

        document.getElementById("totalUsers").textContent = data.totalUsers;
document.getElementById("numbersSold").textContent = data.numbersSold;
document.getElementById("pendingOrders").textContent = data.pendingOrders;
document.getElementById("cancelledOrders").textContent = data.cancelledOrders;
document.getElementById("totalRevenue").textContent =
"₦" + data.totalRevenue.toLocaleString();

document.getElementById("walletBalance").textContent =
"₦" + data.totalWallet.toLocaleString();
    } catch (error) {

        console.log(error);

    }

}

loadDashboard();