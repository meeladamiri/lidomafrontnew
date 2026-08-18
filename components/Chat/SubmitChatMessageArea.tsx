import Image from "next/image";
import { useRef } from "react";
import { TextField } from "../General/core/TextField";

function SubmitChatMessageArea({
  formik,
  possibilityOfEnteringPhoneNumber,
  isCompletePhoneNumber,
  hasBorderTop,
  canAttachFiles,
  containerClassname,
}: {
  formik: any;
  possibilityOfEnteringPhoneNumber: boolean;
  isCompletePhoneNumber: boolean;
  hasBorderTop?: boolean;
  canAttachFiles: boolean;
  containerClassname?: string;
}) {
  const attachFilesInputRef = useRef<any>(null);

  return (
    <div>
      {!!possibilityOfEnteringPhoneNumber && (
        <div className="px-20 mb-8">
          <span className="text-error-light text-14 leading-24 font-b">توجه : </span>
          <span className="text-error-light text-12 leading-20 font-r">
            تبادل شماره تماس تا قبل از قطعی شدن رزرو، خلاف قوانین سایت می باشد و در صورت انجام این
            کار ، حساب کاربری شما مسدود خواهد شد
          </span>
        </div>
      )}

      <div
        className={`
            py-16 px-20 bg-white
            ${!!hasBorderTop ? "border-t-1 border-solid border-t-gray-D2D2D7" : ""}
            ${containerClassname || ""}
        `}
      >
        <form onSubmit={formik.handleSubmit}>
          <div className="flex items-center gap-x-12">
            <TextField
              name="messageTextInput"
              formik={formik}
              placeholder="متن پیام شما"
              wrapperClassname="!rounded-full"
              noValidationErrorText
              rightIcon={
                canAttachFiles ? (
                  <Image
                    src="/assets/non-icomoon-icons/gire.svg"
                    width={18}
                    height={19}
                    alt=""
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      attachFilesInputRef.current?.click();
                    }}
                  />
                ) : undefined
              }
            />

            {!!canAttachFiles && (
              <input
                hidden
                ref={attachFilesInputRef}
                type="file"
                accept="application/pdf,image/*"
                multiple={true}
                // onChange={(e) => onFileChange(e)}
              />
            )}

            <div
              onClick={() => {
                // if (!formik.values.messageTextInput || possibilityOfEnteringPhoneNumber) return;

                formik.handleSubmit();
              }}
              className={`
                  h-40 w-40 flex shrink-0 items-center justify-center
                  rounded-full bg-primary-main cursor-pointer
                  ${
                    !formik.values.messageTextInput || possibilityOfEnteringPhoneNumber
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }
                `}
            >
              <i className="icon-SendMessage text-24 text-white" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitChatMessageArea;
