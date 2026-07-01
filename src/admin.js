const API_URL = "https://ogsms-3.onrender.com";

async function loadDashboard() {

    try {

        const response = await fetch(`${API_URL}/admin/dashboard`);

        const data = await response.json();

        console.log(data);

    } catch (error) {

        console.log(error);

    }

}

loadDashboard();