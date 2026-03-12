const MOCK_RATE = 0.211; // JPY to TWD

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rate-display').textContent = MOCK_RATE;
    const jpyInput = document.getElementById('jpy-input');
    const twdResult = document.getElementById('twd-result');

    jpyInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) {
            twdResult.textContent = '0';
        } else {
            twdResult.textContent = Math.round(val * MOCK_RATE).toLocaleString();
        }
    });
});

function setJpy(amount) {
    const input = document.getElementById('jpy-input');
    input.value = amount;
    // trigger event
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
}
