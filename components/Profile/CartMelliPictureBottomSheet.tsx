import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMizbanCartMelli } from "api/Profile";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import Upload from "components/General/Image/Upload";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import exception from "utilities/exception";

function CartMelliPictureBottomSheet({
  handleSmoothClose,
  prevCartMelli,
}: {
  handleSmoothClose: THandleSmoothClose;
  prevCartMelli: string;
}) {
  const [cartMelliImage, setCartMelliImage] = useState<FileReader["result"]>(prevCartMelli);
  const [profileImagePreview, setProfileImagePreview] = useState<FileReader["result"]>();

  const queryClient = useQueryClient();

  const [imageIsLoaded, setImageIsLoaded] = useState(false);

  const initialValueRef = useRef(prevCartMelli);

  const uploadCartMelliMutation = useMutation(
    () => {
      return uploadMizbanCartMelli({ image: cartMelliImage });
    },
    {
      onSuccess: (data) => {
        if (data?.data?.status === "success") {
          queryClient.invalidateQueries(["getAccountInfo"]);

          exception.message([
            {
              type: EXCEPTIONTYPES.SUCCESS,
              title: "تصویر کارت ملی با موفقیت ذخیره شد.",
            },
          ]);

          handleSmoothClose();
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.data?.err_msg || defaultError,
            },
          ]);
        }
      },
    }
  );

  const handleUploadCartMelli = () => {
    uploadCartMelliMutation.mutate();
  };

  useEffect(() => {
    if (!!cartMelliImage) {
      setImageIsLoaded(true);
    }
  }, [cartMelliImage]);

  return (
    <div>
      {!cartMelliImage ? (
        <Upload
          text="تصویر کارت ملی خود را بارگذاری کنید"
          image={cartMelliImage}
          setImage={setCartMelliImage}
          setImagePreview={setProfileImagePreview}
        />
      ) : (
        <div className="w-full h-[214px] relative">
          <Image
            src={cartMelliImage as string}
            style={{ objectFit: "cover" }}
            fill
            alt=""
            className="rounded-12"
          />

          <div
            className="w-40 h-40 rounded-full bg-error-light absolute flex items-center justify-center top-12 left-12"
            onClick={() => setCartMelliImage(null)}
          >
            <i className="icon-Delete text-24 text-white" />
          </div>
        </div>
      )}

      {/* actions */}
      <div className="mt-32">
        <div className="grid grid-cols-3 gap-x-12">
          <div className="col-span-1">
            <Button isFullWidth color="grey" onClick={handleSmoothClose} type="button">
              انصراف
            </Button>
          </div>
          <div className="col-span-2">
            <Button
              isFullWidth
              type="submit"
              disabled={!cartMelliImage || initialValueRef.current === cartMelliImage}
              onClick={() => handleUploadCartMelli()}
            >
              ذخیره
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartMelliPictureBottomSheet;
