
export const getPackages = async (packageName, version) => {
    const regex = /[^0-9.]/;
	const rawVersionNumber = regex.replaceAll(version, "");
    const res = await fetch(`${process.env.REACT_APP_BFF_URL}/npm/${packageName}/${rawVersionNumber}`);
    return await checkHttpStatus(res);
  };