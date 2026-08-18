import { setAxiosToken } from "api/index";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

const handleSSAuth = function (ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) {
  const cookies = ctx.req.headers.cookie;
  if (!!cookies) {
    // console.log("cookies", cookies);
    const cookieItems: string[] = cookies.split(";");
    // console.log("cookieItems", cookieItems);
    const sessionIdCookie = cookieItems.find((cookieItem: string) =>
      cookieItem.includes("session_id")
    );
    if (!!sessionIdCookie) {
      //   console.log("sessionIdCookie", sessionIdCookie);
      const trimmedSessionIdCookie = sessionIdCookie.trim();
      const [_, sessionId] = trimmedSessionIdCookie.split("=");
      //   console.log("The actual sessionId: ", sessionId);

      // apiBuilder.set_SS_SessionId({ sessionId });
      setAxiosToken(sessionId);
      return sessionId;
    }
  }

  return null;
};

export default handleSSAuth;
