function handleSSR401(destination: string) {
  return {
    redirect: {
      destination: `/auth/enter_phone?redirectTo=${destination}`,
      permanent: false,
    },
  };
}

export default handleSSR401;
