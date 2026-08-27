import { RentType } from "interfaces/Residences/Submit";
import { allowedValuesFor } from "@/api/Residences/getAllowedValues";
import StepTitle from "../../StepTitle";
import OptionTile from "../../OptionTile";
import { useResidenceDraft, useSaveStep } from "../../useWizard";

/**
 * Step 3 — whole place or per room.
 *
 * Was a radio list plus a "save and continue" button in a sticky bar: two taps
 * to answer a two-option question, and the first tap produced nothing the host
 * could act on. It saves on choice now, like the two steps before it, so the
 * wizard behaves the same way three screens running.
 */
function Step3() {
  const options = allowedValuesFor({ step: 3 })?.params?.values as RentType[] | undefined;
  const { data: draft } = useResidenceDraft();
  const { save, pendingKey, isSaving } = useSaveStep(3);

  const current = draft?.params?.residence_info?.rent_type as string | undefined;

  return (
    <>
      <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:max-w-[560px] md:grid-cols-2">
        {(options ?? []).map((option) => (
          <OptionTile
            key={option.id}
            label={option.name}
            description={option.description}
            imageUrl={option.image_url}
            selected={current === option.name}
            pending={pendingKey === option.id}
            dimmed={isSaving && pendingKey !== option.id}
            onSelect={() => save({ key: option.id, data: { rent_type: option.name } })}
          />
        ))}
      </div>
    </>
  );
}

export default Step3;
