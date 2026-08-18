import { useRef } from "react";

function useDialog() {
  const ref = useRef<HTMLDialogElement | null>(null);

  const onOpen = () => {
    if (ref.current) {
      ref.current.showModal();
    }
  };

  const onClose = () => {
    if (ref.current) {
      ref.current.className = "close";
      // setTimeout(() => {
        if (ref.current) {
          ref.current.close();
          ref.current.className = "";
        }
      // }, 400); // this value will match your CSS animation timing
    }
  };

  return { ref, onOpen, onClose };
}

export default useDialog;