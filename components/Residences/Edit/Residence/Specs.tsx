import { Select } from "components/General/core/Select";
import { Textarea } from "components/General/core/Textarea";
import { TextField } from "components/General/core/TextField";
import { IEditResidence_SpecsInitV } from "interfaces/Residences/Edit/Residence/Specs";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";

const ProjectMap = dynamic(() => import("components/Map"), {
  ssr: false,
});
const ProvincesListModal = dynamic(() => import("components/General/Address/ProvincesListModal"), {
  ssr: true,
});
const CitiesListModal = dynamic(() => import("components/General/Address/CitiesListModal"), {
  ssr: true,
});

const EditResidenceSpecs = ({
  residenceSpecsV,
  setResidenceSpecsV,
  showProvincesListModal,
  setShowProvincesListModal,
  showCitiesListModal,
  setShowCitiesListModal,

  residenceSpecsFormik,
}: {
  residenceSpecsV: IEditResidence_SpecsInitV;
  setResidenceSpecsV: Dispatch<SetStateAction<IEditResidence_SpecsInitV>>;
  showProvincesListModal: boolean;
  setShowProvincesListModal: Dispatch<SetStateAction<boolean>>;
  showCitiesListModal: boolean;
  setShowCitiesListModal: Dispatch<SetStateAction<boolean>>;
  residenceSpecsFormik: any;
}) => {
  return (
    <div className="">
      <form onSubmit={residenceSpecsFormik.handleSubmit}>
        <div className="mb-16">
          <TextField
            name="resName"
            label="نام اقامتگاه"
            formik={residenceSpecsFormik}
            subLable="برای انتخاب اسم، از کلمات کوتاه و متناسب فضای اقامتگاه خود استفاده کنید"
            placeholder="مانند : ویلای ساحلی رامسر"
          />
        </div>

        <div className="mb-16">
          <Textarea
            name="aboutResidence"
            formik={residenceSpecsFormik}
            rows={6}
            autoResize
            placeholder="مانند : ویلای ساحلی رامسر با پنجره ای رو به دریا و یک بالکن رو به ..."
            label="درباره اقامتگاه"
            subLable="درباره ویژگی ها و هرآنچه اقامتگاه شما را منحصر به فرد میکند بنویسید"
          />
        </div>

        <div
          className="mb-16"
          onClick={() => {
            setShowProvincesListModal(true);
          }}
        >
          <Select
            name={"select-province"}
            placeholder={"انتخاب کنید"}
            labelText="استان"
            readOnly={true}
            data={[].map((_, i) => "")}
            formik={residenceSpecsFormik}
            keyValue="name"
          />
        </div>

        <div
          className="mb-16"
          onClick={() => {
            if (!residenceSpecsFormik?.values?.["select-province"]) return;
            setShowCitiesListModal(true);
          }}
        >
          <Select
            name={"select-city"}
            placeholder={"انتخاب کنید"}
            disabled={!residenceSpecsFormik?.values?.["select-province"]}
            labelText="شهر"
            readOnly={true}
            data={[].map((_, i) => "")}
            formik={residenceSpecsFormik}
          />
        </div>

        <div className="mb-16">
          <TextField
            name="neighborhood"
            label="محله"
            placeholder="مثال : کله سهی"
            formik={residenceSpecsFormik}
          />
        </div>

        <div className="mb-38">
          <Textarea
            label="آدرس دقیق"
            name="exactAddress"
            rows={3}
            placeholder="مانند : شیراز، بلوار چمران، ابیوردی 3 ، کوچه 7، پلاک36"
            formik={residenceSpecsFormik}
          />
        </div>

        <div className="mb-16">
          <p className="text-14 leading-24 text-zilgara font-m mb-8">مکان اقامتگاه بر روی نقشه</p>

          <div className="w-full aspect-square">
            {/* map */}
            <ProjectMap
              // userLat={userLat}
              // userLang={userLang}
              // setUserLat={setUserLat}
              // setUserLang={setUserLang}
              showZoomControl={false}
              mapClassname="rounded-12"
              formik={residenceSpecsFormik}
              name="reslatlng"
            />
          </div>
        </div>

        <div className="mb-16">
          <TextField
            name="totalArea"
            inputmode="numeric"
            label="مساحت کل زمین اقامتگاه"
            formik={residenceSpecsFormik}
            leftIcon={<span className="text-12 leading-21 text-black font-l">متر</span>}
          />
        </div>

        <div className="mb-16">
          <TextField
            name="infraArea"
            label="مساحت زیربنای اقامتگاه"
            inputmode="numeric"
            formik={residenceSpecsFormik}
            leftIcon={<span className="text-12 leading-21 text-black font-l">متر</span>}
          />
        </div>

        <div className="">
          <TextField
            name="floor"
            label="طبقه"
            formik={residenceSpecsFormik}
            placeholder="مثال : همکف"
          />
        </div>
      </form>

      {!!showProvincesListModal && (
        <ProvincesListModal
          isModalOpen={showProvincesListModal}
          handleClose={() => setShowProvincesListModal(false)}
          handleAfterSelect={() => setShowCitiesListModal(true)}
          provinceInputName={"select-province"}
          cityInputName={"select-city"}
          formik={residenceSpecsFormik}
        />
      )}

      {!!showCitiesListModal && (
        <CitiesListModal
          isModalOpen={showCitiesListModal}
          handleClose={() => setShowCitiesListModal(false)}
          handleGoBack={() => setShowProvincesListModal(true)}
          provinceInputName={"select-province"}
          cityInputName={"select-city"}
          formik={residenceSpecsFormik}
        />
      )}
    </div>
  );
};

export default EditResidenceSpecs;
