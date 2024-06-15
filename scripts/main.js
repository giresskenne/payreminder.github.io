// Script pour gérer le tableau de bord de l'utilisateur

// Fonction pour déconnecter l'utilisateur
function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'index.html';
        } else {
            alert('Erreur lors de la déconnexion');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Charger les données de l'utilisateur
window.onload = function() {
    fetch('/user')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('username').textContent = data.username;
            const payments = data.payments;
            const paymentsContainer = document.getElementById('payments');
            payments.forEach(payment => {
                const paymentElement = document.createElement('div');
                paymentElement.classList.add('payment');
                paymentElement.textContent = `${payment.name}: ${payment.amount} $ - ${payment.dueDate}`;
                paymentsContainer.appendChild(paymentElement);
            });
        } else {
            window.location.href = 'login.html';
        }
    })
    .catch(error => console.error('Error:', error));
};
