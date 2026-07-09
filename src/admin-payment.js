const API_URL = "https://ogsms-3.onrender.com";

async function loadPayments() {

    try {

        const response = await fetch(`${API_URL}/admin/payments`);

        const data = await response.json();

        const table = document.getElementById("paymentTransactionTable");

        table.innerHTML = "";

        document.getElementById("totalTransactions").textContent = data.payments.length;

        document.getElementById("successfulTransactions").textContent =
            data.payments.filter(p => p.status === "Successful").length;

        document.getElementById("pendingTransactions").textContent =
            data.payments.filter(p => p.status === "Pending").length;

        document.getElementById("failedTransactions").textContent =
            data.payments.filter(p => p.status === "Failed").length;

        data.payments.forEach((payment) => {

            table.innerHTML += `
                <tr class="border-t">
                    <td class="px-6 py-5">${payment.customer}</td>
                    <td class="px-6 py-5">₦${payment.amount.toLocaleString()}</td>
                    <td class="px-6 py-5">${payment.transactionId}</td>
                    <td class="px-6 py-5">${payment.method}</td>
                    <td class="px-6 py-5">
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            ${payment.status}
                        </span>
                    </td>
                    <td class="px-6 py-5">${new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
            `;

        });

    } catch (err) {

        console.log(err);

    }

}

loadPayments();