// ─── INPUT HANDLING ───────────────────────────────────────────
function getAngleFromEvent(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (clientX - rect.left) * scaleX;
  const my = (clientY - rect.top) * scaleY;
  return Math.atan2(my - shooterY, mx - shooterX);
}

function handleAim(clientX, clientY) {
  if (!gameRunning || bubbleInFlight) return false;
  const angle = getAngleFromEvent(clientX, clientY);
  if (angle > -0.12 && angle < 0) return false;
  if (angle < -Math.PI + 0.12 || angle > 0) return false;
  aimAngle = angle;
  return true;
}

function addAimEvents(el) {
  el.addEventListener('mousemove', e => handleAim(e.clientX, e.clientY));
  // Desktop click: aim + shoot instantly
  el.addEventListener('click', e => {
    handleAim(e.clientX, e.clientY);
    shootBubble();
  });
  // Mobile: touchstart aims immediately on tap
  el.addEventListener('touchstart', e => {
    if (e.cancelable) e.preventDefault();
    if (e.touches.length > 0) {
      handleAim(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  // Drag to aim
  el.addEventListener('touchmove', e => {
    if (e.cancelable) e.preventDefault();
    if (e.touches.length > 0) {
      handleAim(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  // Release to shoot
  el.addEventListener('touchend', e => {
    if (e.cancelable) e.preventDefault();
    shootBubble();
  }, { passive: false });
}
