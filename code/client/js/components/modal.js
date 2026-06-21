// Renders into the <div id="modal-root"> that's already in every page's
// HTML. Two layers of API:
//
// - openModal(...)        - the general building block: any title, any
//                            content (string or a pre-built element), any
//                            number of buttons. This is what replaces
//                            prompt() - pass it a <form> you built and read
//                            its values yourself when your button's onClick fires.
// - showConfirmModal(...) - a convenience wrapper around openModal for the
//                            single most common case (yes/no), returning a
//                            Promise<boolean> so call sites read like
//                            `if (await showConfirmModal(...))`, the async
//                            equivalent of confirm().

function getModalRoot() {
  return document.getElementById("modal-root");
}

// Builds and shows one modal. Returns a `close()` function so the caller
// can dismiss it programmatically (e.g. after a successful form submit).
//
// `onDismiss` fires only when the modal is closed *without* one of the
// `actions` buttons being clicked (Escape key, or clicking the dimmed
// backdrop) - it exists so wrappers like showConfirmModal can still settle
// their Promise in that case instead of leaving an awaiting caller hanging
// forever.
function openModal({ title, content, actions = [], onDismiss }) {
  const root = getModalRoot();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";

  const modal = document.createElement("div");
  modal.className = "modal";

  const heading = document.createElement("h2");
  heading.className = "modal__title";
  heading.textContent = title;

  const body = document.createElement("div");
  body.className = "modal__body";
  if (typeof content === "string") {
    body.textContent = content;
  } else {
    body.appendChild(content);
  }

  const footer = document.createElement("div");
  footer.className = "modal__footer";

  let dismissedByAction = false;

  function close() {
    backdrop.remove();
    document.removeEventListener("keydown", handleKeydown);
  }

  function dismiss() {
    close();
    if (!dismissedByAction) {
      onDismiss?.();
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") dismiss();
  }

  // Each action gets its own button. The action's onClick receives `close`
  // so it decides *when* to dismiss - e.g. a form action might want to
  // validate first and keep the modal open on failure.
  actions.forEach(({ label, variant = "secondary", onClick }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = `modal__action modal__action--${variant}`;
    button.addEventListener("click", () => {
      dismissedByAction = true;
      onClick(close);
    });
    footer.appendChild(button);
  });

  modal.append(heading, body, footer);
  backdrop.appendChild(modal);

  // Clicking the dimmed backdrop (but not the modal box itself) dismisses it,
  // same expectation users already have from every other modal they've used.
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) dismiss();
  });
  document.addEventListener("keydown", handleKeydown);

  root.appendChild(backdrop);

  return close;
}

// Replaces confirm(). Resolves true if the user confirmed, false if they
// cancelled, dismissed via Escape, or clicked the backdrop - every path
// settles the Promise exactly once, so an `await showConfirmModal(...)`
// can never hang.
function showConfirmModal({ title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Cancel" } = {}) {
  return new Promise((resolve) => {
    openModal({
      title,
      content: message,
      onDismiss: () => resolve(false),
      actions: [
        { label: cancelLabel, variant: "secondary", onClick: (close) => { close(); resolve(false); } },
        { label: confirmLabel, variant: "primary", onClick: (close) => { close(); resolve(true); } },
      ],
    });
  });
}

export { openModal, showConfirmModal };
