import { useEffect } from "react";
import ModalHeader from "components/General/core/ModalHeader";

type TModalWrapper = {
  onClose: () => void;
  open: boolean;
  headerTitle?: string; // must be provided in case 'modalHasHeader == false';
  children: React.ReactNode;
  modalClassname?: string;
  headerExtraEl?: JSX.Element;
  headerContainerClassname?: string;
  bodyContainerClassname?: string;
  customOnBackClick?: () => void;
  headerHasGoBackBtn?: boolean;
  modalHasHeader?: boolean;
  canExitOnOutsideClick?: boolean;
  modalHeaderWrapper?: string;
  backdropClassname?: string
};

function ModalWrapper({
  onClose,
  open,
  headerTitle,
  children,
  modalClassname,
  headerExtraEl,
  headerContainerClassname,
  bodyContainerClassname,
  customOnBackClick,
  headerHasGoBackBtn,
  modalHasHeader = true,
  canExitOnOutsideClick = true,
  modalHeaderWrapper,
  backdropClassname
}: TModalWrapper) {
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
      document.body.style.height = "100vh";
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.style.height = "";
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.height = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={`left-0 bottom-0 z-[6] fixed top-0 right-0 bg-[rgba(24,39,58,0.7)] ${backdropClassname || ""}`}
        onClick={() => {
          if (!!canExitOnOutsideClick) {
            onClose();
          }
        }}
      />
      <div
        className={`
          h-screen md:h-auto md:max-w-[80%] md:max-h-[80%]
          fixed top-0 md:top-1/2 right-0 md:right-1/2 md:translate-x-1/2 md:-translate-y-1/2
          left-0 md:left-auto bottom-0 md:bottom-auto
          bg-white z-[11] overflow-y-auto md:shadow-[0px_8px_32px_rgba(24,39,58,0.15)] md:rounded-20
          ${modalClassname || ""}
        `}
      >
        {!!modalHasHeader && (
          <div
            className={`fixed md:sticky right-0 left-0 top-0 bg-white z-[6] ${
              headerContainerClassname || ""
            }`}
          >
            <ModalHeader
              containerClassname={modalHeaderWrapper}
              hasGoBack={headerHasGoBackBtn}
              headerTitle={headerTitle || ""}
              onBackClick={() => {
                if (!!customOnBackClick) {
                  customOnBackClick();
                } else {
                  onClose();
                }
              }}
            />
            {!!headerExtraEl && headerExtraEl}
          </div>
        )}

        <div className={`px-20 pb-40 pt-80 md:pt-0 ${bodyContainerClassname || ""}`}>
          {children}
        </div>
      </div>
    </>
  );
}
export default ModalWrapper;
