import { ResType } from "interfaces/Residences/Submit";
import { allowedValuesFor } from "@/api/Residences/getAllowedValues";
import StepTitle from "../../StepTitle";
import OptionTile from "../../OptionTile";
import { useSaveStep } from "../../useWizard";

/**
 * Step 1 — the kind of place.
 *
 * The first request the wizard makes is the one that creates the residence,
 * so this step genuinely has to wait for the server before it can move on:
 * every later step is keyed by the id it returns. What it no longer does is
 * wait in silence.
 */
function Step1() {
  const options = allowedValuesFor({ step: 1 })?.params?.values as ResType[] | undefined;
  const { save, pendingKey, isSaving } = useSaveStep(1);

  return (
    <>
      <StepTitle wrapperClassname="mt-16 md:mt-0 mb-24" />

      <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4">
        {(options ?? []).map((option) => (
          <OptionTile
            key={option.id}
            label={option.name}
            imageUrl={option.image_url}
            pending={pendingKey === option.id}
            dimmed={isSaving && pendingKey !== option.id}
            onSelect={() => save({ key: option.id, data: { res_type: option.name } })}
          />
        ))}
      </div>
    </>
  );
}

export default Step1;
