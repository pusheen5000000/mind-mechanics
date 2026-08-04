// Log once the page is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Mind Mechanics Workshop loaded. Ready to play!");
});

// Cursor sparkle trail — spawns a fading sparkle on ~65% of mouse moves
document.addEventListener("mousemove", (e) => {
  if (Math.random() > 0.35) return;

  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  sparkle.style.left = e.pageX + "px";
  sparkle.style.top = e.pageY + "px";
  document.body.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 1500);
});