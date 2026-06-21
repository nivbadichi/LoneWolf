function getToastRoot() {
  let root = document.getElementById("toast-root");

  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }

  return root;
}

export function showToast(message, type = "success") {
  const root = getToastRoot();

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  root.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
