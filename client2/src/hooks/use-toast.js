// Inspired by react-hot-toast library
import * as React from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

/**
 * Produce a new numeric ID as a string by incrementing the module-level counter.
 *
 * Increments the internal `count`, wraps at Number.MAX_SAFE_INTEGER back to 0, and
 * returns the resulting value as a string.
 *
 * @returns {string} A new ID string.
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners = [];

let memoryState = { toasts: [] };

/**
 * Apply an action to the in-memory toast state and notify all subscribers.
 *
 * @param {{type: string, [key: string]: any}} action - Action object consumed by the reducer (e.g., `{ type: 'ADD_TOAST', ... }`); merged into state by the reducer and then broadcast to all listeners.
 */
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Create and show an in-memory toast and return controls for it.
 *
 * Creates a new toast with a generated `id`, marks it open, and dispatches an ADD_TOAST action into the in-memory store.
 * The provided `props` are merged into the toast object; the created toast receives an `onOpenChange` handler that
 * calls `dismiss()` when the toast is closed, and will be scheduled for removal after dismissal.
 *
 * @param {Object} props - Arbitrary toast properties (e.g., title, description, intent, duration). These are merged
 * into the created toast object.
 * @returns {{id: string, dismiss: function(): void, update: function(Object): void}} An object containing:
 *  - id: the generated toast id,
 *  - dismiss(): dismisses this toast (dispatches DISMISS_TOAST for the id),
 *  - update(props): merges `props` into the existing toast (dispatches UPDATE_TOAST for the id).
 */
function toast({ ...props }) {
  const id = genId();

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * React hook that exposes the in-memory toast store and control helpers.
 *
 * Subscribes the component to the shared in-memory toast state and keeps it
 * synchronized. Returns the current state spread (including `toasts`), the
 * `toast` factory for creating toasts, and a `dismiss(toastId)` helper to
 * programmatically dismiss a toast.
 *
 * The hook registers a listener on mount and removes it on unmount so the
 * consumer receives updates when the global toast state changes.
 *
 * @return {{ toasts: Array, toast: Function, dismiss: (toastId?: string) => void }} Current toast state and control helpers.
 */
function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { reducer, toast, useToast };
