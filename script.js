document.addEventListener('DOMContentLoaded', () => {

    const selectionBoxes = document.querySelectorAll('.option-box');
    const proceedBtn = document.getElementById('proceed-to-payment');

    if (selectionBoxes.length > 0) {
        // Function to update the Proceed button state
        const updateProceedButton = (box) => {
            const name = box.dataset.name;
            // Parse base price
            const priceText = box.querySelector('p:nth-child(2)').textContent;
            const priceMatch = priceText.match(/BDT\s*([\d,]+)/);
            let basePrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

            // Get inputs
            const nightsInput = box.querySelector('.nights-input');
            const bedInput = box.querySelector('.bed-input');
            const personsInput = box.querySelector('.persons-input');

            let finalPrice = basePrice;
            let queryParams = new URLSearchParams(window.location.search);

            // Hotel Logic
            if (nightsInput && bedInput) {
                const nights = parseInt(nightsInput.value) || 1;
                const bedType = bedInput.value;
                let multiplier = 1;
                if (bedType === 'Double') multiplier = 1.2;
                if (bedType === 'King') multiplier = 1.5;

                finalPrice = Math.round(basePrice * multiplier * nights);

                queryParams.set('hotelName', name);
                queryParams.set('hotelPrice', finalPrice); // Send TOTAL hotel price
                queryParams.set('nights', nights);
                queryParams.set('bed', bedType);
            }
            // Transport Logic
            else if (personsInput) {
                const persons = parseInt(personsInput.value) || 1;
                finalPrice = Math.round(basePrice * persons);

                queryParams.set('transportName', name);
                queryParams.set('transportPrice', finalPrice); // Send TOTAL transport price
                queryParams.set('persons', persons);
            }

            // Update URL
            const currentUrl = new URL(proceedBtn.href, window.location.origin);
            queryParams.forEach((value, key) => currentUrl.searchParams.set(key, value));

            // Check destination structure
            const targetPage = currentUrl.pathname.split('/').pop();

            if (targetPage === 'transport.html') {
                proceedBtn.textContent = `Proceed to Transport (BDT ${new Intl.NumberFormat().format(finalPrice)})`;
            } else if (targetPage === 'payment.html') {
                const hotelPrice = parseInt(queryParams.get('hotelPrice') || '0');
                const total = hotelPrice + finalPrice;
                proceedBtn.textContent = `Pay Total BDT ${new Intl.NumberFormat().format(total)} (Proceed)`;
            }

            proceedBtn.href = currentUrl.toString();
            proceedBtn.style.opacity = '1';
        };

        selectionBoxes.forEach(box => {
            // Click on the box itself
            box.addEventListener('click', () => {
                selectionBoxes.forEach(b => b.classList.remove('selected'));
                box.classList.add('selected');
                updateProceedButton(box);
            });

            // Input changes inside the box
            const inputs = box.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    if (box.classList.contains('selected')) {
                        updateProceedButton(box);
                    }
                });
                // Ensure clicking input selects the box too if not selected
                input.addEventListener('click', () => {
                    if (!box.classList.contains('selected')) {
                        box.click();
                    }
                });
            });
        });
    }

    // --- Payment Page Logic ---
    const paymentForm = document.getElementById('payment-form');
    const paymentNotification = document.getElementById('paid-notification');

    if (paymentForm && paymentNotification) {
        paymentForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent actual form submission

            // Basic validation
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked');

            if (selectedMethod) {
                // Simulate payment success
                paymentForm.style.display = 'none'; // Hide the form
                paymentNotification.style.display = 'block'; // Show the PAID notification

                // Optional: Scroll to the notification
                paymentNotification.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Please select a payment method.');
            }
        });
    }
});