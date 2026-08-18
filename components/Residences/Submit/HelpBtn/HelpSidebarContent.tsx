import { getAllowedValues } from "@/api/Residences/getAllowedValues";
import { SidebarCommonBody } from "@/components/General/Sidebar/SidebarCommonBody";
import { SidebarCommonHeader } from "@/components/General/Sidebar/SidebarCommonHeader";
import { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import { Steps_header_Title } from "@/constants/Residences/Submit/Steps_header_Title";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function HelpSidebarContent({ handleSidebarClose }: { handleSidebarClose: THandleSidebarClose }) {
  const { query } = useRouter();

  const { data } = useQuery(["getAllowedValues", query?.step], () =>
    getAllowedValues({ step: Number(query?.step as string) })
  );

  return (
    <div className="h-full">
      <SidebarCommonHeader
        headerText={Steps_header_Title[query?.step as string]}
        onClose={() => handleSidebarClose()}
      />

      <SidebarCommonBody>{data?.params?.help_text}</SidebarCommonBody>
    </div>
  );
}

export default HelpSidebarContent;
