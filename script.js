const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const buyButton = document.getElementById("buy-button");
if (buyButton) {
  buyButton.addEventListener("click", (event) => {
    event.preventDefault();
    alert(
      "L'etape paiement mobile est la prochaine phase. Je peux maintenant te brancher Orange Money / MTN / Wave."
    );
  });
}
