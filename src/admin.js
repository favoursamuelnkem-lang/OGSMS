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


const purchaseResponse = await fetch(`${API_URL}/admin/recent-purchases`);

const purchaseData = await purchaseResponse.json();

const table = document.getElementById("purchaseTable");

table.innerHTML = "";

purchaseData.purchases.forEach((purchase) => {

    table.innerHTML += `
        <tr class="border-t">
            <td class="px-6 py-5">${purchase.userEmail}</td>
            <td class="px-6 py-5">${purchase.number}</td>
            <td class="px-6 py-5">${purchase.service}</td>
            <td class="px-6 py-5">₦${purchase.price}</td>
            <td class="px-6 py-5">${purchase.status}</td>
            <td class="px-6 py-5">${new Date(purchase.createdAt).toLocaleDateString()}</td>
        </tr>
    `;

});
    } catch (error) {

        console.log(error);

    }

}

loadDashboard();