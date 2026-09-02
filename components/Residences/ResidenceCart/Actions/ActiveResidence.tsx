import { I_Residence_display_type } from "@/interfaces/Residences";
import { applySessionStorageValues_residences_list } from "@/constants/session_stores/residences_list";
import { LinkButton } from "components/General/core/Button";
import { ResidenceTypes_enum } from "constants/enums/residence_types";

/**
 * What a host can do to a listing from the list.
 *
 * One action: edit it. There were four — calendar, instant booking, bulk
 * pricing, edit — repeated on every card, so a host with eight listings met
 * thirty-two buttons and the one they wanted was a quarter of a card wide.
 *
 * The other three moved to where they belong. The calendar is its own page
 * now, reached from the menu, because managing availability is something a
 * host does across dates rather than per listing. Bulk pricing is a dialog
 * inside that calendar, next to the dates it changes. And instant booking is
 * no longer a workflow at all — it is one switch on the listing, with the
 * calendar able to make an exception for a particular date.
 */
function ActiveResidence({
  residenceId,
  residenceType,
  displayType,
}: {
  residenceId: number;
  residenceType: ResidenceTypes_enum;
  displayType: I_Residence_display_type;
}) {
  const isRoom = residenceType === ResidenceTypes_enum.ROOM;
  // A boomgardi room is edited on its own route; everything else is a listing.
  const href = isRoom
    ? `/b-room/${residenceId}/edit`
    : `/residences/${residenceId}/edit?residenceType=${residenceType}`;

  // A boomgardi *parent* has no room-level editor of its own to offer here.
  if (displayType === "boomgardi" && isRoom) return null;

  return (
    <LinkButton
      href={href}
      isFullWidth
      rightIcon={<i className="icon-Edit text-22 text-black" />}
      color="grey"
      onClick={() => {
        applySessionStorageValues_residences_list({ residenceId, residenceType });
      }}
    >
      {isRoom ? "ویرایش اتاق" : "ویرایش اقامتگاه"}
    </LinkButton>
  );
}

export default ActiveResidence;
