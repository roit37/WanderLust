// WanderLust Client Application Scripts
document.addEventListener("DOMContentLoaded", () => {
    // 1. Auto-dismiss flash alert messages after 5 seconds
    const alerts = document.querySelectorAll(".alert-dismissible");
    alerts.forEach((alert) => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        }, 5000);
    });

    // 2. Bootstrap Client-side Form Validation
    const forms = document.querySelectorAll(".needs-validation");
    Array.from(forms).forEach((form) => {
        form.addEventListener(
            "submit",
            (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add("was-validated");
            },
            false
        );
    });

    // 3. Tax Switch Toggle (on listings index page)
    const taxSwitch = document.getElementById("taxSwitch");
    if (taxSwitch) {
        taxSwitch.addEventListener("change", function () {
            const taxInfoElements = document.querySelectorAll(".tax-info");
            taxInfoElements.forEach((el) => {
                if (this.checked) {
                    el.classList.remove("d-none");
                } else {
                    el.classList.add("d-none");
                }
            });
        });
    }

    // 4. Interactive Live Booking Calculator on Show Page
    const checkInInput = document.getElementById("widgetCheckIn");
    const checkOutInput = document.getElementById("widgetCheckOut");
    const calculationBox = document.getElementById("priceCalculationBox");

    if (checkInInput && checkOutInput && calculationBox && typeof window.LISTING_PRICE !== "undefined") {
        // Set min date to today for check-in
        const todayStr = new Date().toISOString().split("T")[0];
        checkInInput.min = todayStr;

        const updateBookingEstimate = () => {
            const inVal = checkInInput.value;
            const outVal = checkOutInput.value;

            if (inVal) {
                // Ensure checkout min date is at least 1 day after checkin
                const minOut = new Date(inVal);
                minOut.setDate(minOut.getDate() + 1);
                checkOutInput.min = minOut.toISOString().split("T")[0];
            }

            if (inVal && outVal) {
                const start = new Date(inVal);
                const end = new Date(outVal);
                const diffTime = end.getTime() - start.getTime();
                const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (nights > 0) {
                    const pricePerNight = window.LISTING_PRICE;
                    const accommodation = pricePerNight * nights;
                    const cleaningFee = 500;
                    const serviceFee = Math.round(accommodation * 0.05);
                    const grandTotal = accommodation + cleaningFee + serviceFee;

                    document.getElementById("nightlyRateLine").innerText = `₹${pricePerNight.toLocaleString("en-IN")} × ${nights} ${nights === 1 ? 'night' : 'nights'}`;
                    document.getElementById("accommodationTotal").innerText = `₹${accommodation.toLocaleString("en-IN")}`;
                    document.getElementById("serviceFeeTotal").innerText = `₹${serviceFee.toLocaleString("en-IN")}`;
                    document.getElementById("grandTotal").innerText = `₹${grandTotal.toLocaleString("en-IN")}`;

                    calculationBox.classList.remove("d-none");
                    return;
                }
            }
            calculationBox.classList.add("d-none");
        };

        checkInInput.addEventListener("change", updateBookingEstimate);
        checkOutInput.addEventListener("change", updateBookingEstimate);
    }

    // 5. Wishlist AJAX Toggle
    const wishlistForms = document.querySelectorAll(".wishlist-form");
    wishlistForms.forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const button = form.querySelector("button");
            const icon = form.querySelector("i");
            const btnText = form.querySelector(".wishlist-btn-text");

            if (button) button.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    }
                });

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        if (icon) {
                            if (data.isAdded) {
                                icon.classList.remove("fa-regular", "text-white");
                                icon.classList.add("fa-solid", "text-danger");
                            } else {
                                icon.classList.remove("fa-solid", "text-danger");
                                icon.classList.add("fa-regular");
                                if (form.classList.contains("position-absolute")) {
                                    icon.classList.add("text-white");
                                }
                            }
                        }
                        if (btnText) {
                            btnText.innerText = data.isAdded ? "Saved" : "Save";
                        }
                    }
                } else {
                    form.submit();
                }
            } catch (err) {
                form.submit();
            } finally {
                if (button) button.disabled = false;
            }
        });
    });
});
