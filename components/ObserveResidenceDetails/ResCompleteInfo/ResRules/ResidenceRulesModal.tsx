import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Textarea } from "@/components/General/core/Textarea";

function ResidenceRulesModal({
  isModalOpen,
  handleClose,
  data,
  hostSpecificRules,
  childFreePriceText,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  data: { icon: JSX.Element; text: string }[];
  hostSpecificRules?: string;
  childFreePriceText: string;
}) {
  return (
    <ModalWrapper
      headerTitle="مقررات اقامتگاه"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      modalClassname="md:!w-[560px]"
    >
      {data.map((item, idx) => {
        if (!item.text) return;

        return (
          <div className="flex items-center gap-x-8 mb-16 last:mb-0" key={idx}>
            {item.icon}
            <p className="text-14 leading-30 font-r text-zilgara">{item.text}</p>
          </div>
        );
      })}

      {(!!hostSpecificRules || !!childFreePriceText) && (
        <div className="mt-16 border-t-1 border-solid border-[rgba(28,52,84,0.26)]"></div>
      )}

      {!!hostSpecificRules && (
        <div className="mt-16">
          <Textarea
            name="host-specific-rules"
            label="قوانین مختص میزبان"
            readonly={true}
            customValue={hostSpecificRules}
            labelClassname="!text-14 !leading-20 !text-black !font-r"
            rows={4}
            // textareaClassnames="border-none typical-gray-bg"
          />
        </div>
      )}

      {!!childFreePriceText && (
        <div className="text-12 leading-17 text-black font-r p-12 text-center border-1 border-dashed border-gray-CACFD3 mt-16 rounded-8">
          {childFreePriceText}
        </div>
      )}
    </ModalWrapper>
  );
}

export default ResidenceRulesModal;
