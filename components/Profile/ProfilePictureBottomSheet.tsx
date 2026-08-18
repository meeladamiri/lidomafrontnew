import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { useEffect, useRef, useState } from "react";
import Upload from "components/General/Image/Upload";
import Photoshop from "components/General/Image/Photoshop";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMizbanAvatar } from "api/Profile";
import exception from "utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { ReactCropperElement } from "react-cropper";
import classes from "@/styles/cropperjs-manual.module.css";

function ProfilePictureBottomSheet({
  handleSmoothClose,
  prevProfileImage,
}: {
  handleSmoothClose: THandleSmoothClose;
  prevProfileImage: string;
}) {
  const [profileImage, setProfileImage] = useState<FileReader["result"]>(prevProfileImage);
  const [profileImagePreview, setProfileImagePreview] = useState<FileReader["result"]>();
  const queryClient = useQueryClient();
  const [imageIsLoaded, setImageIsLoaded] = useState(false);

  const uploadMizbanAvatarMutation = useMutation(
    (img: any) => {
      return uploadMizbanAvatar({ image: img });
    },
    {
      onSuccess: (data) => {
        if (data?.data?.status === "success") {
          queryClient.invalidateQueries(["getAccountInfo"]);

          exception.message([
            {
              type: EXCEPTIONTYPES.SUCCESS,
              title: "عکس با موفقیت ذخیره شد.",
            },
          ]);

          handleSmoothClose();
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || defaultError,
            },
          ]);
        }
      },
    }
  );

  // const deleteMizbanAvatarMutation = useMutation(() => deleteMizbanAvatar(), {
  //   onSuccess: (data) => {
  //     if (data?.status === "success") {
  //       console.log("At onSuccess of deleteMizbanAvatarMutation, data is: ", data);
  //       const croppedImageToBeUploaded = getFinalCroppedImage();

  //       uploadMizbanAvatarMutation.mutate(croppedImageToBeUploaded);
  //     } else {
  //       exception.message([
  //         {
  //           type: EXCEPTIONTYPES.ERROR,
  //           title: "مشکلی در حذف عکس پروفایل رخ داد. لطفا مجددا تلاش کنید.",
  //         },
  //       ]);
  //     }
  //   },
  // });

  useEffect(() => {
    if (!!profileImage) {
      setImageIsLoaded(true);
    }
  }, [profileImage]);

  // Cropper Utilities
  const cropperRef = useRef<ReactCropperElement>(null);
  const onCrop = () => {
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    // console.log(cropper.getCroppedCanvas().toDataURL());
  };

  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const rotate = (deg: number) => {
    const imageElement = cropperRef?.current;
    const cropper = imageElement?.cropper;
    cropper?.rotate(deg);
  };

  const flip = (type: "h" | "v") => {
    const imageElement = cropperRef?.current;
    const cropper = imageElement?.cropper;
    if (type === "h") {
      cropper?.scaleX(scaleX === 1 ? -1 : 1);
      setScaleX(scaleX === 1 ? -1 : 1);
    } else {
      cropper?.scaleY(scaleY === 1 ? -1 : 1);
      setScaleY(scaleY === 1 ? -1 : 1);
    }
  };

  const getFinalCroppedImage = () => {
    const imageElement = cropperRef?.current;
    const cropper = imageElement?.cropper;
    const img = cropper?.getCroppedCanvas().toDataURL();
    // getCroppedFile(img);
    return img;
  };

  function handleSubmit() {
    const croppedImageToBeUploaded = getFinalCroppedImage();

    if (!!croppedImageToBeUploaded) {
      uploadMizbanAvatarMutation.mutate(croppedImageToBeUploaded);
    } else {
      exception.message([
        { type: EXCEPTIONTYPES.ERROR, title: "مشکلی در ادیت عکس مورد نظر رخ داد." },
      ]);
    }
  }

  return (
    <div>
      {!profileImage ? (
        <Upload
          text="تصویر پروفایل خود را بارگذاری کنید"
          image={profileImage}
          setImage={setProfileImage}
          setImagePreview={setProfileImagePreview}
        />
      ) : (
        <>
          <div className={`w-full relative ${classes["cropperjs-manual-wrapper"]}`}>
            {!!imageIsLoaded && (
              <Cropper
                src={profileImage as any}
                // style={{ height: 400, width: "100%" }}
                className="h-[240px] md:h-320 w-full"
                // Cropper.js options
                initialAspectRatio={1 / 1}
                guides={true}
                crop={onCrop}
                ref={cropperRef}
                rotatable
                enable={true}
              />
            )}
          </div>

          <div className="mt-16">
            <Photoshop
              profileImage={profileImage}
              handleRotate90cw={() => rotate(90)}
              handleRotate90ccw={() => rotate(-90)}
              handleFlipVertical={() => flip("v")}
              handleFlipHorizontal={() => flip("h")}
              handleDelete={() => {
                setProfileImage(null);
                setProfileImagePreview(undefined);
                setImageIsLoaded(false);
              }}
            />
          </div>
        </>
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
              disabled={!profileImage || prevProfileImage === profileImage}
              onClick={() => handleSubmit()}
            >
              ذخیره
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePictureBottomSheet;
