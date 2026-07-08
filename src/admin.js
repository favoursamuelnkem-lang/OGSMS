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


const cards = document.getElementById("purchaseCards");

cards.innerHTML = "";

purchaseData.purchases.forEach((purchase) => {

    cards.innerHTML += `
        <div class="border rounded-2xl p-5 shadow-sm">

            <div class="flex justify-between items-center">

                <h3 class="font-bold text-[#0B4F63]">
                    ${purchase.userEmail}
                </h3>

                <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                    ${purchase.status}
                </span>

            </div>

            <div class="mt-4 space-y-2 text-sm">

                <div class="flex justify-between">
                    <span class="text-gray-500">Number</span>
                    <span>${purchase.number}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Service</span>
                    <span>${purchase.service}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Price</span>
                    <span>₦${purchase.price}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Date</span>
                    <span>${new Date(purchase.createdAt).toLocaleDateString()}</span>
                </div>

            </div>

        </div>
    `;

});
    } catch (error) {

        console.log(error);

    }

}

loadDashboard();