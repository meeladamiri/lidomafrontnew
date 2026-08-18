import { Button } from "@/components/General/core/Button";

function GeneralFiltersModalActions({
  onApplyFiltersClick,
  onDeleteAllFiltersClick,
}: {
  onApplyFiltersClick: () => void;
  onDeleteAllFiltersClick: () => void;
}) {
  return (
    <div
      className="fixed md:sticky bottom-0 right-0 left-0 z-2"
      style={{
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white px-20 md:px-0 py-16">
        <div className="grid grid-cols-5 gap-x-12">
          <div className="col-span-2">
            <Button isFullWidth color="grey" onClick={onDeleteAllFiltersClick}>
              حذف فیلترها
            </Button>
          </div>
          <div className="col-span-3">
            <Button isFullWidth type="submit" onClick={onApplyFiltersClick}>
              اعمال فیلترها
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralFiltersModalActions;
