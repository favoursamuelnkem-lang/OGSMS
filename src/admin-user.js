const API_URL = "https://ogsms-3.onrender.com";

async function loadUsers() {

    try {

        const response = await fetch(`${API_URL}/admin/users`);

        const data = await response.json();

        const table = document.getElementById("usersTable");

        table.innerHTML = "";

        data.users.forEach((user) => {

            table.innerHTML += `
                <tr class="border-t">
                    <td class="px-6 py-5">${user.fullName}</td>
                    <td class="px-6 py-5">${user.email}</td>
                    <td class="px-6 py-5">₦${user.balance.toLocaleString()}</td>
                    <td class="px-6 py-5">
                        ${new Date(user.createdAt).toLocaleDateString()}
                    </td>
                </tr>
            `;

        });

    } catch (err) {

        console.log(err);

    }

}

loadUsers();