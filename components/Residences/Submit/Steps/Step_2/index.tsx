import StepTitle from "../../StepTitle";
import OptionTile from "../../OptionTile";
import { useResidenceDraft, useSaveStep, useWizardOptions } from "../../useWizard";

/**
 * Step 2 — which part of the country.
 *
 * Reads the draft so a host returning to a saved residence sees their previous
 * answer already marked, instead of a grid that looks untouched. The draft is
 * the same cached object every other step reads, so this costs no request.
 */
function Step2() {
  const options = useWizardOptions("REGION", 2);
  const { raw } = useResidenceDraft();
  const { save, pendingKey, isSaving } = useSaveStep(2);

  const current = raw?.region as string | undefined;

  return (
    <>
      <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

      <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4">
        {options.map((option) => (
          <OptionTile
            key={option.id}
            label={option.name}
            description={option.description ?? undefined}
            imageUrl={option.image_url ?? undefined}
            selected={current === option.name}
            pending={pendingKey === option.id}
            dimmed={isSaving && pendingKey !== option.id}
            onSelect={() => save({ key: option.id, data: { res_region: option.name } })}
          />
        ))}
      </div>
    </>
  );
}

export default Step2;
